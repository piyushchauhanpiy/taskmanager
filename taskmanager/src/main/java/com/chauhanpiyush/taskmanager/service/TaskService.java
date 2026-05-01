package com.chauhanpiyush.taskmanager.service;

import com.chauhanpiyush.taskmanager.dto.CreateTaskRequest;
import com.chauhanpiyush.taskmanager.dto.UpdateTaskStatusRequest;
import com.chauhanpiyush.taskmanager.dto.TaskDTO;
import com.chauhanpiyush.taskmanager.model.Task;
import com.chauhanpiyush.taskmanager.model.Project;
import com.chauhanpiyush.taskmanager.model.User;
import com.chauhanpiyush.taskmanager.repository.TaskRepository;
import com.chauhanpiyush.taskmanager.repository.ProjectRepository;
import com.chauhanpiyush.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    // Create Task
    public Task createTask(CreateTaskRequest request, String userId) {
        System.out.println("=== TaskService Debug ===");
        System.out.println("Requester User ID: " + userId);
        System.out.println("Project ID: " + request.getProjectId());
        System.out.println("Assigned To Email: " + request.getAssignedToEmail());

        Project project = projectRepository.findById(request.getProjectId() != null ? request.getProjectId() : "")
                .orElseThrow(() -> new RuntimeException("Project not found"));

        System.out.println("Project found: " + project.getName());
        System.out.println("Project Admin ID: " + project.getAdminId());
        System.out.println("Is user admin? " + project.getAdminId().equals(userId));

        // Only admin can create task
        if (!project.getAdminId().equals(userId)) {
            System.out.println("ERROR: User is not admin of this project!");
            throw new RuntimeException("Only admin can create tasks");
        }

        // Find user by email to get user ID
        Optional<User> assignedUser = userRepository.findByEmail(request.getAssignedToEmail());
        if (!assignedUser.isPresent()) {
            System.out.println("ERROR: User with email " + request.getAssignedToEmail() + " not found!");
            throw new RuntimeException("User with email " + request.getAssignedToEmail() + " not found");
        }

        String assignedUserId = assignedUser.get().getId();
        System.out.println("Found user ID: " + assignedUserId);

        // Check if assigned user is a member of the project
        if (!project.getMembers().contains(assignedUserId)) {
            System.out.println("ERROR: User is not a member of this project!");
            throw new RuntimeException(
                    "User with email " + request.getAssignedToEmail() + " is not a member of this project");
        }

        Task task = Task.builder()
                .title(request.getTitle() != null ? request.getTitle() : "")
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .priority(request.getPriority() != null ? request.getPriority() : "Medium")
                .status("To Do")
                .assignedTo(assignedUserId != null ? assignedUserId : "")
                .projectId(request.getProjectId() != null ? request.getProjectId() : "")
                .createdBy(userId != null ? userId : "")
                .build();

        System.out.println("Task created successfully!");
        System.out.println("Task Title: " + task.getTitle());
        System.out.println("Task Status: " + task.getStatus());
        System.out.println("Task Assigned To: " + task.getAssignedTo());
        System.out.println("======================");

        return taskRepository.save(task);
    }

    // Update Status
    public Task updateStatus(UpdateTaskStatusRequest request, String userId) {

        Task task = taskRepository.findById(request.getTaskId() != null ? request.getTaskId() : "")
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Only assigned user can update
        if (!task.getAssignedTo().equals(userId)) {
            throw new RuntimeException("You can update only your task");
        }

        task.setStatus(request.getStatus() != null ? request.getStatus() : "To Do");

        return taskRepository.save(task);
    }

    // Get Tasks by User
    public List<Task> getTasksByUser(String userId) {
        return taskRepository.findByAssignedTo(userId);
    }

    // Get Tasks by Project
    public List<Task> getTasksByProject(String projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    // Get Tasks Created by User
    public List<Task> getTasksCreatedByUser(String userId) {
        return taskRepository.findByCreatedBy(userId);
    }

    // Helper method to convert Task to TaskDTO with project details
    private TaskDTO convertToTaskDTO(Task task) {
        TaskDTO.ProjectDTO projectDTO = null;

        // Fetch project details if projectId exists
        if (task.getProjectId() != null) {
            Optional<Project> project = projectRepository.findById(task.getProjectId());
            if (project.isPresent()) {
                Project p = project.get();
                projectDTO = TaskDTO.ProjectDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .adminId(p.getAdminId())
                        .build();
            }
        }

        // Get assigned user's email
        String assignedToEmail = null;
        if (task.getAssignedTo() != null) {
            Optional<User> assignedUser = userRepository.findById(task.getAssignedTo());
            if (assignedUser.isPresent()) {
                assignedToEmail = assignedUser.get().getEmail();
            }
        }

        return TaskDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .dueDate(task.getDueDate())
                .priority(task.getPriority())
                .status(task.getStatus())
                .assignedTo(task.getAssignedTo())
                .assignedToEmail(assignedToEmail)
                .projectId(task.getProjectId())
                .createdBy(task.getCreatedBy())
                .project(projectDTO)
                .build();
    }

    // Get Tasks by User (with project details)
    public List<TaskDTO> getTasksByUserWithProject(String userId) {
        List<Task> tasks = taskRepository.findByAssignedTo(userId);
        return tasks.stream()
                .map(this::convertToTaskDTO)
                .collect(Collectors.toList());
    }

    // Get Tasks Created by User (with project details)
    public List<TaskDTO> getTasksCreatedByUserWithProject(String userId) {
        List<Task> tasks = taskRepository.findByCreatedBy(userId);
        return tasks.stream()
                .map(this::convertToTaskDTO)
                .collect(Collectors.toList());
    }

    // Get Tasks by Project (with project details)
    public List<TaskDTO> getTasksByProjectWithProject(String projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .map(this::convertToTaskDTO)
                .collect(Collectors.toList());
    }
}
