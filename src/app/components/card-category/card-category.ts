import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-card-category',
  imports: [RouterLink],
  templateUrl: './card-category.html',
  styleUrl: './card-category.scss',
})
export class CardCategory {
  @Input() category!: Category;
}
