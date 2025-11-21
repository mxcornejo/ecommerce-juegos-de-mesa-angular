import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { Confirmation } from './confirmation';

describe('Confirmation', () => {
  let component: Confirmation;
  let fixture: ComponentFixture<Confirmation>;

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
      snapshot: {
        params: {},
        queryParamMap: {
          get: (key: string) => null,
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [Confirmation],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Confirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
