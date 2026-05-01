package com.chauhanpiyush.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTaskRequest {

  @NotBlank
  private String title;

  private String description;

  private String dueDate;

  private String priority;

  @NotBlank
  private String assignedToEmail;

  @NotBlank
  private String projectId;
}