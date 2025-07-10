import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi import Path as ApiPath  # ✅ renamed to avoid conflict
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, computed_field
from typing import Annotated, Literal, Optional
from db import collection, client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/about-page")
def serve_about():
    return FileResponse(FRONTEND_DIR / "about.html")

@app.get("/status")
def check_db():
    try:
        client.admin.command("ping")
        return {"status": "MongoDB connected ✅"}
    except Exception:
        return {"status": "MongoDB not connected ❌"}


class Patient(BaseModel):
    id: Annotated[str, Field(...)]
    name: Annotated[str, Field(...)]
    city: Annotated[str, Field(...)]
    age: Annotated[int, Field(..., gt=0, lt=120)]
    gender: Annotated[Literal['male', 'female', 'others'], Field(...)]
    height: Annotated[float, Field(..., gt=0)]
    weight: Annotated[float, Field(..., gt=0)]

    @computed_field
    @property
    def bmi(self) -> float:
        return round(self.weight / (self.height ** 2), 2)

    @computed_field
    @property
    def verdict(self) -> str:
        if self.bmi < 18.5:
            return 'Underweight'
        elif self.bmi < 30:
            return 'Normal'
        else:
            return 'Obese'


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    age: Optional[int] = Field(default=None, gt=0)
    gender: Optional[Literal['male', 'female', 'others']] = None
    height: Optional[float] = Field(default=None, gt=0)
    weight: Optional[float] = Field(default=None, gt=0)


@app.get("/about")
def about_api():
    return {'message': 'A fully functional API for patient records'}

@app.get("/home")
def home_api():
    return {'message': 'Patient Management System API'}

@app.get("/view")
def view():
    return list(collection.find({}, {"_id": 0}))

@app.get("/patient/{patient_id}")
def view_patient(patient_id: str = ApiPath(...)):  # ✅ fixed here
    patient = collection.find_one({"id": patient_id}, {"_id": 0})
    if patient:
        return patient
    raise HTTPException(status_code=404, detail='Record does not exist')

@app.get("/sort")
def sort_patient(sort_by: str = Query(...), order: str = Query('asc')):
    valid_fields = ['height', 'weight', 'bmi']
    if sort_by not in valid_fields:
        raise HTTPException(status_code=400, detail=f"Invalid field. Choose from {valid_fields}")
    if order not in ['asc', 'desc']:
        raise HTTPException(status_code=400, detail="Order must be 'asc' or 'desc'")
    direction = 1 if order == 'asc' else -1
    return list(collection.find({}, {"_id": 0}).sort(sort_by, direction))

@app.post("/create")
def create_patient(patient: Patient):
    if collection.find_one({"id": patient.id}):
        raise HTTPException(status_code=400, detail="Patient already exists")
    data = patient.model_dump()
    data["bmi"] = patient.bmi
    data["verdict"] = patient.verdict
    collection.insert_one(data)
    return JSONResponse(status_code=201, content={"message": "Patient created successfully"})

@app.put("/edit/{patient_id}")
def update_patient(patient_id: str, patient_update: PatientUpdate):
    existing = collection.find_one({"id": patient_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")

    updates = patient_update.model_dump(exclude_unset=True)
    height = updates.get("height", existing.get("height"))
    weight = updates.get("weight", existing.get("weight"))
    if height and weight:
        bmi = round(weight / (height ** 2), 2)
        updates["bmi"] = bmi
        updates["verdict"] = 'Underweight' if bmi < 18.5 else 'Normal' if bmi < 30 else 'Obese'

    collection.update_one({"id": patient_id}, {"$set": updates})
    return JSONResponse(status_code=200, content={"message": "Patient updated"})

@app.delete("/delete/{patient_id}")
def delete_patient(patient_id: str):
    result = collection.delete_one({"id": patient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient id not found")
    return JSONResponse(status_code=202, content="Patient deleted")
