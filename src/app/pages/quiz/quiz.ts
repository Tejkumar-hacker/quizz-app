import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
export class Quiz {

  questions$!: Observable<any[]>;

  currentIndex = 0;
  selectedOption: string | null = null;
  submitted = false;
  section = '';
  round = '1';

  answers: any[] = [];

  // ✅ PROGRESS TRACKING
  answeredCount = 0;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // 🔀 SHUFFLE FUNCTION (for round 2)
  shuffleArray(arr: any[]) {
    return arr
      .map(v => ({ v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.v);
  }

  ngOnInit() {
    // ✅ GET SECTION FROM URL
    this.section = this.route.snapshot.paramMap.get('section') || '';

    // ✅ GET ROUND FROM QUERY PARAM
    this.round = this.route.snapshot.queryParamMap.get('round') || '1';

    // ✅ FETCH + FILTER QUESTIONS
    this.questions$ = this.quizService.getQuestions().pipe(
      map((data: any[]) => {
        let filtered = data.filter(
          q => q.section.toLowerCase() === this.section.toLowerCase()
        );

        // 🔥 ROUND 2 → shuffle questions + options
        if (this.round === '2') {
          filtered = this.shuffleArray(filtered).map(q => ({
            ...q,
            options: this.shuffleArray(q.options)
          }));
        }

        return filtered;
      })
    );
  }

  // ✅ SELECT OPTION
  select(opt: string) {
    if (this.submitted) return; // prevent change after submit
    this.selectedOption = opt;
  }

  // ✅ SUBMIT ANSWER
  submit(q: any) {
    if (!this.selectedOption || this.submitted) return;

    this.submitted = true;

    this.answers.push({
      section: q.section,
      question: q.question,
      options: q.options,
      selected: this.selectedOption,
      correct: q.correctAnswer,
      isCorrect: this.selectedOption === q.correctAnswer
    });

    // ✅ UPDATE PROGRESS
    this.answeredCount++;
  }

  // ✅ NEXT QUESTION
  next(total: number) {
    this.currentIndex++;
    this.selectedOption = null;
    this.submitted = false;

    // ✅ FINISH QUIZ
    if (this.currentIndex >= total) {

      // 🔥 SAVE DATA (important for refresh)
      localStorage.setItem('answers', JSON.stringify(this.answers));
      localStorage.setItem('round', this.round);

      // 🔥 STORE ROUND-WISE DATA
      if (this.round === '1') {
        localStorage.setItem('round1', JSON.stringify(this.answers));
      } else {
        localStorage.setItem('round2', JSON.stringify(this.answers));
      }

      // ✅ NAVIGATE TO RESULT PAGE
      this.router.navigate(['/result'], {
        state: {
          answers: this.answers,
          round: this.round
        }
      });
    }
  }
}