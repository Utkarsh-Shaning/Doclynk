cd backend
D:\Doclynk\venv\Scripts\Activate.ps1
Start-Process powershell -ArgumentList "uvicorn mainn:app --reload" -NoNewWindow
Start-Sleep -Seconds 2
ssh -p 443 -R0:localhost:8000 qr@a.pinggy.io
