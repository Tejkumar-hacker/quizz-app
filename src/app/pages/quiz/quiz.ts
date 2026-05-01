import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz as QuizService } from '../../services/quiz';
import { Observable, map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-quiz',
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.css'],
})
export class Quiz implements OnDestroy {

  questions$!: Observable<any[]>;
  questions: any[] = [];

  currentIndex = 0;
  section = '';
  round = '1';

  batch = 1;
  batchSize = 25;

  totalBatches = 0;
  allQuestionsCount = 0;

  answers: any[] = [];

  userAnswers: { [index: number]: string } = {};
  submittedMap: { [index: number]: boolean } = {};
  visitedMap: { [index: number]: boolean } = {};

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // 🔀 Shuffle helper
  shuffleArray(arr: any[]) {
    return arr
      .map(v => ({ v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.v);
  }

  // 🔥 FIXED ngOnInit (SUBSCRIPTIONS)
  ngOnInit() {

    // Listen to section changes
    this.route.paramMap.subscribe(params => {
      this.section = params.get('section') || '';
    });

    // 🔥 Listen to query param changes (CRITICAL)
    this.route.queryParamMap.subscribe(query => {

      this.round = query.get('round') || '1';
      this.batch = Number(query.get('batch') || 1);

      this.loadQuestions(); // reload questions on batch change
    });
  }

  // 🔥 NEW METHOD (CORE FIX)
  loadQuestions() {
    this.questions$ = this.quizService.getQuestions().pipe(
      map((data: any[]) => {

        let filtered = data.filter(
          q => q.section.toLowerCase() === this.section.toLowerCase()
        );

        // total batches
        this.allQuestionsCount = filtered.length;
        this.totalBatches = Math.ceil(filtered.length / this.batchSize);

        // apply batch
        const start = (this.batch - 1) * this.batchSize;
        const end = start + this.batchSize;
        filtered = filtered.slice(start, end);

        if (this.round === '2') {
          filtered = this.shuffleArray(filtered).map(q => ({
            ...q,
            options: this.shuffleArray(q.options)
          }));
        }

        // 🔥 RESET STATE (IMPORTANT)
        this.currentIndex = 0;
        this.userAnswers = {};
        this.submittedMap = {};
        this.visitedMap = { 0: true };
        this.answers = [];

        this.questions = filtered;

        return filtered;
      })
    );
  }

  // 🔥 BATCH NAVIGATION
  goToBatch(batch: number) {
    if (batch < 1 || batch > this.totalBatches) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { batch: batch, round: this.round },
      queryParamsHandling: 'merge'
    });
  }

  select(opt: string) {
    if (this.submittedMap[this.currentIndex]) return;
    this.userAnswers[this.currentIndex] = opt;
  }

  submit(q: any) {
    const selected = this.userAnswers[this.currentIndex];
    if (!selected || this.submittedMap[this.currentIndex]) return;

    this.submittedMap[this.currentIndex] = true;

    this.answers[this.currentIndex] = {
      section: q.section,
      question: q.question,
      options: q.options,
      selected,
      correct: q.correctAnswer,
      isCorrect: selected === q.correctAnswer,
      explanation: q.explanation
    };
  }

  get answeredCount(): number {
    return Object.keys(this.submittedMap).length;
  }

  next(total: number) {
    if (!this.submittedMap[this.currentIndex]) return;

    if (this.currentIndex < total - 1) {
      this.currentIndex++;
      this.visitedMap[this.currentIndex] = true;
    } else {
      if (this.answeredCount !== total) {
        alert('⚠️ Please answer all questions before finishing.');
        return;
      }
      this.finishQuiz();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.visitedMap[this.currentIndex] = true;
    }
  }

  goToQuestion(index: number) {
    this.currentIndex = index;
    this.visitedMap[index] = true;
  }

  goToHome() {
  this.router.navigate(['/']);
}

  finishQuiz() {
    const finalAnswers = this.answers.filter(a => a !== undefined);
    const hasNextBatch = this.batch < this.totalBatches;

    localStorage.setItem('answers', JSON.stringify(finalAnswers));
    localStorage.setItem('round', this.round);
    localStorage.setItem('batch', String(this.batch));
    localStorage.setItem('section', this.section);
    localStorage.setItem('hasNextBatch', String(hasNextBatch));

    this.router.navigate(['/result'], {
      state: {
        answers: finalAnswers,
        round: this.round,
        batch: this.batch,
        section: this.section,
        hasNextBatch
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const q = this.questions[this.currentIndex];
    if (!q) return;

    if (key >= '1' && key <= '4') {
      if (this.submittedMap[this.currentIndex]) return;
      const index = Number(key) - 1;
      if (q.options[index]) {
        this.userAnswers[this.currentIndex] = q.options[index];
      }
      return;
    }

    if (key === 'arrowleft') {
      this.previous();
      return;
    }

    if ((key === 'arrowright' || key === 'n') && this.submittedMap[this.currentIndex]) {
      this.next(this.questions.length);
      return;
    }

    if (key === 'enter' || key === 's') {
      this.submit(q);
      return;
    }
  }

  ngOnDestroy() {}
}