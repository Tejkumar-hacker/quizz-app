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

  // ✅ NEW
  quizType = 'frontend';

  batch = 1;
  sectionName = '';
  hasNextBatch = false;

  constructor(private router: Router) {}

  ngOnInit() {

    const nav = this.router.getCurrentNavigation();

    if (nav?.extras?.state?.['answers']?.length) {

      this.answers = nav.extras.state['answers'];

      this.round =
        nav.extras.state['round'] || '1';

      this.batch =
        nav.extras.state['batch'] || 1;

      this.sectionName =
        nav.extras.state['section'] || '';

      this.hasNextBatch =
        nav.extras.state['hasNextBatch'] || false;

      // ✅ NEW
      this.quizType =
        nav.extras.state['quizType']
        || 'frontend';

      localStorage.setItem(
        'answers',
        JSON.stringify(this.answers)
      );

      localStorage.setItem(
        'round',
        this.round
      );

      localStorage.setItem(
        'batch',
        String(this.batch)
      );

      localStorage.setItem(
        'section',
        this.sectionName
      );

      localStorage.setItem(
        'quizType',
        this.quizType
      );

      localStorage.setItem(
        'hasNextBatch',
        String(this.hasNextBatch)
      );

    } else {

      this.answers =
        JSON.parse(
          localStorage.getItem('answers')
          || '[]'
        );

      this.round =
        localStorage.getItem('round')
        || '1';

      this.batch =
        Number(
          localStorage.getItem('batch')
          || 1
        );

      this.sectionName =
        localStorage.getItem('section')
        || '';

      // ✅ NEW
      this.quizType =
        localStorage.getItem('quizType')
        || 'frontend';

      this.hasNextBatch =
        localStorage.getItem('hasNextBatch')
        === 'true';
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

      if (ans.isCorrect) {
        this.sections[sec].correct++;
      }

      this.sections[sec].questions.push(ans);
    });
  }

  selectSection(s: string | number | symbol) {
    this.selectedSection = String(s);
  }

  back() {
    this.selectedSection = null;
  }

  nextBatch() {

    this.router.navigate([
      '/quiz',
      this.quizType,
      this.sectionName
    ], {
      queryParams: {
        round: 1,
        batch: this.batch + 1
      }
    });
  }

  startRound2() {

    this.router.navigate([
      '/quiz',
      this.quizType,
      this.sectionName
    ], {
      queryParams: {
        round: 2,
        batch: this.batch
      }
    });
  }

  resetRound() {

    this.router.navigate([
      '/quiz',
      this.quizType,
      this.sectionName
    ], {
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