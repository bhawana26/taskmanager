package com.taskmanager.repository;

import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(User user);

    @Query("SELECT p FROM Project p WHERE p.createdBy = :user OR :user MEMBER OF p.members")
    List<Project> findProjectsByMemberOrCreator(@Param("user") User user);
}
