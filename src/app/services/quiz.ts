import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
  id: number;
  section: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

@Injectable({ providedIn: 'root' })
export class Quiz {
  constructor(private http: HttpClient) {}

  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>('questions.json');
  }
}