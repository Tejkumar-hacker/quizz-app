import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Quiz } from '../../services/quiz';
import { map, Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {

  sections$!: Observable<any[]>;

  totalQuestions = 0;

  constructor(
    private quiz: Quiz,
    private router: Router
  ) {}

  ngOnInit() {

    this.sections$ = this.quiz.getQuestions().pipe(

      map((data: any[]) => {

        // ✅ TOTAL OVERALL QUESTIONS
        this.totalQuestions = data.length;

        const grouped: any = {};

        data.forEach(q => {

          if (!grouped[q.section]) {
            grouped[q.section] = 0;
          }

          grouped[q.section]++;
        });

        return Object.keys(grouped).map(section => ({
          name: section,
          total: grouped[section]
        }));
      })
    );
  }

  start(section: string) {
    this.router.navigate(['/quiz', section]);
  }
}