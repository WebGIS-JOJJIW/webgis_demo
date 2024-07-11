import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastestEventsComponent } from './lastest-events.component';

describe('LastestEventsComponent', () => {
  let component: LastestEventsComponent;
  let fixture: ComponentFixture<LastestEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LastestEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastestEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
