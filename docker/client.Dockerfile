# Create a build of the project
FROM node:20 AS build
WORKDIR /build
COPY . .

RUN npm install
RUN npm run build

# Copy the build artifacts
FROM node:20
WORKDIR /app
COPY --from=build /build .

# Run the app
ENTRYPOINT exec npm start
