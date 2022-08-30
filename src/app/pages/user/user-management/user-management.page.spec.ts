import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserManagementPage } from './user-management.page';

describe('UserManagementPage', () => {
  let component: UserManagementPage;
  let fixture: ComponentFixture<UserManagementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserManagementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
