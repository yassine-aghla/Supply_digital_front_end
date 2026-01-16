// components/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  showMobileMenu = false;
  showUserDropdown = false;

  constructor(private router: Router) {}

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  search(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    console.log('Search:', searchTerm);
  }
}
