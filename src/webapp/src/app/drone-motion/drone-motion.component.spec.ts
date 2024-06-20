import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneMotionComponent } from './drone-motion.component';

describe('DroneMotionComponent', () => {
  let component: DroneMotionComponent;
  let fixture: ComponentFixture<DroneMotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DroneMotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneMotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
