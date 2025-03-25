FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the server files
COPY . .

# Expose the port the server runs on
EXPOSE 3030

# Command to run when the container starts
CMD ["node", "server/server-direct.js"] 