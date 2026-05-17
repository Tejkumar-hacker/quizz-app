import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Sections } from './pages/sections/sections';
import { Quiz } from './pages/quiz/quiz';
import { Result } from './pages/result/result';

export const routes: Routes = [

  {
    path: '',
    component: Dashboard
  },

  // SECTION PAGE
  {
    path: 'sections/:quizType',
    component: Sections
  },

  // QUIZ PAGE
  {
    path: 'quiz/:quizType/:section',
    component: Quiz
  },

  {
    path: 'result',
    component: Result
  }

];