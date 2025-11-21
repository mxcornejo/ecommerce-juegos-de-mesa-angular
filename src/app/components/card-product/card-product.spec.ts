import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { CardProduct } from './card-product';

describe('CardProduct', () => {
  let component: CardProduct;
  let fixture: ComponentFixture<CardProduct>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      { events: of({}) }
    );
    routerSpy.createUrlTree.and.returnValue({} as UrlTree);
    routerSpy.serializeUrl.and.returnValue('');

    const activatedRouteMock = {
      params: of({}),
      snapshot: { params: {} },
    };

    await TestBed.configureTestingModule({
      imports: [CardProduct],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardProduct);
    component = fixture.componentInstance;

    // Configurar input requerido
    component.product = {
      id: 1,
      name: 'Test Product',
      description: 'Test',
      price: 100,
      image: 'test.jpg',
      categoryId: 1,
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
