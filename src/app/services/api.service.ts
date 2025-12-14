import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.interface';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private categoriesUrl =
    'https://mxcornejo.github.io/data-ecommerce-juegos-de-mesa/categories.json';
  private productsUrl = 'https://mxcornejo.github.io/data-ecommerce-juegos-de-mesa/products.json';

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl);
  }
}
