import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { EditProfile } from './edit-profile';
import { AuthService } from '../../services/auth';

describe('EditProfile', () => {
  let component: EditProfile;
  let fixture: ComponentFixture<EditProfile>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser: jasmine.createSpy('currentUser').and.returnValue({
        nombre: 'Test User',
        usuario: 'testuser',
        email: 'test@example.com',
      }),
    });
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
      imports: [EditProfile, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfile);
    component = fixture.componentInstance;

    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.isAuthenticated.and.returnValue(true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
