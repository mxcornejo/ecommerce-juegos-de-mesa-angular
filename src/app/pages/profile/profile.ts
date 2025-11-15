import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  // Computed values
  userAge = computed(() => {
    const user = this.currentUser();
    return user ? this.authService.calculateAge(user.fechaNacimiento) : 0;
  });

  formattedBirthDate = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    const date = new Date(user.fechaNacimiento);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  formattedRegistrationDate = computed(() => {
    const user = this.currentUser();
    return user ? this.authService.formatDate(user.fechaRegistro) : '';
  });

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/sign-in']);
    }
  }

  onLogout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}
