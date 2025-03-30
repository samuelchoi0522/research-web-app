# Create a build of the project
FROM node:20 AS build
WORKDIR /build
COPY . .

# Ensure production env for correct .env file usage
ENV NODE_ENV=production

RUN npm install
RUN npm run build

# Copy the build artifacts
FROM node:20
WORKDIR /app
COPY --from=build /build .

# Run the app
ENTRYPOINT yarn start
