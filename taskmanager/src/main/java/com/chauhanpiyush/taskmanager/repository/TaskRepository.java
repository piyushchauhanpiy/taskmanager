package com.chauhanpiyush.taskmanager.repository;

import com.chauhanpiyush.taskmanager.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {

    // Get all tasks of a specific project
    List<Task> findByProjectId(String projectId);

    // 🔥 Get tasks assigned to a specific user (for dashboard)
    List<Task> findByAssignedTo(String userId);

    // Get tasks created by a specific user
    List<Task> findByCreatedBy(String userId);
}