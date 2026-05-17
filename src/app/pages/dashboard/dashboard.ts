import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {

  constructor(private router: Router) {}

  openFrontend() {

    this.router.navigate([
      '/sections',
      'frontend'
    ]);
  }

  openRefMock() {

    this.router.navigate([
      '/sections',
      'refmock'
    ]);
  }
}