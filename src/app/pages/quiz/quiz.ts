import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
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

  section = '';
  round = '1';

  batch = 1;
  batchSize = 2;

  totalBatches = 0;
  allQuestionsCount = 0;

  // ✅ TOTAL QUESTIONS IN CURRENT SECTION
  sectionQuestionCount = 0;

  answers: any[] = [];

  userAnswers: { [index: number]: string } = {};
  submittedMap: { [index: number]: boolean } = {};

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // SHUFFLE
  shuffleArray(arr: any[]) {
    return arr
      .map(v => ({ v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.v);
  }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.section = params.get('section') || '';
    });

    this.route.queryParamMap.subscribe(query => {

      this.round = query.get('round') || '1';
      this.batch = Number(query.get('batch') || 1);

      this.loadQuestions();
    });
  }

  // LOAD QUESTIONS
  loadQuestions() {

    this.questions$ = this.quizService.getQuestions().pipe(
      map((data: any[]) => {

        let filtered = data.filter(
          q => q.section.toLowerCase() === this.section.toLowerCase()
        );

        // TOTAL QUESTIONS
        this.allQuestionsCount = filtered.length;

        this.sectionQuestionCount = filtered.length;

        // TOTAL BATCHES
        this.totalBatches = Math.ceil(
          filtered.length / this.batchSize
        );

        // APPLY BATCH
        const start = (this.batch - 1) * this.batchSize;

        const end = start + this.batchSize;

        filtered = filtered.slice(start, end);

        // RANDOM ROUND
        if (this.round === '2') {

          filtered = this.shuffleArray(filtered).map(q => ({
            ...q,
            options: this.shuffleArray(q.options)
          }));
        }

        // RESET
        this.userAnswers = {};
        this.submittedMap = {};
        this.answers = [];

        this.questions = filtered;

        return filtered;
      })
    );
  }

  // SELECT ANSWER
  selectAnswer(index: number, opt: string, q: any) {

    // prevent changing answer
    if (this.submittedMap[index]) return;

    this.userAnswers[index] = opt;

    this.submittedMap[index] = true;

    this.answers[index] = {
      section: q.section,
      question: q.question,
      options: q.options,
      selected: opt,
      correct: q.correctAnswer,
      isCorrect: opt === q.correctAnswer,
      explanation: q.explanation
    };
  }

  // ANSWER COUNT
  get answeredCount(): number {
    return Object.keys(this.submittedMap).length;
  }

  // HOME
  goToHome() {
    this.router.navigate(['/']);
  }

  // BATCH NAVIGATION
  goToBatch(batch: number) {

    if (batch < 1 || batch > this.totalBatches) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        batch: batch,
        round: this.round
      },
      queryParamsHandling: 'merge'
    });
  }

  // FINISH QUIZ
  finishQuiz() {

    const finalAnswers = this.answers.filter(a => a !== undefined);

    const hasNextBatch = this.batch < this.totalBatches;

    localStorage.setItem(
      'answers',
      JSON.stringify(finalAnswers)
    );

    localStorage.setItem('round', this.round);

    localStorage.setItem('batch', String(this.batch));

    localStorage.setItem('section', this.section);

    localStorage.setItem(
      'hasNextBatch',
      String(hasNextBatch)
    );

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

  ngOnDestroy() {}
}