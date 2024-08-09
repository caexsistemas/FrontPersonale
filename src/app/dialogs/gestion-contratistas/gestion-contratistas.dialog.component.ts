import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WebApiService } from '../../services/web-api.service';
import { HandlerAppService } from '../../services/handler-app.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';


@Component({
  selector: 'app-gestion-contratistas.dialog',
  templateUrl: './gestion-contratistas.dialog.component.html',
  styleUrls: ['./gestion-contratistas.dialog.component.css']
})
export class GestionContratistasDialog implements OnInit {
  view: string = null;
  title: string = null;
  component = "/prestacion-servicios/contratistas";
  endpoint: string = '/prestacion-servicios';
  selectedFileNames: any = {};
  formCreate: FormGroup;
  nuevoArchivo = {
    file_afi_eps: null,
    file_arl: null,
    file_contrato: null,
    file_carta_termina: null
  };

  doc_ident: number = null;
  fec_creacion: any = null;
  idContratista: number = null;
  contratista: any;
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];


  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  @Output() loading = new EventEmitter<boolean>();
  @Output() reload = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<GestionContratistasDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
  ) { 
    this.idContratista = null;
    this.view = this.data.window;
    if(this.view === "update"){
      this.idContratista = this.data.codigo;
      this.title = "Subir documentos"
      this.initForm();
      this.getDocumentos();
      // this.getDataContratista();
    } else if(this.view=== "view"){
      this.idContratista = this.data.codigo;
      this.title = "Información contratista"
      this.getDataContratista();
    } else if(this.view=== "retirar"){
      this.idContratista = this.data.codigo;
      this.title = "Retirar contratista"
      this.initFormRetiro();
      this.getDataContratista();
    } 
    // else if(this.view=== "updateSocial"){
    //   this.idContratista = this.data.codigo;
    //   this.title = "Subir planilla social"
    //   this.initFormPlanilla();
    //   this.getDataContratista();
    // }
  }


  ngOnInit(): void {
    
  }

  initForm(){

    this.formCreate = new FormGroup({
      file_afi_eps: new FormControl("", [Validators.required, this.PDFValidator()]),
      file_arl: new FormControl("", [Validators.required, this.PDFValidator()]),
      file_contrato: new FormControl("", [Validators.required, this.PDFValidator()]),
    });
  }

  getDataContratista(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint + "/" + this.idContratista, {
      // action: "getContratista",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.contratista = data.data[0];

          //console.log(this.contratista)
          this.fec_creacion = data.data[0].fec_creacion;
        }
        this.loading.emit(false);
      },
      error => {
        console.error('Error al obtener los datos del contratista', error);
        this.loading.emit(false);
      }
    );
  }

  getDocumentos(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDocumentos",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      idContratista : this.idContratista,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          const documento = data.data.contratista[0];
          //console.log(documento)
          this.doc_ident = documento.doc_ident;
          this.fec_creacion = documento.fec_creacion;
          //console.log(this.doc_ident)
          //console.log(this.fec_creacion)
        }
        this.loading.emit(false);
      },
      error => {
        console.error('Error al obtener los docuemntos del contratista', error);
        this.loading.emit(false);
      }
    );
  }
  
  onSubmit() {
    //console.log('entra Subir')
    if (this.formCreate.valid) {
        this.loading.emit(true);
        //console.log('Loading true emitted');
        
        // const fec_registro = moment().format('YYYY-MM-DD');

        const formData = {
            archivos: this.nuevoArchivo
          };

        //console.log(formData);

        this.handler.showLoadin("Subiendo Documentos", "Por favor espere...");

        this.WebApiService.putRequest(this.endpoint + "/" + this.idContratista, formData, {
          action: "uploadDocuments",
          doc_ident: this.doc_ident,
          idPersonale: this.cuser.idPersonale,
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          fec_creacion: this.fec_creacion,
          modulo: this.component,
        }).subscribe(
          response => {
            //console.log('Respuesta del servidor:', response);
            this.handler.showSuccess('Registro guardado con éxito');
            this.loading.emit(false);
            this.closeDialog();
          },
          error => {
            console.error('Error al guardar el registro:', error);
            this.handler.showError('Error al guardar el registro');
            this.loading.emit(false);
          }
        )
    } else {
      const errors = this.getFormErrors();
      this.handler.showError(errors.join(' '));
    }
  }

  selectedFiles: File[] = [];
  
  seleccionarArchivo(event, tipoArchivo) {
    const file = event.target.files[0];
  
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const archivo = {
        nombreArchivo: file.name,
        base64textString: btoa(readerEvent.target.result.toString()),
      };
  
      // Actualizar el objeto nuevoArchivo directamente en lugar de usar filter y push
      this.nuevoArchivo[tipoArchivo] = archivo;
    };
    reader.readAsBinaryString(file);
  }

  closeDialog() {
    this.dialogRef.close();
  }


  PDFValidator(): ValidatorFn {
    
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && control.value instanceof File) {
        const file = control.value as File;
        
        // Extrae la extensión del nombre del archivo
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
  
        // Verifica si la extensión es pdf
        const validMimeType = fileExtension === 'pdf';
  
        // Verifica si el tamaño del archivo es menor a 2MB
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB en bytes
        const validFileSize = file.size <= maxSizeInBytes;

        if (!validMimeType) {
          return { 'invalidFileType': { value: control.value } };
        }

        if (!validFileSize) {
          return { 'invalidFileSize': { value: control.value } };
        }
      }
      return null;
    };
  }

  onFileChange(event: Event, formControlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB en bytes
  
      // Verifica si la extensión es pdf
      if (fileExtension !== 'pdf') {
        this.handler.showError('Los archivos deben subirse en formato PDF');
        this.clearFileInput(input, formControlName);
        return;
      }
  
      // Verifica si el tamaño del archivo es menor a 2MB
      if (file.size > maxSizeInBytes) {
        this.handler.showError('El archivo no debe superar los 2MB');
        this.clearFileInput(input, formControlName);
        return;
      }
  
      // Si el archivo es válido, establece el archivo en el FormControl
      this.formCreate.get(formControlName)?.patchValue(file);
    }
  }

  clearFileInput(input: HTMLInputElement, formControlName: string) {
    this.formCreate.get(formControlName)?.patchValue(null);
    input.value = '';
  }

  initFormRetiro(){
    this.formCreate = new FormGroup({
      fec_retiro: new FormControl("", [Validators.required, this.maxDateValidator]),
      file_carta_termina: new FormControl("", [Validators.required, this.PDFValidator()]),
    });
  }

  maxDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Configura la hora para comparar solo fechas
  
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() - 10); // 10 días antes de hoy
  
    const selectedDate = control.value ? new Date(control.value) : null;
  
    // Asegúrate de comparar solo la parte de la fecha, sin la hora
    if (selectedDate && selectedDate < maxDate) {
      return { maxDate: true };
    }
  
    return null;
  };
  
  
  
  // initFormPlanilla(){
  //   this.formCreate = new FormGroup({
  //     mes: new FormControl("", [Validators.required]),
  //     file_planilla: new FormControl("", [Validators.required, this.PDFValidator()])
  //   });
  // }

  onSubmitRetirar(){
    if (this.formCreate.valid) {

      const formData = {
        fec_retiro: this.formCreate.get('fec_retiro').value.toISOString().split('T')[0],
        archivos: this.nuevoArchivo
      }

      //console.log(formData);
      //console.log(this.fec_creacion)
      
      // const fec_registro = moment().format('YYYY-MM-DD');


      Swal.fire({
        title: "¿Estás seguro de retirar a " + this.contratista.nombres.toLowerCase() + " " + this.contratista.apellidos.toLowerCase() + "?",
        text: "¡No podrás revertir esta acción!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5650EB",
        cancelButtonColor: "#d33",
        confirmButtonText: "¡Si, retirarlo!",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.handler.showLoadin("Realizando proceso de retiro", "Por favor espere...");
  
          this.WebApiService.putRequest(this.endpoint + "/" + this.idContratista, formData, {
            action: "retirarContratista",
            doc_ident: this.contratista.doc_ident,
            idPersonale: this.cuser.idPersonale,
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component,          
            fec_creacion: this.fec_creacion,

          }).subscribe(
            response => {
              //console.log('Respuesta del servidor:', response);
              this.handler.showSuccess('Registro guardado con éxito');
              this.loading.emit(false);
              this.closeDialog();
            },
            error => {
              console.error('Error al guardar el registro:', error);
              this.handler.showError('Error al guardar el registro');
              this.loading.emit(false);
            }
          )
        }
      });
    } else {
      const errors = this.getFormErrors();
      this.handler.showError(errors.join(' '));
    }
  }

  onSubmitPlanilla(){
    if (this.formCreate.valid) {

      const formData = {
        mes: this.formCreate.get('mes').value,
        archivos: this.nuevoArchivo
      }

      //console.log(formData);
      //console.log(this.fec_creacion)

      this.WebApiService.putRequest(this.endpoint + "/" + this.idContratista, formData, {
        action: "uploadPlanilla",
        doc_ident: this.contratista.doc_ident,
        idPersonale: this.cuser.idPersonale,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,          
        fec_creacion: this.fec_creacion,

      }).subscribe(
        response => {
          //console.log('Respuesta del servidor:', response);
          this.handler.showSuccess('Registro guardado con éxito');
          this.loading.emit(false);
          this.closeDialog();
        },
        error => {
          console.error('Error al guardar el registro:', error);
          this.handler.showError('Error al guardar el registro');
          this.loading.emit(false);
        }
      )

    } else {
      const errors = this.getFormErrors();
      this.handler.showError(errors.join(' '));
    }
  }

   //Creador de errores
  getFormErrors() {
    const errors = [];
    const formControls = this.formCreate.controls;

    for (const name in formControls) {
      if (formControls[name].invalid) {
          if (formControls[name].errors.required) {
              errors.push(`El campo ${name} es obligatorio.`);
          }            
      }

      if (formControls[name].errors.maxDate) {
        errors.push(`La fecha en ${name} no puede ser mayor a 10 días antes de la fecha actual`);
      }
      
      if (formControls[name].errors.invalidFileType) {
        errors.push(`Los archivos deben subirse en formato PDF`);
      }
    }
    return errors;
  }

}
