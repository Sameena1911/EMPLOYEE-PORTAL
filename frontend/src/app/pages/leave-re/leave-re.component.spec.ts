import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveReComponent } from './leave-re.component';

describe('LeaveReComponent', () => {
  let component: LeaveReComponent;
  let fixture: ComponentFixture<LeaveReComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveReComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveReComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
