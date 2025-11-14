import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../model/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  toastMessage: string = '';
  showToast: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data.filter(u => u.role !== 'ADMIN');
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.showToastMessage('Error loading users. Check server.');
      }
    });
  }

  // inside users.ts

toggleBlock(user: User) {
  const currentlyBlocked = !!user.isBlocked;
  const desiredBlocked = !currentlyBlocked;

  // Optimistic UI update (leave visible until we confirm)
  user.isBlocked = desiredBlocked;
  this.showToastMessage(desiredBlocked ? `${user.fullName} blocking...` : `${user.fullName} unblocking...`, 5000);

  // call service which now returns HttpResponse<string>
  const obs = desiredBlocked ? this.userService.blockUser(user.id) : this.userService.unblockUser(user.id);

  obs.subscribe({
    next: (resp) => {
      // If we receive a successful HttpResponse
      const status = resp?.status ?? 200;
      const body = (resp as any)?.body ?? '';
      if (status >= 200 && status < 300) {
        this.showToastMessage(body || (desiredBlocked ? `${user.fullName} blocked successfully!` : `${user.fullName} unblocked successfully!`), 3000);
      } else {
        // Non-2xx — revert
        user.isBlocked = currentlyBlocked;
        this.showToastMessage(`Server responded ${status}. Action reverted.`, 5000);
      }
    },
    error: (err) => {
      // Some servers / proxies sometimes cause Angular to land success-200 text into error,
      // so if status is 200 treat that as success. Otherwise revert.
      const status = err?.status;
      const errorBody = err?.error;

      // Try to extract a message (several possible shapes)
      let serverMsg = '';
      if (typeof errorBody === 'string') serverMsg = errorBody;
      else if (errorBody && typeof errorBody === 'object') {
        serverMsg = errorBody.text ?? errorBody.message ?? JSON.stringify(errorBody);
      }

      // If status is 200, treat as success (covers parsing-wrapped responses)
      if (status === 200) {
        this.showToastMessage(serverMsg || (desiredBlocked ? `${user.fullName} blocked.` : `${user.fullName} unblocked.`), 3000);
        return;
      }

      // Otherwise revert optimistic change
      user.isBlocked = currentlyBlocked;

      // Show a helpful message including status & server text if present
      const txt = `Server error (${status ?? 'no-status'})${serverMsg ? ' - ' + serverMsg : ''}`;
      console.error('Toggle block/unblock failed:', err);
      this.showToastMessage(txt, 6000);
    }
  });
}


  /**
 * Show toast for custom duration (ms)
 */
showToastMessage(msg: string, durationMs = 3000) {
  this.toastMessage = msg;
  this.showToast = true;
  try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }

  setTimeout(() => {
    this.showToast = false;
    try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }
  }, durationMs);
}

  trackById(index: number, user: User) {
    return user.id;
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
