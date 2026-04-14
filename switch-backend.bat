@echo off
:: Cambia entre backend Spring Boot y Node.js
:: Uso: switch-backend.bat [spring|node]

set BACKEND=%1

if "%BACKEND%"=="" (
    for /f "tokens=2 delims==" %%a in ('findstr "COMPOSE_PROFILES" .env') do set CURRENT=%%a
    echo Backend actual: %CURRENT%
    echo.
    echo Uso: %0 [spring^|node]
    echo   spring  -^> Spring Boot ^(Java 21^)
    echo   node    -^> Node.js ^(Express^)
    exit /b 1
)

if not "%BACKEND%"=="spring" if not "%BACKEND%"=="node" (
    echo Error: usa "spring" o "node"
    exit /b 1
)

echo Cambiando a backend: %BACKEND%

:: Actualizar .env
powershell -Command "(Get-Content .env) -replace 'COMPOSE_PROFILES=.*', 'COMPOSE_PROFILES=%BACKEND%' | Set-Content .env"
echo .env actualizado

:: Detener backend anterior
docker stop fct_backend 2>nul
docker rm fct_backend 2>nul

echo Levantando backend %BACKEND%...
docker compose --profile %BACKEND% up -d --build

echo.
echo Backend %BACKEND% activo en http://localhost:3050
echo Health: http://localhost:3050/api/health
