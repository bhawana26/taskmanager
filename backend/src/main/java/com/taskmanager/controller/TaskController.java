package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.model.Project;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user.getRole() == User.Role.ADMIN) {
            return ResponseEntity.ok(taskRepository.findAll());
        }
        List<Project> myProjects = projectRepository.findProjectsByMemberOrCreator(user);
        return ResponseEntity.ok(taskRepository.findByProjectIn(myProjects));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Task>> getMyTasks(Authentication auth) {
        User user = getCurrentUser(auth);
        return ResponseEntity.ok(taskRepository.findByAssignee(user));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Task>> getOverdueTasks(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user.getRole() == User.Role.ADMIN) {
            return ResponseEntity.ok(taskRepository.findOverdueTasks(LocalDate.now()));
        }
        return ResponseEntity.ok(taskRepository.findOverdueTasksByUser(user, LocalDate.now()));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        return ResponseEntity.ok(taskRepository.findByProject(project));
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskDto dto, Authentication auth) {
        User creator = getCurrentUser(auth);
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setCreatedBy(creator);
        task.setDueDate(dto.getDueDate());

        if (dto.getStatus() != null) task.setStatus(Task.Status.valueOf(dto.getStatus()));
        if (dto.getPriority() != null) task.setPriority(Task.Priority.valueOf(dto.getPriority()));
        if (dto.getProjectId() != null) {
            task.setProject(projectRepository.findById(dto.getProjectId()).orElseThrow());
        }
        if (dto.getAssigneeId() != null) {
            task.setAssignee(userRepository.findById(dto.getAssigneeId()).orElseThrow());
        }

        return ResponseEntity.ok(taskRepository.save(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody TaskDto dto, Authentication auth) {
        return taskRepository.findById(id).map(task -> {
            if (dto.getTitle() != null) task.setTitle(dto.getTitle());
            if (dto.getDescription() != null) task.setDescription(dto.getDescription());
            if (dto.getStatus() != null) task.setStatus(Task.Status.valueOf(dto.getStatus()));
            if (dto.getPriority() != null) task.setPriority(Task.Priority.valueOf(dto.getPriority()));
            if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
            if (dto.getAssigneeId() != null) {
                task.setAssignee(userRepository.findById(dto.getAssigneeId()).orElse(null));
            }
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        return taskRepository.findById(id).map(task -> {
            task.setStatus(Task.Status.valueOf(body.get("status")));
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
