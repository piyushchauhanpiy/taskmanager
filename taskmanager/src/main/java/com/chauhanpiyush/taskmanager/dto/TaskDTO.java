package com.chauhanpiyush.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {
    private String id;
    private String title;
    private String description;
    private String dueDate;
    private String priority;
    private String status;
    private String assignedTo;
    private String assignedToEmail;
    private String projectId;
    private String createdBy;
    private ProjectDTO project;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectDTO {
        private String id;
        private String name;
        private String description;
        private String adminId;
    }
}
