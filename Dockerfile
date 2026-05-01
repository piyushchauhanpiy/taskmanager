# Use official Maven image as parent
FROM maven:3.9-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY taskmanager/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY taskmanager/src ./src

# Build the application
RUN mvn clean package -DskipTests

# Use official OpenJDK image for runtime
FROM openjdk:11-jre

# Set working directory
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/taskmanager-*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
