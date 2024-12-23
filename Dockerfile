# Use the latest LTS version of Node.js (or specify a fixed version if needed)
FROM node:18-alpine

# Set working directory to /app
WORKDIR /app

# Set PATH for local node_modules binaries
ENV PATH /app/node_modules/.bin:$PATH

# Copy only package.json and package-lock.json to leverage Docker cache for dependencies
COPY package*.json ./

# Install production dependencies using npm ci for deterministic builds
RUN npm ci --production

# Copy the application source code
COPY . .

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]
