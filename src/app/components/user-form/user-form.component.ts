// pages/users/user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User, Role, UserCreateRequest, UserUpdateRequest } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  isEditing = false;
  userId?: number;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Form data - RENOMMÉ DE userForm À userFormData
  userFormData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: Role.CLIENT,
    active: true
  };

  // Validation
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;

  // Available roles
  roles = Object.values(Role);

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.userId = +params['id'];
        this.loadUser(this.userId);
      }
    });
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userFormData.username = user.username;
        this.userFormData.email = user.email;
        this.userFormData.role = user.role;
        this.userFormData.active = user.active;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'utilisateur';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  getRoleDisplayName(role: Role): string {
    return this.userService.getRoleDisplayName(role);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateForm(): boolean {
    const errors: string[] = [];

    if (!this.userFormData.username.trim()) {
      errors.push('Le nom d\'utilisateur est requis');
    }

    if (!this.userFormData.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!this.isValidEmail(this.userFormData.email)) {
      errors.push('Format d\'email invalide');
    }

    if (!this.isEditing && !this.userFormData.password) {
      errors.push('Le mot de passe est requis');
    }

    if (this.userFormData.password && this.userFormData.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (this.userFormData.password !== this.userFormData.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    if (errors.length > 0) {
      this.error = errors.join('. ');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    if (this.isEditing && this.userId) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    const userData: UserCreateRequest = {
      username: this.userFormData.username,
      email: this.userFormData.email,
      password: this.userFormData.password,
      role: this.userFormData.role,
      active: this.userFormData.active
    };

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.successMessage = 'Utilisateur créé avec succès';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  updateUser(): void {
    const userData: UserUpdateRequest = {
      username: this.userFormData.username,
      email: this.userFormData.email,
      role: this.userFormData.role,
      active: this.userFormData.active
    };

    // Inclure le mot de passe seulement s'il est fourni
    if (this.userFormData.password) {
      userData.password = this.userFormData.password;
    }

    this.userService.updateUser(this.userId!, userData).subscribe({
      next: (user) => {
        this.successMessage = 'Utilisateur mis à jour avec succès';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
