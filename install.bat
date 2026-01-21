@echo off
REM RightnetRadius Installation Script for Windows

echo.
echo ========================================
echo 🚀 RightnetRadius Installation
echo ========================================
echo.

REM Check if PHP is installed
where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PHP is not installed or not in PATH
    pause
    exit /b 1
)

echo Checking PHP version...
php -v

REM Install composer dependencies
echo.
echo Installing composer dependencies...
if not exist "vendor" (
    composer install
) else (
    composer update
)

REM Create environment file
echo.
echo Setting up .env file...
if not exist ".env" (
    copy .env.example .env
    php artisan key:generate
    echo ✓ .env created and key generated
) else (
    echo ⚠ .env already exists
)

REM Run migrations
echo.
echo Running database migrations...
php artisan migrate --force

REM Seed database
echo.
echo Seeding sample data...
php artisan db:seed --force

REM Create storage symlink
echo.
echo Creating storage directory...
if not exist "storage\app\public" (
    mkdir storage\app\public
)

REM Publish assets
echo.
echo Publishing assets...
php artisan vendor:publish --force 2>nul

echo.
echo ========================================
echo ✓ Installation complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Edit .env with your database credentials
echo 2. Configure RADIUS_DB_* for FreeRADIUS
echo 3. Configure MIKROTIK_API_* for MikroTik
echo 4. Run: php artisan serve
echo 5. Access: http://localhost:8000
echo.
echo Admin Login:
echo Email: admin@rightnet.local
echo Password: admin123
echo.
pause
