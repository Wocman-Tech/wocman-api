# Use a lightweight Node.js image
FROM node:12.18.4-alpine

# Set working directory to /app
WORKDIR /app

# Set PATH for local node_modules binaries
ENV PATH /app/node_modules/.bin:$PATH

# Copy only package.json and package-lock.json to leverage Docker cache for dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the application source code
COPY . .

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]
