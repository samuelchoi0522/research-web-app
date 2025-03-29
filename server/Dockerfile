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

# Run the app
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
