import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddBeaconPage } from './add-beacon.page';

describe('AddBeaconPage', () => {
  let component: AddBeaconPage;
  let fixture: ComponentFixture<AddBeaconPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBeaconPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddBeaconPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
