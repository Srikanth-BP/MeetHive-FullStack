import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../services/event.service';
import { Event } from '../model/event.model';
import { NewsService, News } from '../services/news.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboardComponent implements OnInit {
  searchText = '';
  events: Event[] = [];
  myEvents: Event[] = [];
  newsList: News[] = [];

  currentMonthIndex = new Date().getMonth();
  currentYear = new Date().getFullYear();
  currentMonth = new Date(this.currentYear, this.currentMonthIndex).toLocaleString('default', { month: 'long' });
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDates: Date[] = [];

  constructor(
    private router: Router,
    private eventService: EventService,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    this.generateCalendar(this.currentYear, this.currentMonthIndex);
    this.loadEventsAndUserRsvps();
    this.loadNews();
  }

  get userName(): string {
    const name = localStorage.getItem('fullName');
    return name && name.trim().length ? name : 'User';
  }

  private getCurrentUserId(): number {
    const id = localStorage.getItem('userId');
    return id ? Number(id) : 0;
  }

  private loadEventsAndUserRsvps() {
    const userId = this.getCurrentUserId();

    this.eventService.getEvents().subscribe({
      next: (events) => {
        // initialize events
        this.events = events.map(e => ({ ...e, hasRSVPed: false } as Event));

        if (userId) {
          this.eventService.getUserRsvps(userId).subscribe({
            next: (ids) => {
              const idSet = new Set(ids);
              this.events.forEach(ev => ev.hasRSVPed = idSet.has(ev.id));
              this.myEvents = this.events.filter(ev => ev.hasRSVPed);
            },
            error: (err) => {
              console.error('Failed to load user rsvps', err);
              this.myEvents = this.events.filter(ev => ev.hasRSVPed);
            }
          });
        } else {
          // not logged in
          this.myEvents = [];
        }
      },
      error: (err) => console.error('Error fetching events:', err)
    });
  }

  loadNews() {
    this.newsService.getAllNews().subscribe({
      next: (data) => this.newsList = data.reverse(),
      error: (err) => console.error('Error fetching news:', err)
    });
  }

  get filteredEvents() {
    return this.events.filter(e => e.title.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  rsvp(event: Event) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      alert('Please login to RSVP.');
      return;
    }

    if ((event as any).__rsvpPending) return;
    (event as any).__rsvpPending = true;


    this.eventService.rsvp(event.id, userId).subscribe({
      next: (res) => {
        // server returns authoritative count
        event.rsvps = res?.count ?? (event.rsvps || 0);
        event.hasRSVPed = true;
        // update myEvents
        if (!this.myEvents.some(e => e.id === event.id)) this.myEvents.push(event);
        (event as any).__rsvpPending = false;
      },
      error: (err) => {
        console.error('RSVP failed:', err);
        alert('Failed to RSVP. Please try again.');
        (event as any).__rsvpPending = false;
      }
    });
  }

  goToMyEvents() {
    this.router.navigate(['/my-events'], { state: { myEvents: this.myEvents } });
  }

  goToProfile() { this.router.navigate(['/profile']); }
  refreshHome() { this.loadEventsAndUserRsvps(); }
  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    this.router.navigate(['/login']);
  }

  /* calendar helpers unchanged (copy from previous) */
  generateCalendar(year: number, month: number) {
    this.calendarDates = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) this.calendarDates.push(new Date(0));
    for (let i = 1; i <= lastDate; i++) this.calendarDates.push(new Date(year, month, i));
    this.currentMonth = new Date(year, month).toLocaleString('default', { month: 'long' });
    this.currentYear = year;
  }
  prevMonth() { this.changeMonth(-1); }
  nextMonth() { this.changeMonth(1); }
  private changeMonth(delta: number) {
    this.currentMonthIndex += delta;
    if (this.currentMonthIndex < 0) { this.currentMonthIndex = 11; this.currentYear--; }
    if (this.currentMonthIndex > 11) { this.currentMonthIndex = 0; this.currentYear++; }
    this.generateCalendar(this.currentYear, this.currentMonthIndex);
  }
  isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }
  hasEvent(date: Date) {
    return this.events.some(e => {
      const d = new Date(e.date);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
  }
}
