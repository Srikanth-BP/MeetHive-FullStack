package com.meethive.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow frontend
public class LoginController {

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Map<String, String> response = new HashMap<>();

        if ("admin".equals(username) && "admin123".equals(password)) {
            response.put("role", "ADMIN");
            response.put("message", "Login successful");
        } else if ("user".equals(username) && "user123".equals(password)) {
            response.put("role", "USER");
            response.put("message", "Login successful");
        } else {
            response.put("role", "NONE");
            response.put("message", "Invalid credentials");
        }

        return response;
    }
}
