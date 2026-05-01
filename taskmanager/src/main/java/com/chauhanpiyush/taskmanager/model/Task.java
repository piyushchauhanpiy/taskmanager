package com.chauhanpiyush.taskmanager.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

  @Id
  private String id;

  @NonNull
  private String title;

  private String description;

  private String dueDate;

  private String priority;

  private String status;

  @NonNull
  private String assignedTo;

  @NonNull
  private String projectId;

  private String createdBy;
}
