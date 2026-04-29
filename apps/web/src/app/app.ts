import { Component } from '@angular/core';
import type { Course } from '@learnwren/shared-data-models';

@Component({
  imports: [],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly featuredCourses: readonly Course[] = [];
}
