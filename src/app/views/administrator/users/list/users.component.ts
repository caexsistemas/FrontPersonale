/**
    * @description      : 
    * @author           : MARYI
    * @group            : 
    * @created          : 24/06/2021 - 14:52:03
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 24/06/2021
    * - Author          : Maricel Jimenez
    * - Modification    : 
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { Tools } from '../../../../Tools/tools.page';
import { UserServices } from '../../../../services/user.service';
import { ModalDirective } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [Tools, UserServices]
})

export class UsersComponent implements OnInit {

  public data;
  public detailUser = []
  constructor(private _UserService: UserServices, private _tools: Tools) { }
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

  ngOnInit(): void {
    this._UserService.getAllUser().subscribe(response => {
      this.data = response
    },
      error => {
        //console.log(<any>error)
        if (<any>error.status == 401) {
          this._tools.goToPage('login')
        } else if (<any>error.status == 500) {
          this._tools.showNotify("error", "GESTIN", "Error Interno")
        } else if (<any>error.status == 403) {
          this._tools.goToPage('403')
        }
      }
    )
  }
  showDetails(item) {
    this.detailUser = item;
    this.infoModal.show()
  }

}
