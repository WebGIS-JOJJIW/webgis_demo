import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerConfigurationComponent } from './layer-configuration.component';

describe('LayerConfigurationComponent', () => {
  let component: LayerConfigurationComponent;
  let fixture: ComponentFixture<LayerConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayerConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayerConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
