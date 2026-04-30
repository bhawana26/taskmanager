package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.assignee = :user AND t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasksByUser(@Param("user") User user, @Param("today") LocalDate today);

    List<Task> findByProjectIn(List<Project> projects);
}
