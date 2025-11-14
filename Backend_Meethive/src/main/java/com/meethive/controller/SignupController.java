package com.meethive.controller;

import com.meethive.entity.User;
import com.meethive.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class SignupController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public String signup(@RequestBody User user) {
        if (userService.getUserByEmail(user.getEmail()).isPresent()) {
            return "Email already exists!";
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER"); // default role
        }
        userService.saveUser(user);
        return "Signup successful!";
    }
}
