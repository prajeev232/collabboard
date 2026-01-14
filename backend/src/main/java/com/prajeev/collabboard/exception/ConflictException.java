package com.prajeev.collabboard.exception;

public class ConflictException extends RuntimeException {
    private final String code;
    private final Object latest;

    public ConflictException(String code, String message, Object latest) {
        super(message);
        this.code = code;
        this.latest = latest;
    }

    public String getCode() {
        return code;
    }

    public Object getLatest() {
        return latest;
    }
}
