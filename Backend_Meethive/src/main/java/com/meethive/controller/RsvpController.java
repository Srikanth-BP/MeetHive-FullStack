package com.meethive.controller;

import com.meethive.service.RsvpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200")
public class RsvpController {

    private final RsvpService rsvpService;

    public RsvpController(RsvpService rsvpService) {
        this.rsvpService = rsvpService;
    }

    // POST /api/events/{id}/rsvp?userId=123
    @PostMapping("/{id}/rsvp")
    public ResponseEntity<?> rsvp(@PathVariable("id") Long eventId,
                                  @RequestParam(value="userId", required=false) Long userId,
                                  @RequestBody(required = false) UserIdPayload body) {
        Long uid = userId;
        if (uid == null && body != null) uid = body.getUserId();
        if (uid == null) return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));

        try {
            long count = rsvpService.createRsvpAndGetCount(eventId, uid);
            return ResponseEntity.ok(Map.of("created", true, "count", count));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    // DELETE /api/events/{id}/rsvp?userId=123
    @DeleteMapping("/{id}/rsvp")
    public ResponseEntity<?> cancelRsvp(@PathVariable("id") Long eventId, @RequestParam("userId") Long userId) {
        try {
            long count = rsvpService.cancelRsvpAndGetCount(eventId, userId);
            return ResponseEntity.ok(Map.of("cancelled", true, "count", count));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Server error"));
        }
    }

    // GET /api/events/user/{userId}/rsvps -> list of event ids
    @GetMapping("/user/{userId}/rsvps")
    public ResponseEntity<List<Long>> getUserRsvps(@PathVariable("userId") Long userId) {
        List<Long> ids = rsvpService.getEventIdsForUser(userId);
        return ResponseEntity.ok(ids);
    }

    public static class UserIdPayload {
        private Long userId;
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }
}
