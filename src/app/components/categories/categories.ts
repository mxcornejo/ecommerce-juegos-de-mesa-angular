import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardCategory } from '../card-category/card-category';
import { CATEGORIES } from '../../data/mock-data';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, CardCategory],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  categories: Category[] = CATEGORIES;
}
