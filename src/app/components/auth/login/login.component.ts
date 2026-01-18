// pages/auth/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/user.model';

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
    private route: ActivatedRoute
  ) {
    // Récupérer l'URL de retour si présente
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
    });
  }

// login.component.ts
  onSubmit() {
    console.log('=== FRONTEND LOGIN START ===');
    console.log('Email:', this.credentials.email);
    console.log('Password:', '***' + this.credentials.password?.substring(this.credentials.password?.length - 3));

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('=== LOGIN SUCCESS ===');
        console.log('AuthService response:', response);
        console.log('Token:', response.token);
        console.log('User:', response.user);

        // Vérifiez le localStorage
        console.log('LocalStorage token:', localStorage.getItem('token'));
        console.log('LocalStorage currentUser:', localStorage.getItem('currentUser'));

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('=== LOGIN ERROR ===');
        console.error('Error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
      },
      complete: () => {
        console.log('=== LOGIN COMPLETE ===');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
