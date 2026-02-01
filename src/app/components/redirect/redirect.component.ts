// components/redirect/redirect.component.ts
import { Component, OnInit } from '@angular/core';
import { RedirectService } from '../../services/redirect.service';

@Component({
  selector: 'app-redirect',
  template: '<div>Redirection en cours...</div>',
  standalone: true
})
export class RedirectComponent implements OnInit {
  constructor(private redirectService: RedirectService) {}

  ngOnInit(): void {
    this.redirectService.redirectBasedOnRole();
  }
}
