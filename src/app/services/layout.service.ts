// services/layout.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private layoutVisible = new BehaviorSubject<boolean>(true);
  layoutVisible$ = this.layoutVisible.asObservable();

  hideLayout() {
    this.layoutVisible.next(false);
  }

  showLayout() {
    this.layoutVisible.next(true);
  }

  toggleLayout() {
    this.layoutVisible.next(!this.layoutVisible.value);
  }
}
