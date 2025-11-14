package com.meethive.service;

import com.meethive.entity.Rsvp;
import com.meethive.entity.Event;
import com.meethive.entity.User;
import com.meethive.repository.RsvpRepository;
import com.meethive.repository.EventRepository;
import com.meethive.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RsvpService {

    private final RsvpRepository rsvpRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RsvpService(RsvpRepository rsvpRepository,
                       EventRepository eventRepository,
                       UserRepository userRepository) {
        this.rsvpRepository = rsvpRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public long countByEventId(Long eventId) {
        return rsvpRepository.countByEventId(eventId);
    }

    public boolean userHasRsvped(Long eventId, Long userId) {
        return rsvpRepository.existsByEventIdAndUserId(eventId, userId);
    }

    /**
     * Creates an RSVP if not present. Returns the current RSVP count for the event.
     * Marked transactional so save runs inside transaction.
     */
    @Transactional
    public long createRsvpAndGetCount(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (rsvpRepository.existsByEventIdAndUserId(eventId, userId)) {
            // already exists - simply return current count
            return rsvpRepository.countByEventId(eventId);
        }

        Rsvp r = new Rsvp();
        r.setEvent(event);
        r.setUser(user);
        try {
            rsvpRepository.save(r);
        } catch (DataIntegrityViolationException ex) {
            // unique constraint raced - someone else inserted; ignore and return current count
        }
        return rsvpRepository.countByEventId(eventId);
    }

    /**
     * Cancels RSVP (delete) and returns current count after deletion.
     * Marked transactional so delete runs inside transaction.
     */
    @Transactional
    public long cancelRsvpAndGetCount(Long eventId, Long userId) {
        if (rsvpRepository.existsByEventIdAndUserId(eventId, userId)) {
            rsvpRepository.deleteByEventIdAndUserId(eventId, userId);
        }
        return rsvpRepository.countByEventId(eventId);
    }

    public List<Long> getEventIdsForUser(Long userId) {
        return rsvpRepository.findByUserId(userId)
                .stream().map(r -> r.getEvent().getId()).collect(Collectors.toList());
    }
}
