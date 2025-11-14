import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Banner } from '../../components/banner/banner';
import { CardProduct } from '../../components/card-product/card-product';
import { PRODUCTS, CATEGORIES } from '../../data/mock-data';
import { Product } from '../../models/product.interface';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-products',
  imports: [Banner, CardProduct],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private route = inject(ActivatedRoute);

  products: Product[] = PRODUCTS;
  categories: Category[] = CATEGORIES;
  filteredCategories: Category[] = CATEGORIES;
  selectedCategorySlug: string | null = null;

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.selectedCategorySlug = params.get('category');
      this.filterCategories();
    });
  }

  filterCategories() {
    if (this.selectedCategorySlug) {
      this.filteredCategories = this.categories.filter(
        (cat) => cat.slug === this.selectedCategorySlug
      );
    } else {
      this.filteredCategories = this.categories;
    }
  }

  getProductsByCategory(categoryId: number): Product[] {
    return this.products.filter((product) => product.categoryId === categoryId);
  }
}
