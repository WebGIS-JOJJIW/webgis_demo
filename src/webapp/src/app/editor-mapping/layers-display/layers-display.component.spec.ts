import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayersDisplayComponent } from './layers-display.component';

describe('LayersDisplayComponent', () => {
  let component: LayersDisplayComponent;
  let fixture: ComponentFixture<LayersDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayersDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayersDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
