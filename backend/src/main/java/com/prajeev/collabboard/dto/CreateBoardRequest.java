package com.prajeev.collabboard.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateBoardRequest (@NotBlank String name) {}