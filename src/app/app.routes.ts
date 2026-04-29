import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Quiz } from './pages/quiz/quiz';
import { Result } from './pages/result/result';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'quiz/:section', component: Quiz },
  { path: 'result', component: Result }
];