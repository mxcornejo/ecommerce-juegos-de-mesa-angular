import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { CardCategory } from './card-category';

describe('CardCategory', () => {
  let component: CardCategory;
  let fixture: ComponentFixture<CardCategory>;

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
      imports: [CardCategory],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardCategory);
    component = fixture.componentInstance;

    // Configurar input requerido
    component.category = {
      id: 1,
      name: 'Test Category',
      slug: 'test-category',
      image: 'test.jpg',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
