package com.prajeev.collabboard.realtime;

import java.util.UUID;

public record AfterCommitEvent(UUID txId) {
}
