export interface News {
  id?: number;       // optional for new posts
  message: string;
  createdAt?: string; // returned from backend
}
