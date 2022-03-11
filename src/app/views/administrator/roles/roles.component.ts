import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { global } from '../../../services/global';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { UserServices } from '../../../services/user.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
  providers: [Tools, UserServices]
})
export class RolesComponent implements OnInit {
  [x: string]: any;

  public data;
  public detailRoles = [];
  dataroles: any = [];
  dataSource: any = [];
  displayedColumns: any = [];
  loading: boolean = false;
  ValorRol: any = [];

   
  component = "/admin/roles";
  permissions: any = null;

  endpoint: string = '/prueba';

  
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor( private _UserService: UserServices,
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog) { }

  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
   this.sendRequest();
  }
  
  sendRequest() {
    this.WebApiService.getRequest(this.endpoint, {action:'getPrueba'
    })
      .subscribe(
        response => {
          this.permissions = this.handler.getPermissions(this.component);
          console.log(1)
          console.log(this.permissions)
          if (response.success) {
            
            this.generateTable(response.data);

            this.ValorRol = response.data
            this.loading = false;
          } else {
            this.ValorRol = [];
            this.handler.handlerError(response);
          }
        },
        error => {
          this.loading = false;
           this.permissions = this.handler.getPermissions(this.component);
           this.handler.showError();
        }
      );
  }

  generateTable(data) {
    this.displayedColumns = [
      'idRole',
      'name',
      'description'
      
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector('search-input-table'))) {
      search = document.querySelector('.search-input-table');
      search.value = "";
    }
  }

  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }
  showDetails(item) {
    this.detailRoles = item;
    this.infoModal.show();
  }
}
