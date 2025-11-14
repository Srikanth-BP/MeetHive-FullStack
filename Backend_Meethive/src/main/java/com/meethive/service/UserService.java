package com.meethive.service;

import com.meethive.entity.User;
import com.meethive.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Save or update user
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ✅ Get user by Email (returns Optional)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Block user
    public String blockUser(Long id) {
        Optional<User> userOpt = getUserById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setBlocked(true);
            userRepository.save(user);
            return "User " + user.getFullName() + " has been blocked.";
        }
        return "User not found!";
    }

    // Unblock user
    public String unblockUser(Long id) {
        Optional<User> userOpt = getUserById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setBlocked(false);
            userRepository.save(user);
            return "User " + user.getFullName() + " has been unblocked.";
        }
        return "User not found!";
    }
}
