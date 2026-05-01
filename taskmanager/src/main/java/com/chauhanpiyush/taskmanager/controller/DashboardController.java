package com.chauhanpiyush.taskmanager.controller;

import com.chauhanpiyush.taskmanager.model.Task;
import com.chauhanpiyush.taskmanager.repository.TaskRepository;
import com.chauhanpiyush.taskmanager.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

  private final TaskRepository taskRepository;

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(HttpServletRequest request) {
    String userId = (String) request.getAttribute("userId");

    // Get only tasks assigned to this user
    List<Task> tasks = taskRepository.findByAssignedTo(userId);

    long total = tasks.size();

    long done = tasks.stream()
        .filter(t -> "Done".equalsIgnoreCase(t.getStatus()))
        .count();

    long todo = tasks.stream()
        .filter(t -> "To Do".equalsIgnoreCase(t.getStatus()))
        .count();

    long inProgress = tasks.stream()
        .filter(t -> "In Progress".equalsIgnoreCase(t.getStatus()))
        .count();

    // Overdue tasks (tasks past due date that are not done)
    long overdue = tasks.stream()
        .filter(t -> t.getDueDate() != null)
        .filter(t -> t.getStatus() != null && !t.getStatus().equalsIgnoreCase("Done"))
        .filter(t -> {
          try {
            java.util.Date dueDate = java.sql.Date.valueOf(t.getDueDate());
            return dueDate.before(new java.util.Date());
          } catch (Exception e) {
            return false;
          }
        })
        .count();

    Map<String, Object> dashboardData = new HashMap<>();

    dashboardData.put("totalTasks", total);
    dashboardData.put("doneTasks", done);
    dashboardData.put("todoTasks", todo);
    dashboardData.put("inProgressTasks", inProgress);
    dashboardData.put("overdueTasks", overdue);

    return ResponseEntity.ok(ApiResponse.success(dashboardData, "Dashboard data retrieved successfully"));
  }
}