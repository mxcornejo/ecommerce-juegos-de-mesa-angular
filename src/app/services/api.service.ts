import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getCategories(): Observable<Category[]> {
    if (this.categoriesLoaded) {
      return of(this.categories());
    }

    if (this.isBrowser) {
      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        const categories = JSON.parse(storedCategories);
        this.categories.set(categories);
        this.categoriesLoaded = true;
        return of(categories);
      }
    }

    return this.http.get<Category[]>(this.categoriesUrl).pipe(
      tap((data) => {
        this.categories.set(data);
        this.categoriesLoaded = true;
        if (this.isBrowser) {
          localStorage.setItem('categories', JSON.stringify(data));
        }
      })
    );
  }

  getProducts(): Observable<Product[]> {
    if (this.productsLoaded) {
      return of(this.products());
    }

    if (this.isBrowser) {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        this.products.set(products);
        this.productsLoaded = true;
        return of(products);
      }
    }

    return this.http.get<Product[]>(this.productsUrl).pipe(
      tap((data) => {
        this.products.set(data);
        this.productsLoaded = true;
        if (this.isBrowser) {
          localStorage.setItem('products', JSON.stringify(data));
        }
      })
    );
  }

  // Simulation methods
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const currentProducts = this.products();
    const newId =
      currentProducts.length > 0 ? Math.max(...currentProducts.map((p) => p.id)) + 1 : 1;
    const newProduct = { ...product, id: newId };
    this.products.update((p) => {
      const updated = [...p, newProduct];
      if (this.isBrowser) {
        localStorage.setItem('products', JSON.stringify(updated));
      }
      return updated;
    });
    return of(newProduct);
  }

  updateProduct(product: Product): Observable<Product> {
    this.products.update((products) => {
      const updated = products.map((p) => (p.id === product.id ? product : p));
      if (this.isBrowser) {
        localStorage.setItem('products', JSON.stringify(updated));
      }
      return updated;
    });
    return of(product);
  }

  deleteProduct(id: number): Observable<boolean> {
    this.products.update((products) => {
      const updated = products.filter((p) => p.id !== id);
      if (this.isBrowser) {
        localStorage.setItem('products', JSON.stringify(updated));
      }
      return updated;
    });
    return of(true);
  }
}
