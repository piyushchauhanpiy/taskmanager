package com.chauhanpiyush.taskmanager.controller;

import com.chauhanpiyush.taskmanager.dto.*;
import com.chauhanpiyush.taskmanager.model.Project;
import com.chauhanpiyush.taskmanager.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  // For now userId manually pass karenge (JWT later)

  @PostMapping("/create")
  public Project createProject(@RequestBody CreateProjectRequest request,
      HttpServletRequest httpRequest) {
    String userId = (String) httpRequest.getAttribute("userId");
    System.out.println("Creating project with name: " + request.getName());
    System.out.println("Description: " + request.getDescription());
    System.out.println("User ID: " + userId);
    Project project = projectService.createProject(request, userId);
    System.out.println("Project created with ID: " + project.getId());
    return project;
  }

  @PostMapping("/add-member")
  public Project addMember(@RequestBody AddMemberRequest request,
      HttpServletRequest httpRequest) {
    String userId = (String) httpRequest.getAttribute("userId");
    System.out.println("Adding member with email: " + request.getEmail());
    System.out.println("To project ID: " + request.getProjectId());
    System.out.println("Requested by user: " + userId);
    Project project = projectService.addMember(request, userId);
    System.out.println("Member added successfully. Total members: " + project.getMembers().size());
    return project;
  }

  @GetMapping("/my-projects")
  public List<Project> getMyProjects(HttpServletRequest request) {
    String userId = (String) request.getAttribute("userId");
    return projectService.getMyProjects(userId);
  }

  @GetMapping("/admin-projects")
  public List<Project> getAdminProjects(HttpServletRequest request) {
    String userId = (String) request.getAttribute("userId");
    System.out.println("=== Admin Projects Debug ===");
    System.out.println("User ID: " + userId);
    List<Project> adminProjects = projectService.getAdminProjects(userId);
    System.out.println("Admin projects found: " + adminProjects.size());
    for (Project project : adminProjects) {
      System.out.println("- " + project.getName() + " (ID: " + project.getId() + ")");
    }
    System.out.println("==========================");
    return adminProjects;
  }
}