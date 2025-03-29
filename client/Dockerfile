# Stage 1: Build the React app
FROM node:20 AS build
WORKDIR /app
COPY . .

# Ensure production env for correct .env file usage
ENV NODE_ENV=production

RUN npm install
RUN npm run build

# Stage 2: Serve the React build using 'serve'
FROM node:20 AS production
WORKDIR /app

# Install 'serve' globally
RUN npm install -g serve

# Copy only the built static files
COPY --from=build /app/build ./build

# Expose the port the app runs on
EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3000"]
