import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private router: Router) {}

  login() {
    this.errorMessage = '';
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.loading = true;

    // ✅ Frontend-only check for demonstration
    setTimeout(() => {
      this.loading = false;
      if (this.username === 'admin' && this.password === 'admin123') {
        this.router.navigate(['/admin-dashboard']);
      } else if (this.username === 'user' && this.password === 'user123') {
        this.router.navigate(['/user-dashboard']);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
    }, 500); // small delay to simulate "loading"
  }
}
