import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScanNearbyPage } from './scan-nearby.page';

describe('ScanNearbyPage', () => {
  let component: ScanNearbyPage;
  let fixture: ComponentFixture<ScanNearbyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanNearbyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ScanNearbyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
