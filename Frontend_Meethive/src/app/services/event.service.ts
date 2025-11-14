import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../model/event.model';

interface RsvpResponse {
  created?: boolean;
  cancelled?: boolean;
  count: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private baseUrl = 'http://localhost:8080/admin/events';
  private rsvpBase = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.baseUrl);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.baseUrl, event);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // create RSVP -> returns { created:true, count: N }
  rsvp(eventId: number, userId: number): Observable<RsvpResponse> {
    return this.http.post<RsvpResponse>(`${this.rsvpBase}/${eventId}/rsvp?userId=${userId}`, {});
  }

  // cancel RSVP -> returns { cancelled:true, count: N }
  cancelRsvp(eventId: number, userId: number): Observable<RsvpResponse> {
    return this.http.delete<RsvpResponse>(`${this.rsvpBase}/${eventId}/rsvp?userId=${userId}`);
  }

  // get event ids the user has RSVPed to
  getUserRsvps(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.rsvpBase}/user/${userId}/rsvps`);
  }
}
