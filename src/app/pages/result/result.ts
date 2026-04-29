import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [CommonModule],
  templateUrl: './result.html',
  styleUrls: ['./result.css'],
})
export class Result {

  answers: any[] = [];
  sections: Record<string, any> = {};
  selectedSection: string | null = null;
  round = '1';

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();

    if (nav?.extras?.state) {
      this.answers = nav.extras.state['answers'] || [];
      this.round = nav.extras.state['round'] || '1';

      localStorage.setItem('answers', JSON.stringify(this.answers));
      localStorage.setItem('round', this.round);
    } else {
      this.answers = JSON.parse(localStorage.getItem('answers') || '[]');
      this.round = localStorage.getItem('round') || '1';
    }

    this.calculateSections();
  }

  calculateSections() {
    this.sections = {};

    this.answers.forEach(ans => {
      const sec = ans.section;

      if (!this.sections[sec]) {
        this.sections[sec] = {
          total: 0,
          correct: 0,
          questions: []
        };
      }

      this.sections[sec].total++;
      if (ans.isCorrect) this.sections[sec].correct++;

      this.sections[sec].questions.push(ans);
    });
  }

  selectSection(s: string | number | symbol) {
    this.selectedSection = String(s);
  }

  back() {
    this.selectedSection = null;
  }

  startRound2() {
    if (!this.answers.length) return;

    const section = this.answers[0].section;

    this.router.navigate(['/quiz', section], {
      queryParams: { round: 2 }
    });
  }

  resetRound() {
    if (!this.answers.length) return;

    const section = this.answers[0].section;

    localStorage.removeItem('answers');

    this.router.navigate(['/quiz', section], {
      queryParams: { round: this.round }
    });
  }

  goHome() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  trackByIndex(index: number) {
    return index;
  }
}