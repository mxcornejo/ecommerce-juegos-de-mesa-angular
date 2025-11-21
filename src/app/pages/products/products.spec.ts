import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { Products } from './products';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

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
      queryParamMap: of({
        get: (key: string) => null,
      }),
      snapshot: { params: {} },
    };

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
