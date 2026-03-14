@echo off
echo Starting SmartHire...
start cmd /k "cd backend && npm run dev"
timeout /t 3
start cmd /k "cd frontend && npm run dev"
echo SmartHire started!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
