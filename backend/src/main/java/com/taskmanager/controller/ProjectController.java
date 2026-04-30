package com.taskmanager.controller;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user.getRole() == User.Role.ADMIN) {
            return ResponseEntity.ok(projectRepository.findAll());
        }
        return ResponseEntity.ok(projectRepository.findProjectsByMemberOrCreator(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectDto dto, Authentication auth) {
        User creator = getCurrentUser(auth);
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setCreatedBy(creator);

        if (dto.getMemberIds() != null) {
            List<User> members = userRepository.findAllById(dto.getMemberIds());
            project.setMembers(members);
        } else {
            project.setMembers(new ArrayList<>());
        }

        return ResponseEntity.ok(projectRepository.save(project));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDto dto) {
        return projectRepository.findById(id).map(project -> {
            project.setName(dto.getName());
            project.setDescription(dto.getDescription());
            if (dto.getMemberIds() != null) {
                project.setMembers(userRepository.findAllById(dto.getMemberIds()));
            }
            return ResponseEntity.ok(projectRepository.save(project));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> addMember(@PathVariable Long id, @PathVariable Long userId) {
        Project project = projectRepository.findById(id).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        if (!project.getMembers().contains(user)) {
            project.getMembers().add(user);
        }
        return ResponseEntity.ok(projectRepository.save(project));
    }
}
