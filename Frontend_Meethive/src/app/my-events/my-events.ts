import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-events.html',
  styleUrls: ['./my-events.css']
})
export class MyEventsComponent {
  myEvents: any[] = [];

  constructor(public router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state && nav.extras.state['myEvents']) {
      this.myEvents = nav.extras.state['myEvents'];
    }
  }

  cancelRsvp(event: any) {
    const index = this.myEvents.indexOf(event);
    if (index > -1) this.myEvents.splice(index, 1);
    event.rsvp = false;
  }

  backToDashboard() {
    this.router.navigate(['/user-dashboard']);
  }
}
