import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StoredBeaconsPage } from './stored-beacons.page';

describe('StoredBeaconsPage', () => {
  let component: StoredBeaconsPage;
  let fixture: ComponentFixture<StoredBeaconsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoredBeaconsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StoredBeaconsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
