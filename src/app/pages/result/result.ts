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

  // 🔥 BATCH SUPPORT
  batch = 1;
  sectionName = '';
  hasNextBatch = false;

  constructor(private router: Router) {}

  ngOnInit() {

    const nav = this.router.getCurrentNavigation();

    if (nav?.extras?.state?.['answers']?.length) {

      this.answers = nav.extras.state['answers'];
      this.round = nav.extras.state['round'] || '1';
      this.batch = nav.extras.state['batch'] || 1;
      this.sectionName = nav.extras.state['section'] || '';
      this.hasNextBatch = nav.extras.state['hasNextBatch'] || false;

      // ✅ SAVE (important for reload safety)
      localStorage.setItem('answers', JSON.stringify(this.answers));
      localStorage.setItem('round', this.round);
      localStorage.setItem('batch', String(this.batch));
      localStorage.setItem('section', this.sectionName);
      localStorage.setItem('hasNextBatch', String(this.hasNextBatch));

    } else {

      // ✅ fallback
      this.answers = JSON.parse(localStorage.getItem('answers') || '[]');
      this.round = localStorage.getItem('round') || '1';
      this.batch = Number(localStorage.getItem('batch') || 1);
      this.sectionName = localStorage.getItem('section') || '';
      this.hasNextBatch = localStorage.getItem('hasNextBatch') === 'true';
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

  // 🔥 NEXT BATCH → ALWAYS ROUND 1
  nextBatch() {
    this.router.navigate(['/quiz', this.sectionName], {
      queryParams: {
        round: 1,
        batch: this.batch + 1
      }
    });
  }

  // 🔥 ROUND 2 → SAME BATCH
  startRound2() {
    this.router.navigate(['/quiz', this.sectionName], {
      queryParams: {
        round: 2,
        batch: this.batch
      }
    });
  }

  // 🔥 RESTART → SAME ROUND + SAME BATCH
  resetRound() {
    this.router.navigate(['/quiz', this.sectionName], {
      queryParams: {
        round: this.round,
        batch: this.batch
      }
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