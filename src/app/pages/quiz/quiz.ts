import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz as QuizService } from '../../services/quiz';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-quiz',
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.css'],
})
export class Quiz implements OnDestroy {

  questions: any[] = [];

  section = '';

  quizType = '';

  round = '1';

  batch = 1;

  batchSize = 60;

  totalBatches = 0;

  allQuestionsCount = 0;

  sectionQuestionCount = 0;

  answers: any[] = [];

  userAnswers: { [index: number]: string } = {};

  submittedMap: { [index: number]: boolean } = {};

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // SHUFFLE ARRAY
  shuffleArray(arr: any[]) {

    return [...arr]
      .map(v => ({
        v,
        r: Math.random()
      }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.v);
  }

  ngOnInit() {

  this.route.params.subscribe(params => {

    // QUIZ TYPE
    this.quizType =
      params['quizType'] || 'frontend';

    // SECTION
    this.section =
      params['section'] || '';

    // QUERY PARAMS
    this.route.queryParams.subscribe(query => {

      this.round =
        query['round'] || '1';

      this.batch = Number(
        query['batch'] || 1
      );

      // LOAD QUESTIONS
      this.loadQuestions();
    });
  });
}

  // LOAD QUESTIONS
 // LOAD QUESTIONS
loadQuestions() {

  this.questions = [];

  this.quizService
    .getQuestions(this.quizType)
    .subscribe({

      next: (data: any[]) => {

        let filtered = data.filter(
          q =>
            q?.section &&
            q.section.toLowerCase().trim() ===
            this.section.toLowerCase().trim()
        );

        // TOTAL QUESTIONS
        this.allQuestionsCount =
          filtered.length;

        this.sectionQuestionCount =
          filtered.length;

        // TOTAL BATCHES
        this.totalBatches = Math.ceil(
          filtered.length / this.batchSize
        );

        // APPLY BATCH
        const start =
          (this.batch - 1) * this.batchSize;

        const end =
          start + this.batchSize;

        filtered = filtered.slice(start, end);

        // ROUND 2 SHUFFLE
        if (this.round === '2') {

          filtered =
            this.shuffleArray(filtered).map(q => ({

              ...q,

              options:
                this.shuffleArray(q.options)

            }));
        }

        // RESET
        this.userAnswers = {};

        this.submittedMap = {};

        this.answers = [];

        // IMPORTANT
        this.questions = filtered;
        
        console.log('Loaded Questions:', this.questions);
        this.cdr.detectChanges();
        console.log(this.questions);

      },
      

      error: (err) => {

        console.log('ERROR:', err);
      }
    });
}

  // SHUFFLE BUTTON
  shuffleQuestions() {

    this.questions =
      this.shuffleArray(this.questions).map(q => ({

        ...q,

        options:
          this.shuffleArray(q.options)

      }));

    // RESET ANSWERS
    this.userAnswers = {};

    this.submittedMap = {};

    this.answers = [];
  }

  // SELECT ANSWER
  selectAnswer(
    index: number,
    opt: string,
    q: any
  ) {

    // PREVENT CHANGING
    if (this.submittedMap[index]) return;

    this.userAnswers[index] = opt;

    this.submittedMap[index] = true;

    this.answers[index] = {

      section: q.section,

      question: q.question,

      options: q.options,

      selected: opt,

      correct: q.correctAnswer,

      isCorrect:
        opt === q.correctAnswer,

      explanation: q.explanation
    };
  }

  // ANSWER COUNT
  get answeredCount(): number {

    return Object.keys(
      this.submittedMap
    ).length;
  }

  // HOME
  goToHome() {

    this.router.navigate(['/']);
  }

  // GO TO SECTIONS PAGE
  goToSections() {

    this.router.navigate([
      '/sections',
      this.quizType
    ]);
  }

  // BATCH NAVIGATION
  goToBatch(batch: number) {

    if (
      batch < 1 ||
      batch > this.totalBatches
    ) return;

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

    const finalAnswers =
      this.answers.filter(
        a => a !== undefined
      );

    const hasNextBatch =
      this.batch < this.totalBatches;

    localStorage.setItem(
      'answers',
      JSON.stringify(finalAnswers)
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
      this.section
    );

    localStorage.setItem(
      'quizType',
      this.quizType
    );

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

        quizType: this.quizType,

        hasNextBatch
      }
    });
  }

  // SCROLL TO TOP
  scrollToTop() {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // SCROLL TO BOTTOM
  scrollToBottom() {

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }

  ngOnDestroy() {}
}