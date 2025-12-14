import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Category } from '../models/category.interface';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private categoriesUrl =
    'https://mxcornejo.github.io/data-ecommerce-juegos-de-mesa/categories.json';
  private productsUrl = 'https://mxcornejo.github.io/data-ecommerce-juegos-de-mesa/products.json';

  private products = signal<Product[]>([]);
  private categories = signal<Category[]>([]);
  private productsLoaded = false;
  private categoriesLoaded = false;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    if (this.categoriesLoaded) {
      return of(this.categories());
    }
    return this.http.get<Category[]>(this.categoriesUrl).pipe(
      tap((data) => {
        this.categories.set(data);
        this.categoriesLoaded = true;
      })
    );
  }

  getProducts(): Observable<Product[]> {
    if (this.productsLoaded) {
      return of(this.products());
    }
    return this.http.get<Product[]>(this.productsUrl).pipe(
      tap((data) => {
        this.products.set(data);
        this.productsLoaded = true;
      })
    );
  }

  // Simulacion de metodos
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const currentProducts = this.products();
    const newId =
      currentProducts.length > 0 ? Math.max(...currentProducts.map((p) => p.id)) + 1 : 1;
    const newProduct = { ...product, id: newId };
    this.products.update((p) => [...p, newProduct]);
    return of(newProduct);
  }

  updateProduct(product: Product): Observable<Product> {
    this.products.update((products) => products.map((p) => (p.id === product.id ? product : p)));
    return of(product);
  }

  deleteProduct(id: number): Observable<boolean> {
    this.products.update((products) => products.filter((p) => p.id !== id));
    return of(true);
  }
}
