import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {

  id: number;

  section: string;

  question: string;

  options: string[];

  correctAnswer: string;

  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class Quiz {

  constructor(private http: HttpClient) {}

  getQuestions(dataset: string): Observable<Question[]> {

    // FRONTEND QUESTIONS
    if (dataset === 'frontend') {

      return this.http.get<Question[]>(
        '/questions.json'
      );
    }

    // REFMOCK QUESTIONS
    return this.http.get<Question[]>(
      '/refmock.json'
    );
  }
}