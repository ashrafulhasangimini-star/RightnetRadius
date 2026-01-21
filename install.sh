#!/bin/bash

# RightnetRadius Installation Script
# This script sets up the ISP management system

set -e

echo "🚀 RightnetRadius Installation Script"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check PHP version
echo -e "${YELLOW}Checking PHP version...${NC}"
PHP_VERSION=$(php -r 'echo phpversion();')
echo "PHP Version: $PHP_VERSION"

# Install composer dependencies
echo -e "${YELLOW}Installing composer dependencies...${NC}"
if [ ! -d "vendor" ]; then
    composer install
else
    composer update
fi

# Create environment file
echo -e "${YELLOW}Setting up .env file...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
    echo -e "${GREEN}✓ .env created and key generated${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists${NC}"
fi

# Create database
echo -e "${YELLOW}Creating database...${NC}"
DB_NAME=$(grep DB_DATABASE .env | cut -d '=' -f2)
DB_USER=$(grep DB_USERNAME .env | cut -d '=' -f2)
DB_PASS=$(grep DB_PASSWORD .env | cut -d '=' -f2)

# Note: This requires MySQL/MariaDB to be running
# Uncomment to enable automatic database creation:
# mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
php artisan migrate --force

# Seed database
echo -e "${YELLOW}Seeding sample data...${NC}"
php artisan db:seed --force

# Create storage symlink
echo -e "${YELLOW}Creating storage symlink...${NC}"
php artisan storage:link 2>/dev/null || true

# Set permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chmod -R 775 storage bootstrap/cache

# Publish assets
echo -e "${YELLOW}Publishing assets...${NC}"
php artisan vendor:publish --force 2>/dev/null || true

echo -e "${GREEN}✓ Installation complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Edit .env with your actual database credentials"
echo "2. Configure RADIUS_DB_* for FreeRADIUS"
echo "3. Configure MIKROTIK_API_* for MikroTik"
echo "4. Run: php artisan serve"
echo "5. Access: http://localhost:8000"
echo ""
echo "Admin Login:"
echo "Email: admin@rightnet.local"
echo "Password: admin123"
echo ""
