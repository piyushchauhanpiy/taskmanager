package com.chauhanpiyush.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {

    @NotBlank
    private String taskId;

    @NotBlank
    private String status;
}