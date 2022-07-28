import {
  Component,
  OnInit,
  ViewChild,
  QueryList,
  ViewChildren,
  Output,
  EventEmitter,
} from "@angular/core";
import { Tools } from "../../../Tools/tools.page";
import { WebApiService } from "../../../services/web-api.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { HandlerAppService } from "../../../services/handler-app.service";
import { global } from "../../../services/global";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { RequisitionDialog } from "../../../dialogs/selection/requisition/requisition.dialog.component";
import { PendingDialog } from "../../../dialogs/selection/pending/pending.dialog.component";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";


@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  endpoint: string = "/requisition";

  form:FormGroup;
  result;
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  constructor(
    // public dialogRef: MatDialogRef<TrainingComponent>,
    private fb:FormBuilder,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,

  ) { }

  ngOnInit(): void {
    this.creatForm();
  }

  creatForm(){
    this.form = this.fb.group(
      {
        fec_sel: new FormControl(""),
        tip_doc: new FormControl(""),
        document: new FormControl(""),
        nom_com: new FormControl(""),
        birthDate: new FormControl(""),
        ciu_nac: new FormControl(""),
        dep_nac: new FormControl(""),
        are_tra: new FormControl(""),
        cargo: new FormControl(""),
        eps: new FormControl(""),
        pension: new FormControl(""),
        obs_vac: new FormControl(""),
        // addresses: this.addressForm(),
        contacts: this.fb.array([this.contactFrom()])
      }
    );
  }

  // addressForm(){
  //   return this.fb.group(
  //     {
  //       address1: [null],
  //       address2: [null],
  //       country: [null],
  //       state: [null]
  //     }
  //   )
  // }

  get addresses(){
  return this.form.get("addresses") as FormGroup;
  }


  get contacts(){
    return this.form.get("contacts") as FormArray;
    }

  contactFrom(){
    return this.fb.group(
      {
        fec_sel:  new FormControl(""),
        tip_doc: new FormControl(""),
        document: new FormControl(""),
        nom_com: new FormControl(""),
        birthDate: new FormControl(""),
        ciu_nac: new FormControl(""),
        dep_nac: new FormControl(""),
        are_tra: new FormControl(""),
        cargo: new FormControl(""),
        eps: new FormControl(""),
        pension: new FormControl(""),
        obs_vac: new FormControl(""),
      }
    );
  }

  onSave(){
    console.log(this.form.getRawValue())
    this.result = this.form.getRawValue();
  }

  addNewContacts(){
    this.contacts.push(this.contactFrom());
  }

  removeContact(i:Required<number>){
    this.contacts.removeAt(i);
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading.emit(true);
      let body = {
        listas: this.form.value,
      };
         
      this.WebApiService.postRequest(this.endpoint, body, {}).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
        }
      );
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }
  closeDialog() {
    // this.dialogRef.close();
  }
  
}
