import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboardComponent {
  constructor(public router: Router) {}

  events = [
    { title: 'Tech Conference', date: '2025-09-20', time: '10:00 AM', venue: 'Hall A', rsvp: false },
    { title: 'AI Workshop', date: '2025-10-05', time: '02:00 PM', venue: 'Hall B', rsvp: false },
    { title: 'Hackathon', date: '2025-10-20', time: '09:00 AM', venue: 'Hall C', rsvp: false }
  ];

  myEvents: any[] = [];

  rsvp(event: any) {
    event.rsvp = true;
    if (!this.myEvents.includes(event)) {
      this.myEvents.push(event);
    }
  }

  goToMyEvents() {
    this.router.navigate(['/my-events'], { state: { myEvents: this.myEvents } });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
