package com.meethive.repository;

import com.meethive.model.Signup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignupRepository extends JpaRepository<Signup, Long> {
    boolean existsByEmail(String email);
}
