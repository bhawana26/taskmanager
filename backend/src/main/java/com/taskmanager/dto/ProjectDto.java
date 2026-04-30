package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ProjectDto {
    @NotBlank
    private String name;
    private String description;
    private List<Long> memberIds;
}
