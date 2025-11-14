import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SignupService } from '../services/signup.service';
import { Signup } from '../model/signup.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  signupData: Signup = { fullName: '', email: '', password: '', confirmPassword: '' };
  message: string = '';

  // Individual field errors
  fullNameError = '';
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';

  constructor(private signupService: SignupService, private router: Router) {}

  onSubmit() {
    // Reset errors
    this.fullNameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.message = '';

    // Validate each field
    if (!this.signupData.fullName.trim()) {
      this.fullNameError = 'Full Name is required!';
    }
    if (!this.signupData.email.trim()) {
      this.emailError = 'Email is required!';
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.signupData.email)) {
        this.emailError = 'Enter a valid email!';
      }
    }
    if (!this.signupData.password) {
      this.passwordError = 'Password is required!';
    } else if (this.signupData.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters!';
    }
    if (!this.signupData.confirmPassword) {
      this.confirmPasswordError = 'Confirm Password is required!';
    } else if (this.signupData.password !== this.signupData.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match!';
    }

    // Stop if any validation errors exist
    if (this.fullNameError || this.emailError || this.passwordError || this.confirmPasswordError) {
      return;
    }

    // Submit to backend
    this.signupService.signup(this.signupData).subscribe({
      next: (res) => {
        this.message = res;
        if (res === 'Signup successful!') {
          setTimeout(() => this.router.navigate(['/login']), 1500);
        }
      },
      error: () => {
        this.message = '❌ Something went wrong. Please try again!';
      }
    });
  }
}
