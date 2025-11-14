import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface News {
  id?: number;
  message: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private baseUrl = 'http://localhost:8080/admin/news';

  constructor(private http: HttpClient) { }

  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(this.baseUrl);
  }

  createNews(news: News): Observable<News> {
    return this.http.post<News>(this.baseUrl, news);
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
