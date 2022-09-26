import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
})
export class UserManagementPage implements OnInit {

  users: any; // To hold users info
  //dataSource: MatTableDataSource<any>;


  constructor(
    private authService: AuthService,
    public _translate: TranslateService,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    // Get all users
    this.authService.GetUsers().then((res) => {
      this.users = res.map(obj => ({ ...obj, roleIsUpdated: false }))

      // Assign the data to the data source for the table to render
      //this.dataSource = new MatTableDataSource(this.users);
      //console.log("this.dataSource: ", this.dataSource)
    });
  }

  // update user role
  changeRole(index, roleValue) {
    this.users[index].roleIsUpdated = true
    this.users[index].roles[0] = roleValue
  }

  // save updated role
  saveRoleUpdate(index) {
    this.authService.updateUserRole(this.users[index]).then((res) => {
      if (res.status == 200) {
        this.users[index].roleIsUpdated = false;
        this.showToast("User role was successfully updated!")
      }
    });
  }

  // show feedback after updating user role
  async showToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      color: "dark",
      animated: true,
      duration: 2000,
    });
    toast.present();
  }

}
