# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/taskmanager-*.jar app.jar

# Use dynamic port (IMPORTANT for Render)
ENV PORT=8080
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
