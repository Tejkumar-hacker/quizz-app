import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { Quiz } from '../../services/quiz';

import { map, Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-sections',
  imports: [CommonModule],
  templateUrl: './sections.html',
  styleUrls: ['./sections.css']
})
export class Sections {

  sections$!: Observable<any[]>;

  quizType = '';

  totalQuestions = 0;

  constructor(
    private quiz: Quiz,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {

    this.route.paramMap.subscribe(params => {

      this.quizType =
        params.get('quizType') || 'frontend';

      this.loadSections();
    });
  }

  loadSections() {

    this.sections$ =
      this.quiz.getQuestions(this.quizType).pipe(

      map((data: any[]) => {

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

    this.router.navigate([
      '/quiz',
      this.quizType,
      section
    ]);
  }

  goHome() {

    this.router.navigate(['/']);
  }
}