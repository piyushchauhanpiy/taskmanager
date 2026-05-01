package com.chauhanpiyush.taskmanager.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

  @Id
  private String id;

  @NonNull
  private String name;

  private String description;

  @NonNull
  private String adminId;

  private List<String> members;
}
