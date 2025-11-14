import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Event } from '../model/event.model';
import { News } from '../model/news.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient) {}

  searchTerm = '';
  filterType: 'all' | 'upcoming' = 'all';
  isCreating = false;
  isEditing = false;
  isPostingNews = false;

  newEvent: Event = this.emptyEvent();
  newNews = '';
  newsList: News[] = [];
  events: Event[] = [];
  filteredEvents: Event[] = [];
  errors: any = {};

  private eventsApiUrl = 'http://localhost:8080/admin/events';
  private newsApiUrl = 'http://localhost:8080/admin/news';

  ngOnInit() {
    this.loadEvents();
    this.loadNews();
  }

  emptyEvent(): Event {
    return { id: 0, title: '', date: '', time: '', venue: '', description: '', rsvps: 0 };
  }

  /** Validation */
  validateEventInput(ev: Event): boolean {
    this.errors = {};
    let valid = true;

    if (!ev.title || !ev.title.trim()) {
      this.errors.title = 'Title is required';
      valid = false;
    }

    if (!ev.date || !ev.date.toString().trim()) {
      this.errors.date = 'Date is required';
      valid = false;
    } else {
      const inputDate = new Date(ev.date);
      const today = new Date();
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (inputDate.getTime() < today.getTime()) {
        this.errors.date = 'Date cannot be in the past';
        valid = false;
      }
    }

    if (!ev.time || !ev.time.trim()) {
      this.errors.time = 'Time is required';
      valid = false;
    }

    if (!ev.venue || !ev.venue.trim()) {
      this.errors.venue = 'Venue is required';
      valid = false;
    }

    if (!ev.description || !ev.description.trim()) {
      this.errors.description = 'Description is required';
      valid = false;
    }

    return valid;
  }

  /** EVENTS **/
  loadEvents() {
    this.http.get<Event[]>(this.eventsApiUrl).subscribe({
      next: (data) => {
        this.events = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error loading events', err)
    });
  }

  saveEvent() {
    if (!this.validateEventInput(this.newEvent)) return;

    const eventToSave: any = { ...this.newEvent };
    delete eventToSave.id;
    eventToSave.rsvps = 0;

    this.http.post<Event>(this.eventsApiUrl, eventToSave).subscribe({
      next: (savedEvent) => {
        this.events.push(savedEvent);
        this.applyFilter();
        this.isCreating = false;
        this.newEvent = this.emptyEvent();
        this.errors = {};
      },
      error: (err) => {
        console.error('Error saving event', err);
        this.errors.general = err?.error || 'Server error creating event';
      }
    });
  }

  updateEvent() {
    if (!this.validateEventInput(this.newEvent)) return;
    if (!this.newEvent.id) return;

    this.http.put<Event>(`${this.eventsApiUrl}/${this.newEvent.id}`, this.newEvent).subscribe({
      next: (updated) => {
        const idx = this.events.findIndex(e => e.id === updated.id);
        if (idx !== -1) this.events[idx] = updated;
        this.applyFilter();
        this.isCreating = false;
        this.isEditing = false;
        this.newEvent = this.emptyEvent();
        this.errors = {};
      },
      error: (err) => {
        console.error('Error updating event', err);
        this.errors.general = err?.error || 'Server error updating event';
      }
    });
  }

  cancelForm() {
    this.isCreating = false;
    this.isEditing = false;
    this.newEvent = this.emptyEvent();
    this.errors = {};
  }

  deleteEvent(id: number) {
    this.http.delete<void>(`${this.eventsApiUrl}/${id}`).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== id);
        this.applyFilter();
      },
      error: (err) => console.error('Error deleting event', err)
    });
  }

  /** NEWS **/
  loadNews() {
    this.http.get<News[]>(this.newsApiUrl).subscribe({
      next: (data) =>
        this.newsList = data.sort(
          (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        ),
      error: (err) => console.error('Error loading news', err)
    });
  }

  postNews() {
    if (!this.newNews.trim()) return;
    const newsToPost: News = { message: this.newNews };

    this.http.post<News>(this.newsApiUrl, newsToPost).subscribe({
      next: (saved) => {
        this.newsList.unshift(saved);
        this.newNews = '';
        this.isPostingNews = false;
      },
      error: (err) => console.error('Error posting news', err)
    });
  }

  // accept undefined id defensively (template can pass undefined)
  deleteNews(id?: number) {
    if (!id) {
      console.warn('deleteNews called without id');
      return;
    }
    this.http.delete<void>(`${this.newsApiUrl}/${id}`).subscribe({
      next: () => this.newsList = this.newsList.filter(n => n.id !== id),
      error: (err) => console.error('Error deleting news', err)
    });
  }

  /** UI / FILTER **/
  startCreating() {
    this.isCreating = true;
    this.isEditing = false;
    this.newEvent = this.emptyEvent();
    this.errors = {};
  }

  editEvent(event: Event) {
    this.isEditing = true;
    this.isCreating = true;
    const evCopy: any = { ...event };
    if (evCopy.date && typeof evCopy.date !== 'string') {
      const d = new Date(evCopy.date);
      evCopy.date = d.toISOString().slice(0, 10);
    }
    this.newEvent = evCopy;
    this.errors = {};
  }

  get totalEvents() { return this.events.length; }
  get upcomingEvents() {
    const now = new Date();
    return this.events.filter(e => new Date(e.date) > now).length;
  }
  get totalRSVPs() { return this.events.reduce((s, e) => s + (e.rsvps || 0), 0); }

  applyFilter() {
    let list = this.events;
    if (this.searchTerm?.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) || (e.venue || '').toLowerCase().includes(q)
      );
    }
    if (this.filterType === 'upcoming') {
      const now = new Date();
      list = list.filter(e => new Date(e.date) > now);
    }
    this.filteredEvents = list;
  }

  toggleNewsForm() { this.isPostingNews = !this.isPostingNews; }

  goToUsers() { this.router.navigate(['/admin/users']); }
  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    this.router.navigate(['/login']);
  }
}
