import { Component, OnInit, ViewChild, } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator} from '@angular/material/paginator';
import { MatSort} from '@angular/material/sort';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
})
export class UserManagementPage implements OnInit {

  users: any; // To hold users info

  displayedColumns: string[] = ['#', 'username', 'email', 'createdAt', 'roles', 'action'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
    private authService: AuthService,
    public _translate: TranslateService,
    public toastController: ToastController,
  ) { }

  ngAfterViewInit() {
    /* this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; */
  }

  ngOnInit() {
    // Get all users
    this.authService.GetUsers().then((res) => {
      this.users = res.map(obj => ({ ...obj, roleIsUpdated: false }))
      this.initializeDataSource(this.users)
      
    });
  }

  initializeDataSource(usersData){
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(usersData);
    console.log("this.dataSource: ", this.dataSource)
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  // material table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
