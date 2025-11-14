import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  userId: number = 0;
  user: any = { fullName: '', email: '', password: '' };
  isEditing = false;
  message = '';
  errors: any = {};
  loading = false;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    const idStr = localStorage.getItem('userId');
    this.userId = idStr ? Number(idStr) : 0;
    if (this.userId) {
      this.loadUser();
    } else {
      // not logged in — redirect to login
      this.router.navigate(['/login']);
    }
  }

  loadUser() {
    this.userService.getUserById(this.userId).subscribe({
      next: (data) => {
        // populate form
        this.user = {
          fullName: data.fullName || '',
          email: data.email || '',
          password: '' // do not prefill password for security; user must type new one to change
        };
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.message = 'Failed to load profile';
      }
    });
  }

  enableEdit() {
    this.isEditing = true;
    this.message = '';
    this.errors = {};
  }

  validate(): boolean {
    this.errors = {};
    let ok = true;

    if (!this.user.fullName || !this.user.fullName.trim()) {
      this.errors.fullName = 'Full name is required';
      ok = false;
    }
    if (!this.user.email || !this.user.email.trim()) {
      this.errors.email = 'Email is required';
      ok = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.user.email.trim())) {
        this.errors.email = 'Enter a valid email';
        ok = false;
      }
    }
    if (!this.user.password || this.user.password.length < 4) {
      this.errors.password = 'Password is required (min 4 characters)';
      ok = false;
    }

    return ok;
  }

  saveProfile() {
    if (!this.validate()) return;
    this.loading = true;
    const payload = {
      fullName: this.user.fullName.trim(),
      email: this.user.email.trim(),
      password: this.user.password
    };

    this.userService.updateUser(this.userId, payload).subscribe({
      next: (updated) => {
        this.loading = false;
        this.isEditing = false;
        this.message = '✅ Profile updated successfully!';
        // clear password field after update
        this.user.password = '';
        // Optionally update localStorage fullName
        localStorage.setItem('fullName', updated.fullName || '');
      },
      error: (err) => {
        this.loading = false;
        console.error('Error updating profile:', err);
        const serverMsg = err?.error || err?.message || 'Server error';
        this.message = `❌ ${serverMsg}`;
      }
    });
  }

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }
}
