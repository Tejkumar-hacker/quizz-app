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

  sections$!: Observable<string[]>;

  constructor(private quiz: Quiz, private router: Router) {}

  ngOnInit() {
    this.sections$ = this.quiz.getQuestions().pipe(
      map((data: any[]) => [
        ...new Set(data.map(q => q.section))
      ])
    );
  }

  start(section: string) {
    this.router.navigate(['/quiz', section]);
  }
}