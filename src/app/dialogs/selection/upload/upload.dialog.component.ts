import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HandlerAppService } from '../../../services/handler-app.service';
import {WebApiService} from '../../../services/web-api.service';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-upload.dialog',
  templateUrl: './upload.dialog.component.html',
  styleUrls: ['./upload.dialog.component.css']
})
export class UploadDialog {
  endpointup: string = "/newPeople";
  selectedFile: File | null = null;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  selectedFiles: File[] = [];

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    private WebApiService: WebApiService,
   private handler: HandlerAppService,
   public dialogRef: MatDialogRef<UploadDialog>,

   @Inject(MAT_DIALOG_DATA) public data: any


  ) { }

  ngOnInit() {
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
     this.selectedFiles.push(this.selectedFile);


  }
  uploadFile(){
    if (!this.selectedFile) {
      console.error('No se ha seleccionado ningún archivo.');
      return;
    }
    // const formData = new FormData();
    // let body = {
    //   listas: formData,
    // };
    // formData.append('file', this.selectedFile);
         
      this.WebApiService.uploadRequest(this.endpointup, this.selectedFile, {
        idRequisition:this.data.idSel,
        cargo: this.data.cargo,
        matriz: this.data.matriz,
        idUser: this.cuser.iduser,

        // token: this.cuser.token,
        // modulo: this.component
      }).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
            // this.loading = false;
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
          // this.loading = false;
        }
      
      );
  //   } else {
  //     this.handler.showError("Complete la informacion necesaria");
  //     // this.loading.emit(false);
  //     this.loading1 = false;
  //   // }
  // }
  }
  closeDialog() {
    this.dialogRef.close();
  }
}
