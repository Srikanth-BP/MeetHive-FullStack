package com.meethive.controller;

import com.meethive.entity.User;
import com.meethive.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "http://localhost:4200")
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        Optional<User> userOpt = userService.getUserByEmail(loginUser.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.isBlocked()) {
                Map<String, String> body = new HashMap<>();
                body.put("status", "USER_BLOCKED");
                return ResponseEntity.status(403).body(body);
            }
            if (user.getPassword().equals(loginUser.getPassword())) {
                Map<String, Object> body = new HashMap<>();
                body.put("status", "OK");
                body.put("id", user.getId());
                body.put("role", user.getRole());
                body.put("fullName", user.getFullName());
                return ResponseEntity.ok(body);
            } else {
                Map<String, String> body = new HashMap<>();
                body.put("status", "INVALID_PASSWORD");
                return ResponseEntity.status(401).body(body);
            }
        } else {
            Map<String, String> body = new HashMap<>();
            body.put("status", "USER_NOT_FOUND");
            return ResponseEntity.status(404).body(body);
        }
    }
}
