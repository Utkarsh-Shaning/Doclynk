const baseURL = "http://127.0.0.1:8000";

// General-purpose API caller with patient card display
function callAPI(route) {
  fetch(`${baseURL}${route}`)
    .then(res => res.json())
    .then(data => {
      const output = document.getElementById("output");
      output.innerHTML = "";

      if (Array.isArray(data)) {
        data.forEach(patient => {
          output.innerHTML += `
            <div class="patient-card">
              <h3>${patient.name} <span class="badge">${patient.verdict}</span></h3>
              <p><strong>ID:</strong> ${patient.id}</p>
              <p><strong>City:</strong> ${patient.city}</p>
              <p><strong>Age:</strong> ${patient.age}</p>
              <p><strong>Gender:</strong> ${patient.gender}</p>
              <p><strong>Height:</strong> ${patient.height} m</p>
              <p><strong>Weight:</strong> ${patient.weight} kg</p>
              <p><strong>BMI:</strong> ${patient.bmi}</p>
            </div>
          `;
        });
      } else {
        output.innerText = JSON.stringify(data, null, 2);
      }
    })
    .catch(err => {
      document.getElementById("output").innerText = `❌ ${err.message}`;
    });
}

function getPatient() {
  const id = prompt("Enter patient ID:");
  if (!id) return;

  fetch(`${baseURL}/patient/${id}`)
    .then(res => {
      if (!res.ok) throw new Error("Patient not found");
      return res.json();
    })
    .then(data => {
      document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      document.getElementById("output").innerText = `❌ ${err.message}`;
    });
}

function sortPatients() {
  const sortBy = prompt("Sort by: height, weight, or bmi");
  const order = prompt("Order: asc or desc");
  if (!sortBy || !order) return;

  fetch(`${baseURL}/sort?sort_by=${sortBy}&order=${order}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      document.getElementById("output").innerText = `❌ ${err.message}`;
    });
}

function createPatient() {
  const patient = {
    id: prompt("Patient ID:"),
    name: prompt("Name:"),
    city: prompt("City:"),
    age: parseInt(prompt("Age:"), 10),
    gender: prompt("Gender (male/female/others):"),
    height: parseFloat(prompt("Height (m):")),
    weight: parseFloat(prompt("Weight (kg):"))
  };

  fetch(`${baseURL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient)
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      document.getElementById("output").innerText = `❌ Error creating patient`;
    });
}

function editPatient() {
  const id = prompt("Enter patient ID to update:");
  const updateData = {};

  if (confirm("Edit name?")) updateData.name = prompt("New name:");
  if (confirm("Edit city?")) updateData.city = prompt("New city:");
  if (confirm("Edit age?")) updateData.age = parseInt(prompt("New age:"), 10);
  if (confirm("Edit gender?")) updateData.gender = prompt("New gender:");
  if (confirm("Edit height?")) updateData.height = parseFloat(prompt("New height (m):"));
  if (confirm("Edit weight?")) updateData.weight = parseFloat(prompt("New weight (kg):"));

  fetch(`${baseURL}/edit/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData)
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      document.getElementById("output").innerText = `❌ Error updating patient`;
    });
}

function deletePatient() {
  const id = prompt("Enter patient ID to delete:");
  if (!id) return;

  fetch(`${baseURL}/delete/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      document.getElementById("output").innerText = `❌ Error deleting patient`;
    });
}
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dots = [];
const DOTS_COUNT = 100;

for (let i = 0; i < DOTS_COUNT; i++) {
  dots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < DOTS_COUNT; i++) {
    let dot = dots[i];
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#00f0ff";
    ctx.fill();

    for (let j = i + 1; j < DOTS_COUNT; j++) {
      let dx = dot.x - dots[j].x;
      let dy = dot.y - dots[j].y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(dot.x, dot.y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.1)";
        ctx.stroke();
      }
    }

    dot.x += dot.vx;
    dot.y += dot.vy;

    if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
    if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
  }

  requestAnimationFrame(draw);
}

draw();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

  function toggleCRUD() {
    const crudSection = document.getElementById("crud-buttons");
    if (crudSection.style.display === "none") {
      crudSection.style.display = "block";
    } else {
      crudSection.style.display = "none";
    }
  }

