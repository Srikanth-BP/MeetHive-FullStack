package com.meethive.repository;

import com.meethive.entity.Rsvp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RsvpRepository extends JpaRepository<Rsvp, Long> {

    long countByEventId(Long eventId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    void deleteByEventIdAndUserId(Long eventId, Long userId);

    List<Rsvp> findByUserId(Long userId);

    List<Rsvp> findByEventId(Long eventId);
}
