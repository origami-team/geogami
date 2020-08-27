import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BeaconSettingsTabsPage } from './beacon-settings-tabs.page';

describe('BeaconSettingsTabsPage', () => {
  let component: BeaconSettingsTabsPage;
  let fixture: ComponentFixture<BeaconSettingsTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeaconSettingsTabsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BeaconSettingsTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
