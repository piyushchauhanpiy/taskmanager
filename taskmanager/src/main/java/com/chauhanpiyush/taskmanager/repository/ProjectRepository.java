package com.chauhanpiyush.taskmanager.repository;

import com.chauhanpiyush.taskmanager.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {

    List<Project> findByMembersContains(String userId);

    List<Project> findByAdminId(String adminId);
}