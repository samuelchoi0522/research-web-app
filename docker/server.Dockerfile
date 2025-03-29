# Create a build of the project
FROM gradle:8.12.1-jdk23 AS build
WORKDIR /build
COPY . .

RUN ./gradlew build --no-daemon -p .

# Copy the build artifacts
FROM openjdk:23
WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=docker,prod

COPY --from=build /build/build/libs/research_web_app-0.0.1-SNAPSHOT.jar app.jar

# Copy Google Cloud credentials into the container
COPY sharp-doodad-449020-j4-df078c8ac482.json /app/gcp-credentials.json

# Set environment variable to point to credentials
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-credentials.json

# Run the app
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
