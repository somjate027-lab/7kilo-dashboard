FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

# Expose port 7860 (HF Spaces default)
EXPOSE 7860

# Set environment to production
ENV NODE_ENV=production

# Start the app
CMD ["serve", "-s", "dist", "-l", "7860"]
