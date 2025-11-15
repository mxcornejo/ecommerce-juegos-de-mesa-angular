import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../models/user.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  allUsers = signal<User[]>([]);
  searchTerm = signal<string>('');
  stats = signal<{ total: number; todayRegistrations: number }>({
    total: 0,
    todayRegistrations: 0,
  });
  lastUpdate = signal<string>('');

  // Usuarios filtrados basados en búsqueda
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.allUsers();

    return this.allUsers().filter(
      (user) =>
        user.nombre.toLowerCase().includes(term) ||
        user.usuario.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.allUsers.set(this.authService.getRegisteredUsers());
    this.stats.set(this.authService.getUserStats());
    this.updateLastUpdateTime();
  }

  updateLastUpdateTime(): void {
    const now = new Date();
    this.lastUpdate.set(
      now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  deleteUser(userId: string, userName: string): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"?`)) {
      return;
    }

    const result = this.authService.deleteUser(userId);

    if (result.success) {
      this.loadUsers(); // Recargar la lista
      alert(result.message);
    } else {
      alert(result.message);
    }
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  reloadList(): void {
    this.loadUsers();
  }

  formatDate(isoDate: string): string {
    return this.authService.formatDate(isoDate);
  }
}
