# Use single-stage build for simplicity
FROM maven:3.8.4-openjdk-11

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/taskmanager-*.jar"]
