import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeJSHomeComponent } from './three-js-home.component';

describe('ThreeJSHomeComponent', () => {
  let component: ThreeJSHomeComponent;
  let fixture: ComponentFixture<ThreeJSHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreeJSHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeJSHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
