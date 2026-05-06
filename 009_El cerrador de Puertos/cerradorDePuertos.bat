@echo off
echo Cerrando cualquier proceso que use el puerto 8085...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8085') do (
    echo Cerrando PID %%a...
    taskkill /PID %%a /F
)

echo.
echo Puerto 8085 liberado.
pause