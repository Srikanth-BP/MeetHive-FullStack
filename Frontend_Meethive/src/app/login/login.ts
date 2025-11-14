import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../services/login.service';
import { Login } from '../model/login.model';

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
  submitted = false;

  constructor(private router: Router, private loginService: LoginService) {}

  login() {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.username)) {
      this.errorMessage = 'Enter a valid email';
      return;
    }

    this.loading = true;
    const loginData: Login = { email: this.username, password: this.password };

    this.loginService.login(loginData).subscribe({
      next: (res) => {
        this.loading = false;
        // expected success shape: { status: 'OK', id: 2, role: 'USER', fullName: 'John Doe' }
        if (res?.status === 'OK') {
          // store minimal session info for client-side features (replace with proper auth in production)
          localStorage.setItem('userId', String(res.id));
          localStorage.setItem('role', String(res.role));
          localStorage.setItem('fullName', String(res.fullName || ''));

          if (res.role === 'ADMIN') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/user-dashboard']);
          }
        } else if (res?.status === 'USER_BLOCKED') {
          this.errorMessage = 'Your account is blocked. Contact the administrator.';
        } else if (res?.status === 'INVALID_PASSWORD') {
          this.errorMessage = 'Incorrect password';
        } else if (res?.status === 'USER_NOT_FOUND') {
          this.errorMessage = 'Invalid email or password';
        } else {
          // fallback for older string responses (if any)
          if (res === 'ADMIN') this.router.navigate(['/admin-dashboard']);
          else if (res === 'USER') this.router.navigate(['/user-dashboard']);
          else if (res === 'USER_BLOCKED') this.errorMessage = 'Your account is blocked. Contact the administrator.';
          else this.errorMessage = 'Invalid email or password';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 403) {
          this.errorMessage = 'Your account is blocked. Contact the administrator.';
        } else {
          console.error('Login error:', err);
          this.errorMessage = 'Server error. Please try again!';
        }
      }
    });
  }
}
