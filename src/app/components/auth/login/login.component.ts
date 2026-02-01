// pages/auth/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {LoginRequest, Role} from '../../../models/user.model';
import {RedirectService} from '../../../services/redirect.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  loading = false;
  error: string | null = null;
  showPassword = false;
  returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private redirectService: RedirectService
  ) {
    // Récupérer l'URL de retour si présente
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
    });
  }

// login.component.ts
// pages/auth/login.component.ts - MODIFIEZ onSubmit()
  onSubmit() {
    console.log('=== FRONTEND LOGIN START ===');
    console.log('Email:', this.credentials.email);
    console.log('Password:', '***' + this.credentials.password?.substring(this.credentials.password?.length - 3));

    this.loading = true;
    this.error = null;

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('=== LOGIN SUCCESS ===');
        console.log('Full response:', JSON.stringify(response, null, 2));

        // Vérifier la structure de la réponse
        console.log('Response type:', typeof response);
        console.log('Has token?', !!response.token);
        console.log('Has user?', !!response.user);
        console.log('Token length:', response.token?.length);
        console.log('Token first 50 chars:', response.token?.substring(0, 50) + '...');

        // Vérifier si le token est valide (format JWT)
        if (response.token) {
          const tokenParts = response.token.split('.');
          console.log('Token parts count:', tokenParts.length);

          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload:', payload);
              console.log('Token role:', payload.role);
              console.log('Token username:', payload.sub);
            } catch (e) {
              console.error('Error decoding token:', e);
            }
          } else {
            console.error('Token format invalid! Expected 3 parts, got:', tokenParts.length);
          }
        }

        // Vérifiez le localStorage
        console.log('LocalStorage token:', localStorage.getItem('token'));
        console.log('LocalStorage currentUser:', localStorage.getItem('currentUser'));

        // Vérifier l'état de l'auth service
        console.log('AuthService currentUser:', this.authService.getCurrentUser());
        console.log('AuthService isLoggedIn:', this.authService.isLoggedIn());
        console.log('AuthService getToken:', this.authService.getToken());

        this.loading = false;
        this.redirectService.redirectAfterLogin();
      },
      error: (error) => {
        console.error('=== LOGIN ERROR ===');
        console.error('Full error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error response:', error.error);

        this.loading = false;
        this.error = error.error?.message || 'Échec de connexion';
      },
      complete: () => {
        console.log('=== LOGIN COMPLETE ===');
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
