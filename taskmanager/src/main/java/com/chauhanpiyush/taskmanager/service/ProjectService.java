package com.chauhanpiyush.taskmanager.service;

import com.chauhanpiyush.taskmanager.dto.CreateProjectRequest;
import com.chauhanpiyush.taskmanager.dto.AddMemberRequest;
import com.chauhanpiyush.taskmanager.model.Project;
import com.chauhanpiyush.taskmanager.model.User;
import com.chauhanpiyush.taskmanager.repository.ProjectRepository;
import com.chauhanpiyush.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;

  // Create Project
  public Project createProject(CreateProjectRequest request, String userId) {

    Project project = Project.builder()
        .name(request.getName())
        .description(request.getDescription())
        .adminId(userId)
        .members(new ArrayList<>(List.of(userId)))
        .build();

    return projectRepository.save(project);
  }

  // Add Member
  public Project addMember(AddMemberRequest request, String userId) {

    Project project = projectRepository.findById(request.getProjectId())
        .orElseThrow(() -> new RuntimeException("Project not found"));

    if (!project.getAdminId().equals(userId)) {
      throw new RuntimeException("Only admin can add members");
    }

    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (project.getMembers().contains(user.getId())) {
      throw new RuntimeException("User already added");
    }

    project.getMembers().add(user.getId());

    return projectRepository.save(project);
  }

  // Get Projects for User
  public List<Project> getMyProjects(String userId) {
    return projectRepository.findByMembersContains(userId);
  }

  // Get Projects where User is Admin
  public List<Project> getAdminProjects(String userId) {
    return projectRepository.findByAdminId(userId);
  }
}
