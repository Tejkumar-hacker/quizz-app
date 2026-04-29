import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-review',
  imports: [CommonModule],
  templateUrl: './review.html',
  styleUrls: ['./review.css'],
})
export class Review {

  answers: any[] = [];
  section = '';
  filteredAnswers: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.section = this.route.snapshot.paramMap.get('section') || '';

    const nav = this.router.getCurrentNavigation();

    if (nav?.extras?.state?.['answers']) {
      this.answers = nav.extras.state['answers'];
      localStorage.setItem('answers', JSON.stringify(this.answers));
    } else {
      this.answers = JSON.parse(localStorage.getItem('answers') || '[]');
    }

    this.filteredAnswers = this.answers.filter(
      a => a.section?.toLowerCase() === this.section.toLowerCase()
    );
  }

  back() {
    this.router.navigate(['/result']);
  }
}