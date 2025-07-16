import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IDTypeComponent } from './idtype.component';

describe('IDTypeComponent', () => {
  let component: IDTypeComponent;
  let fixture: ComponentFixture<IDTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IDTypeComponent]
    });
    fixture = TestBed.createComponent(IDTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
