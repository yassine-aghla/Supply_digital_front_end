// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { LayoutService } from './services/layout.service'; // Importez le service

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.component.html', // Gardez votre template externe
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showLayout = true;

  constructor(
    private router: Router,
    private layoutService: LayoutService // Injectez le service
  ) {}

  ngOnInit() {
    // Abonnez-vous aux changements du layout via le service
    this.layoutService.layoutVisible$.subscribe(
      visible => this.showLayout = visible
    );

    // Gardez votre logique pour masquer le layout sur login
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Pour la page login
        if (event.url === '/login' || event.url.startsWith('/login')) {
          this.layoutService.hideLayout();
        }
      });
  }
}
