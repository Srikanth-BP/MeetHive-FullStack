// filename: src/app/admin-dashboard/admin-dashboard.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  constructor(public router: Router) {}

  // Search & filter
  searchTerm = '';
  filterType: 'all' | 'upcoming' = 'all';

  // Form & state
  isCreating = false;
  isEditing = false;

  // Event model (keeps id to avoid TS issues)
  newEvent = this.emptyEvent();

  // Sample event list
  events = [
    {
      id: 1,
      title: 'Tech Conference',
      date: '2025-09-20',
      time: '10:00',
      venue: 'Hall A',
      description: 'Annual tech meet',
      rsvps: 12
    },
    {
      id: 2,
      title: 'Startup Pitch',
      date: '2025-09-25',
      time: '14:00',
      venue: 'Hall B',
      description: 'Pitch your startup idea',
      rsvps: 8
    }
  ];

  // Derived stats as getters (always up-to-date)
  get totalEvents() {
    return this.events.length;
  }

  get upcomingEvents() {
    const now = new Date();
    return this.events.filter(e => new Date(e.date) > now).length;
  }

  get totalRSVPs() {
    return this.events.reduce((s, e) => s + (e.rsvps || 0), 0);
  }

  // Helpers
  emptyEvent() {
    return {
      id: 0,
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      rsvps: 0
    };
  }

  // Called from template: open create form (for new event)
  startCreating() {
    this.isCreating = true;
    this.isEditing = false;
    this.newEvent = this.emptyEvent();
  }

  // Save a newly created event
  saveEvent() {
    if (!this.newEvent.title?.trim() || !this.newEvent.date) {
      // basic validation - require title and date
      return;
    }
    // assign unique id and push
    this.newEvent.id = Date.now();
    this.events = [...this.events, { ...this.newEvent }];
    this.isCreating = false;
    this.newEvent = this.emptyEvent();
  }

  // Prepare edit mode for an event
  editEvent(event: any) {
    this.isEditing = true;
    this.isCreating = true;
    this.newEvent = { ...event };
  }

  // Save updates to an existing event
  updateEvent() {
    if (!this.newEvent.id) return;
    const index = this.events.findIndex(e => e.id === this.newEvent.id);
    if (index !== -1) {
      const copy = [...this.events];
      copy[index] = { ...this.newEvent };
      this.events = copy;
    }
    this.isEditing = false;
    this.isCreating = false;
    this.newEvent = this.emptyEvent();
  }

  // Delete event by id
  deleteEvent(id: number) {
    this.events = this.events.filter(e => e.id !== id);
  }

  // Filtered list used by template
  filteredEvents() {
    let list = this.events;
    if (this.searchTerm?.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || (e.venue || '').toLowerCase().includes(q));
    }
    if (this.filterType === 'upcoming') {
      const now = new Date();
      list = list.filter(e => new Date(e.date) > now);
    }
    return list;
  }

  // Navigation helpers
  goToUsers() {
    // navigate to the users page route you use in your app
    // earlier we used '/admin/users' — adjust if your route is different
    this.router.navigate(['/admin/users']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
