// pages/users/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User, Role } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Filtres
  searchTerm = '';
  filterRole: string = '';
  filterActive: boolean | null = null;

  // Rôles disponibles
  roles = Object.values(Role);

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filterUsers();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  filterUsers(): void {
    let result = this.users;

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filtre par rôle
    if (this.filterRole) {
      result = result.filter(user => user.role === this.filterRole);
    }

    // Filtre par statut actif
    if (this.filterActive !== null) {
      result = result.filter(user => user.active === this.filterActive);
    }

    this.filteredUsers = result;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getRoleDisplayName(role: Role): string {
    return this.userService.getRoleDisplayName(role);
  }

  isCurrentUser(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === user.id;
  }

  // Actions
  createUser(): void {
    this.router.navigate(['/users/create']);
  }

  editUser(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  activateUser(id: number): void {
    if (confirm('Activer cet utilisateur ?')) {
      this.userService.activateUser(id).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur activé avec succès';
          this.loadUsers();
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de l\'activation';
          console.error('Error:', err);
        }
      });
    }
  }

  deactivateUser(id: number): void {
    if (confirm('Désactiver cet utilisateur ?')) {
      this.userService.deactivateUser(id).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur désactivé avec succès';
          this.loadUsers();
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de la désactivation';
          console.error('Error:', err);
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur supprimé avec succès';
          this.loadUsers();
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error('Error:', err);
        }
      });
    }
  }

  clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.error = null;
    }, 3000);
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    start = Math.max(1, end - maxPages + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
