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
      // ✅ from quiz navigation
      this.answers = nav.extras.state['answers'] || [];
      this.round = nav.extras.state['round'] || '1';

      // ✅ persist for refresh
      localStorage.setItem('answers', JSON.stringify(this.answers));
      localStorage.setItem('round', this.round);
    } else {
      // ✅ fallback (after refresh)
      this.answers = JSON.parse(localStorage.getItem('answers') || '[]');
      this.round = localStorage.getItem('round') || '1';
    }

    this.calculateSections();
  }

  // ✅ GROUP QUESTIONS BY SECTION
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

      if (ans.isCorrect) {
        this.sections[sec].correct++;
      }

      this.sections[sec].questions.push(ans);
    });
  }

  // ✅ FIX: keyvalue pipe key type issue
  selectSection(s: string | number | symbol) {
    this.selectedSection = String(s);
  }

  back() {
    this.selectedSection = null;
  }

  // 🚀 START ROUND 2
  startRound2() {
    if (!this.answers.length) {
      this.router.navigate(['/']);
      return;
    }

    const section = this.answers[0].section;

    this.router.navigate(['/quiz', section], {
      queryParams: { round: 2 }
    });
  }

  // 🔄 RESTART CURRENT ROUND
  resetRound() {
    if (!this.answers.length) {
      this.router.navigate(['/']);
      return;
    }

    const section = this.answers[0].section;

    localStorage.removeItem('answers');

    this.router.navigate(['/quiz', section], {
      queryParams: { round: this.round }
    });
  }

  // 🏠 GO HOME
  goHome() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}