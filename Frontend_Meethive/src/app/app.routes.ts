import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { UsersComponent } from './users/users';
import { UserDashboardComponent } from './user-dashboard/user-dashboard';
import { MyEventsComponent } from './my-events/my-events';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin/users', component: UsersComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'my-events', component: MyEventsComponent }
];
