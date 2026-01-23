package com.capston.project.back.end.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    private String sessionCode;
    private String message;
}
