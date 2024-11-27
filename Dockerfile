# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install the Angular CLI globally
RUN npm install -g @angular/cli

# Copy the rest of your application source code to the container
COPY . .

# Change the working directory to the Angular app's directory
WORKDIR /app/frontend

# Install Angular app's dependencies
RUN npm install

# Build the Angular app for production
RUN npm run prod-build

# Revert back to the main application directory
WORKDIR /app

# Expose the port your application will run on (adjust as needed)
EXPOSE 8000

# Start your application (adjust the command as needed)
CMD ["npm", "run", "dev"]
