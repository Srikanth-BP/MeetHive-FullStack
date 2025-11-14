package com.meethive.controller;

import com.meethive.entity.Event;
import com.meethive.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/events")
@CrossOrigin(origins = "http://localhost:4200") // allow Angular frontend
public class AdminController {

    private final EventService eventService;

    public AdminController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody Event event) {
        // Additional defensive server-side check: date must not be in the past
        LocalDate today = LocalDate.now();
        if (event.getDate() != null && event.getDate().isBefore(today)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Event date cannot be in the past.");
        }

        // ensure rsvps defaults to 0 for newly created events
        event.setRsvps(0);
        Event saved = eventService.createEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody Event event) {
        // Prevent updating to a past date
        LocalDate today = LocalDate.now();
        if (event.getDate() != null && event.getDate().isBefore(today)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Event date cannot be in the past.");
        }

        try {
            Event updated = eventService.updateEvent(id, event);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
