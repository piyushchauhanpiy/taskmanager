package com.chauhanpiyush.taskmanager.controller;

import com.chauhanpiyush.taskmanager.dto.*;
import com.chauhanpiyush.taskmanager.model.Task;
import com.chauhanpiyush.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {

  private final TaskService taskService;

  @PostMapping("/create")
  public Task createTask(@RequestBody CreateTaskRequest request,
      HttpServletRequest httpRequest) {
    String userId = (String) httpRequest.getAttribute("userId");
    System.out.println("=== Task Creation Debug ===");
    System.out.println("Title: " + request.getTitle());
    System.out.println("Description: " + request.getDescription());
    System.out.println("Due Date: " + request.getDueDate());
    System.out.println("Priority: " + request.getPriority());
    System.out.println("Assigned To Email: " + request.getAssignedToEmail());
    System.out.println("Project ID: " + request.getProjectId());
    System.out.println("Requester User ID: " + userId);

    Task task = taskService.createTask(request, userId);
    System.out.println("Task created with ID: " + task.getId());
    System.out.println("Task status: " + task.getStatus());
    System.out.println("========================");
    return task;
  }

  @PutMapping("/update-status")
  public Task updateStatus(@RequestBody UpdateTaskStatusRequest request,
      HttpServletRequest httpRequest) {
    String userId = (String) httpRequest.getAttribute("userId");
    return taskService.updateStatus(request, userId);
  }

  @GetMapping("/my-tasks")
  public List<TaskDTO> getMyTasks(HttpServletRequest httpRequest) {
    String userId = (String) httpRequest.getAttribute("userId");
    return taskService.getTasksByUserWithProject(userId);
  }

  @GetMapping("/created-by-me")
  public List<TaskDTO> getTasksCreatedByMe(HttpServletRequest httpRequest) {
    String userId = (String) httpRequest.getAttribute("userId");
    System.out.println("=== Fetching Tasks Created By Me ===");
    System.out.println("User ID: " + userId);
    List<TaskDTO> tasks = taskService.getTasksCreatedByUserWithProject(userId);
    System.out.println("Tasks created by user: " + tasks.size());
    System.out.println("==============================");
    return tasks;
  }

  @GetMapping("/project/{projectId}")
  public List<TaskDTO> getTasks(@PathVariable String projectId) {
    return taskService.getTasksByProjectWithProject(projectId);
  }
}