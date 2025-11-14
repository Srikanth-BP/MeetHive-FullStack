import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../model/event.model';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-events.html',
  styleUrls: ['./my-events.css']
})
export class MyEventsComponent {
  myEvents: Event[] = [];

  constructor(private router: Router, private eventService: EventService) {
    const navState = history.state;
    if (navState && navState.myEvents) {
      // clone to avoid mutating the dashboard instance directly
      this.myEvents = navState.myEvents.map((e: Event) => ({ ...e }));
    } else {
      this.loadFromServer();
    }
  }

  private loadFromServer() {
    const userId = Number(localStorage.getItem('userId') || 0);
    if (!userId) { this.myEvents = []; return; }

    // fetch events and filter by user's rsvps
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.eventService.getUserRsvps(userId).subscribe({
          next: (ids) => {
            const idSet = new Set(ids);
            this.myEvents = events.filter(ev => idSet.has(ev.id));
          },
          error: (err) => {
            console.error('Failed to load user rsvps:', err);
            this.myEvents = [];
          }
        });
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.myEvents = [];
      }
    });
  }

  cancelRSVP(event: Event) {
    const userId = Number(localStorage.getItem('userId') || 0);
    if (!userId) {
      alert('Please login to cancel RSVP.');
      return;
    }

    if (!event || typeof event.id !== 'number') {
      console.error('Invalid event or missing id:', event);
      alert('Invalid event. Cannot cancel.');
      return;
    }

    // prevent double clicks
    if ((event as any).__rsvpPending) return;
    (event as any).__rsvpPending = true;

    this.eventService.cancelRsvp(Number(event.id), userId).subscribe({
      next: (res) => {
        // Backend returns { cancelled: true, count: N } (see controller)
        console.log('Cancel RSVP response:', res);
        (event as any).__rsvpPending = false;

        // remove from myEvents UI
        this.myEvents = this.myEvents.filter(e => e.id !== event.id);

        // Optional: inform user
        // alert('RSVP cancelled'); // uncomment if you want a popup

        // Optional: refresh global events (so admin/dashboard counts update on next visit)
        // this.router.navigate(['/user-dashboard']); // or call an event reload flow
      },
      error: (err) => {
        (event as any).__rsvpPending = false;
        console.error('Error cancelling RSVP:', err);

        // show more helpful message to the user
        let msg = 'Failed to cancel RSVP. Try again.';
        try {
          // if backend returned JSON with error message, show it
          if (err?.error) {
            // err.error might be object or string
            msg = typeof err.error === 'string' ? err.error : (err.error.error || JSON.stringify(err.error));
          } else if (err?.status) {
            msg += ` (status ${err.status})`;
          }
        } catch (e) {
          // ignore parse errors
        }

        alert(msg);
      }
    });
  }

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }
}
