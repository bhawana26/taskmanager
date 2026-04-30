package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskDto {
    @NotBlank
    private String title;
    private String description;
    private String status;
    private String priority;
    private Long projectId;
    private Long assigneeId;
    private LocalDate dueDate;
}
