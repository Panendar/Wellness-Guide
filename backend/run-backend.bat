@echo off
REM Backend Setup and Run Script for Windows
echo ========================================
echo   Wellness Guide Backend Setup
echo ========================================
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org
    pause
    exit /b 1
)

echo [1/3] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully
) else (
    echo Virtual environment already exists
)

echo.
echo [2/3] Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat

REM Install requirements
python -m pip install -q --upgrade pip
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/3] Starting FastAPI backend server...
echo.
echo ========================================
echo   Backend running at http://localhost:8000
echo   API Documentation: http://localhost:8000/docs
echo ========================================
echo.

REM Run the backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
