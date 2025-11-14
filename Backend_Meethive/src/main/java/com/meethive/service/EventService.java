package com.meethive.service;

import com.meethive.entity.Event;
import com.meethive.repository.EventRepository;
import com.meethive.repository.RsvpRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final RsvpRepository rsvpRepository;

    public EventService(EventRepository eventRepository, RsvpRepository rsvpRepository) {
        this.eventRepository = eventRepository;
        this.rsvpRepository = rsvpRepository;
    }

    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        // replace the rsvps field with actual count from rsvps table
        for (Event e : events) {
            long c = rsvpRepository.countByEventId(e.getId());
            e.setRsvps((int)c);
        }
        return events;
    }

    public Event createEvent(Event event) {
        event.setId(null);
        event.setRsvps(0);
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event event) {
        return eventRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(event.getTitle());
                    existing.setDate(event.getDate());
                    existing.setTime(event.getTime());
                    existing.setVenue(event.getVenue());
                    existing.setDescription(event.getDescription());
                    // do not overwrite rsvps here — it is computed from rsvps table
                    return eventRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Event not found with id " + id));
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
