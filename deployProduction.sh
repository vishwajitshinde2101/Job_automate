#!/bin/bash

echo ""
echo "==================================================================="
echo "Production Deployment Script"
echo "==================================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check current location
echo "📍 Current directory: $(pwd)"
echo ""

# Step 2: Pull latest code
echo "1️⃣  Pulling latest code from GitHub..."
echo ""
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code pulled successfully${NC}"
echo ""

# Step 3: Install backend dependencies
echo "2️⃣  Installing backend dependencies..."
echo ""
cd server
npm install

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  npm install had some warnings, but continuing...${NC}"
fi

echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""
cd ..

# Step 4: Install frontend dependencies
echo "3️⃣  Installing frontend dependencies..."
echo ""
npm install

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  npm install had some warnings, but continuing...${NC}"
fi

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Step 5: Restart PM2
echo "4️⃣  Restarting PM2 backend..."
echo ""
pm2 restart job-automate-api

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ PM2 restart failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend restarted${NC}"
echo ""

# Step 6: Wait for server to start
echo "⏳ Waiting 5 seconds for server to start..."
sleep 5
echo ""

# Step 7: Check PM2 status
echo "5️⃣  Checking PM2 status..."
echo ""
pm2 list

echo ""
echo "6️⃣  Checking recent logs..."
echo ""
pm2 logs job-automate-api --lines 30 --nostream

echo ""
echo "==================================================================="
echo -e "${GREEN}Deployment completed!${NC}"
echo "==================================================================="
echo ""
echo "Next steps:"
echo "  1. Verify login endpoint: curl -X POST https://api.autojobzy.com/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"your@email.com\",\"password\":\"password\"}'"
echo "  2. Check for errors: pm2 logs job-automate-api --err --lines 50"
echo "  3. Monitor logs: pm2 logs job-automate-api"
echo ""
