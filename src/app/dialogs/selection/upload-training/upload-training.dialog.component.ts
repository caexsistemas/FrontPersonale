import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HandlerAppService } from '../../../services/handler-app.service';
import {WebApiService} from '../../../services/web-api.service';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-upload-training',
  templateUrl: './upload-training.dialog.component.html',
  styleUrls: ['./upload-training.dialog.component.css']
})
export class UploadTrainingDialog{
  endpointup: string = "/attendance";
  selectedFile: File | null = null;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  selectedFiles: File[] = [];

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    private WebApiService: WebApiService,
   private handler: HandlerAppService,
   public dialogRef: MatDialogRef<UploadTrainingDialog>,

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
      this.handler.showError('No se ha seleccionado ningún archivo.');
      return;
    }
         
      this.WebApiService.uploadRequest(this.endpointup, this.selectedFile, {
        idRequisition:this.data.idSel,
        idUser: this.cuser.iduser,
        // cargo: this.data.cargo,
        // matriz: this.data.matriz,
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
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
        }
      
      );
  }
  closeDialog() {
    this.dialogRef.close();
  }

}
