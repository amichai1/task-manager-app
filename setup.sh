#!/bin/bash

echo "🚀 Starting Task Manager Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking project structure...${NC}"

# Create necessary directories if they don't exist
mkdir -p backend/config
mkdir -p backend/controllers
mkdir -p backend/middleware
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p frontend/src/components
mkdir -p frontend/src/pages
mkdir -p frontend/src/context
mkdir -p frontend/src/services
mkdir -p frontend/public

echo -e "${BLUE}📝 Creating environment files...${NC}"

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_super_secure_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
PORT=5000
BCRYPT_SALT_ROUNDS=12
EOF
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

# Create frontend .env file if it doesn't exist
if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Task Manager
CHOKIDAR_USEPOLLING=true
FAST_REFRESH=true
EOF
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists${NC}"
fi

# Create MongoDB initialization script
cat > mongo-init.js << 'EOF'
db = db.getSiblingDB('taskmanager');

// Create collections
db.createCollection('users');
db.createCollection('tasks');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.tasks.createIndex({ "user": 1, "createdAt": -1 });
db.tasks.createIndex({ "user": 1, "completed": 1 });
db.tasks.createIndex({ "user": 1, "priority": 1 });

print('Database initialized successfully');
EOF

echo -e "${GREEN}✅ Created MongoDB initialization script${NC}"

echo -e "${BLUE}🐳 Building and starting Docker containers...${NC}"

# Stop any existing containers
docker-compose down

# Build and start containers
if docker-compose up --build -d; then
    echo -e "${GREEN}✅ Docker containers started successfully!${NC}"
    
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 15
    
    echo -e "${GREEN}🎉 Task Manager is now running!${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend API: http://localhost:5000/api${NC}"
    echo -e "${BLUE}🗄️  MongoDB Express: http://localhost:8081${NC}"
    echo -e "${BLUE}📊 API Health: http://localhost:5000/api/health${NC}"
    echo ""
    echo -e "${YELLOW}📝 Default MongoDB Express credentials:${NC}"
    echo -e "${YELLOW}   Username: admin${NC}"
    echo -e "${YELLOW}   Password: admin123${NC}"
    echo ""
    echo -e "${GREEN}🚀 Setup completed successfully!${NC}"
    echo -e "${BLUE}📖 To view logs: docker-compose logs -f${NC}"
    echo -e "${BLUE}🛑 To stop: docker-compose down${NC}"
    
else
    echo -e "${RED}❌ Failed to start Docker containers${NC}"
    echo -e "${YELLOW}📋 Check the logs with: docker-compose logs${NC}"
    exit 1
fi