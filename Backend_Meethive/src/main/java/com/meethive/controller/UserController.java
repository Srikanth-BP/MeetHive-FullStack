package com.meethive.controller;

import com.meethive.entity.User;
import com.meethive.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users except ADMIN
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers().stream()
                .filter(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))
                .toList();
    }

    // Get single user by id
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // for safety, do not return password in plain text in production
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    // Block user
    @PatchMapping("/users/{id}/block")
    public String blockUser(@PathVariable Long id) {
        return userService.blockUser(id);
    }

    // Unblock user
    @PatchMapping("/users/{id}/unblock")
    public String unblockUser(@PathVariable Long id) {
        return userService.unblockUser(id);
    }

    // Update user profile
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updated) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        // Basic validation
        if (updated.getFullName() == null || updated.getFullName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Full name is required");
        }
        if (updated.getEmail() == null || updated.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (updated.getPassword() == null || updated.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }
        // check email uniqueness (if email changed)
        Optional<User> userByEmail = userService.getUserByEmail(updated.getEmail());
        if (userByEmail.isPresent() && !userByEmail.get().getId().equals(id)) {
            return ResponseEntity.status(409).body("Email already in use by another account");
        }

        // perform update
        User existing = userOpt.get();
        existing.setFullName(updated.getFullName().trim());
        existing.setEmail(updated.getEmail().trim());
        existing.setPassword(updated.getPassword()); // in prod: hash this!
        // do not allow changing role/isBlocked through this endpoint

        userService.saveUser(existing);

        return ResponseEntity.ok(existing);
    }
}
