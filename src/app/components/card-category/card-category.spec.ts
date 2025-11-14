import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCategory } from './card-category';

describe('CardCategory', () => {
  let component: CardCategory;
  let fixture: ComponentFixture<CardCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
