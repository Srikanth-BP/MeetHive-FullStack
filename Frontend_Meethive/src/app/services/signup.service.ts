import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Signup } from '../model/signup.model';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private baseUrl = 'http://localhost:8080/api/signup';

  constructor(private http: HttpClient) {}

  signup(userData: Signup): Observable<string> {
    return this.http.post(this.baseUrl, userData, { responseType: 'text' });
  }
}
