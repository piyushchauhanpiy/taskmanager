package com.chauhanpiyush.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddMemberRequest {

  @NotBlank
  private String projectId;

  @Email
  private String email;
}