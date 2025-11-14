import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule], // <-- Make sure RouterModule is imported
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUsComponent {}
