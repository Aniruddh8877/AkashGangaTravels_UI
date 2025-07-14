import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelCategoryComponent } from './hotel-category.component';

describe('HotelCategoryComponent', () => {
  let component: HotelCategoryComponent;
  let fixture: ComponentFixture<HotelCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HotelCategoryComponent]
    });
    fixture = TestBed.createComponent(HotelCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
