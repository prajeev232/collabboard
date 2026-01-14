package com.prajeev.collabboard.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class WipLimitExceededException extends RuntimeException {
    private final String code;
    private final int limit;

    public WipLimitExceededException(int limit) {
        super("WIP Limit reached (" + limit + ")");
        this.code = "WIP_LIMIT_REACHED";
        this.limit = limit;
    }

    public String getCode() {
        return code;
    }

    public int getLimit() {
        return limit;
    }
}
