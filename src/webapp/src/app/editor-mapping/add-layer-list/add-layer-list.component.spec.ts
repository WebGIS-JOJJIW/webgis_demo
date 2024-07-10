import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLayerListComponent } from './add-layer-list.component';

describe('AddLayerListComponent', () => {
  let component: AddLayerListComponent;
  let fixture: ComponentFixture<AddLayerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLayerListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLayerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
