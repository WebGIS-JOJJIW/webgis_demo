import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorMappingComponent } from './editor-mapping.component';

describe('EditorMappingComponent', () => {
  let component: EditorMappingComponent;
  let fixture: ComponentFixture<EditorMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditorMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
