import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOperationsComponent } from './inventory-operations.component';

describe('InventoryOperationsComponent', () => {
  let component: InventoryOperationsComponent;
  let fixture: ComponentFixture<InventoryOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryOperationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
