package com.prajeev.collabboard.exception;

public class ForbiddenException extends RuntimeException{
    private String code;

    public ForbiddenException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
