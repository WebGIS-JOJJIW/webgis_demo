import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawElementMapComponent } from './draw-element-map.component';

describe('DrawElementMapComponent', () => {
  let component: DrawElementMapComponent;
  let fixture: ComponentFixture<DrawElementMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DrawElementMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawElementMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
