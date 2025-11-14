import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CATEGORIES } from '../../data/mock-data';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private router = inject(Router);
  categories: Category[] = CATEGORIES;

  navigateToProducts() {
    this.router.navigate(['/products']);
  }
}
