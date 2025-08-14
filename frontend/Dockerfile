FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (without build tools for now)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the app
#RUN npm run build

# Use serve to serve the built app
#RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
#CMD ["serve", "-s", "build", "-l", "3000"]
CMD ["npm", "start"]