import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveMotionComponent } from './live-motion.component';

describe('LiveMotionComponent', () => {
  let component: LiveMotionComponent;
  let fixture: ComponentFixture<LiveMotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiveMotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveMotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
