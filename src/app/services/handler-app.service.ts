import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// import { KaysenComponent } from '../kaysen/kaysen.component';
import { FormGroup, FormControl } from '@angular/forms';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HandlerAppService {

  // public permissions:any = {
  //   view: false,
  //   create: false,
  //   update: false,
  //   delete: false
  // };  // permisos dentro de la aplicacion
  permissions:any;
  intervalId: any;
  permissionsSecundary:any = {
    view:           true,
    update:         true,
    delete:         true,
    foreignCreate:  true
  };
  permissionsApp:any = {
    view:   false,
    create: false,
    update: false,
    delete: false
  };
  constructor(
    public router:Router,
    private location: Location
    // private kaysen:KaysenComponent
    
  ){}

  getPermissions(component){
    
   
      this.permissionsApp.view   = false,
      this.permissionsApp.create = false,
      this.permissionsApp.update = false,
      this.permissionsApp.delete = false
   

    
    if(this.permissions != undefined){
      //console.log(this.permissions[component])
      if(this.permissions[component].length > 0){
        this.permissions[component].forEach(permission => {
          switch(permission){
            case 'ver':
              this.permissionsApp.view = true;
            break;
            case 'crear':
              this.permissionsApp.create = true;
            break;
            case 'editar':
              this.permissionsApp.update = true;
            break;
            case 'eliminar':
              this.permissionsApp.delete = true;
            break;
            default:
              //console.log('permiso no existe');
            break;
          }
        });
        return this.permissionsApp;
      }
    }else{
      this.permissionsApp.view = true;
      return this.permissionsApp;
    }
  }

  getPermissionsSecundary(component){
    // //console.log(this.permissions);
    // //console.log(component);
    if(this.permissions != undefined){
      if(this.permissions[component].length > 0){
        this.permissions[component].forEach(permission => {
          switch(permission){
            case 'ver':
              this.permissionsSecundary.view = true;
            break;
            case 'crear':
              this.permissionsSecundary.create = true;
            break;
            case 'crearexterno':
              this.permissionsSecundary.foreignCreate = true;
            break;
            case 'editar':
              this.permissionsSecundary.update = true;
            break;
            case 'eliminar':
              this.permissionsSecundary.delete = true;
            break;
            default:
              //console.log('permiso no existe');
            break;
          }
        });
        return this.permissionsSecundary;
      }
    }else{
      this.permissionsSecundary.view = true;
      return this.permissionsSecundary;
    }
  }

  handlerError(data){
    this.closeShow();
    if(data.hasOwnProperty('action')){
      if(data.action == 'closeSession'){
        Swal.fire({
          title:'',
          text: data.message,
          icon: 'info',
          confirmButtonText: 'OK',
          confirmButtonColor: '#12486f'
        })
        .then(result=>{
          this.closeSession();
        });
      }else{
        if(data.message.length > 0){
          Swal.fire({
            title:'',
            text: data.message,
            icon: null
          });
        }
      }
    }else{
      //console.log(data.message);
      if(data.message != null){
        if(data.message.length > 0){
          Swal.fire({
            title:'',
            text: data.message,
            icon: null
          });
        }
      }
    }
  }

  showLoadin(title, text){
    this.closeShow();
    Swal.fire({
      title: title,
      html: text,
      timerProgressBar: true,
      allowOutsideClick: false,
      showConfirmButton: false,  // Ocultar el botón "OK"
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  showTimePross(title): void {
    let startTime: number = Date.now(); // Obtener la marca de tiempo en milisegundos
  
    // Limpiar el intervalo si ya está activo
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  
    const swalInstance = Swal.fire({
      title: title,
      html: "Tiempo transcurrido: <b>0:00:00</b>", // Inicializado con 0 horas, 0 minutos y 0 segundos
      /*imageUrl: 'assets/img/brand/loading-gear.gif',*/ // Reemplaza 'url_del_gif_de_carga' con la URL de tu GIF
      imageAlt: 'Cargando...',
      timerProgressBar: true,
      allowOutsideClick: false,
      showConfirmButton: false,  // Ocultar el botón "OK"
      didOpen: () => {
        // Actualizar el tiempo transcurrido cada segundo
        const updateElapsedTime = () => {
          const currentTime = Date.now();
          const elapsedTime = currentTime - startTime;
  
          const hours = Math.floor(elapsedTime / 3600000); // 1 hora = 3600000 milisegundos
          const minutes = Math.floor((elapsedTime % 3600000) / 60000);
          const seconds = Math.floor((elapsedTime % 60000) / 1000);
  
          const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          
          Swal.update({
            html: `Tiempo transcurrido: <b>${formattedTime}</b>`,
          });
        };
  
        // Actualizar cada segundo
        this.intervalId = setInterval(updateElapsedTime, 1000);
      },
      willClose: () => {
        // Limpiar el intervalo cuando se cierra la alerta
        clearInterval(this.intervalId);
      },
    });
  }
  
  closeShow(){
    Swal.close();
  }
  
  showSuccess(message){
    this.closeShow();
    Swal.fire({
      title: '',
      html: message,
      icon: 'success'
    });
  }

  shoWarning(title, message){
    this.closeShow();
    Swal.fire({
      title: title,
      html: message,
      icon: 'warning'
    });
  }

  showInfo(message, title, modulo){
    this.closeShow();
    Swal.fire({
      title: title,
      html: message,     
      footer: '<a href="'+modulo+'">Ingresar al Modulo</a>',
      icon: 'info',
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false
    });
  }

  showError(message=null){
    this.closeShow();
    //Validar Entorno
    let urlEnt = location.protocol+"//";
    if( location.hostname == 'localhost' ){
      urlEnt += location.hostname+':'+location.port+'/';
    }else{
      urlEnt += location.hostname+'/360/';
    }

    if(message == null || message == "" ){
      message = 'Comunícate con nuestro equipo de soporte para obtener asistencia.';
    }

    Swal.fire({
      title: '¡Ups! Ocurrió un contratiempo inesperado.',
      html: message,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Ir al Inicio',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí puedes redirigir al usuario a la página deseada
        this.router.navigate(['/login'])
        .catch(error => {
          console.error('Error de navegación:', error);
          // Puedes agregar lógica adicional aquí si es necesario
          // Por ejemplo, redirigir a otra página o mostrar un mensaje al usuario
          return Promise.resolve(); // Resuelve la promesa para que la ejecución continúe
        });     

      }
    });

  }

  closeSession(){
    localStorage.removeItem('isLogged');
    localStorage.removeItem('currentUser');
    // this.kaysen.isLogged = false;
    // this.kaysen.cuser = null;
    this.router.navigate(["/"]);
  }

  validateAllFields(formGroup: FormGroup) {         
    Object.keys(formGroup.controls).forEach(field => {  
      const control = formGroup.get(field);            
      if(control instanceof FormControl) {             
        control.markAsTouched({ onlySelf: true });
      }else if (control instanceof FormGroup) {        
        this.validateAllFields(control);  
      }
    });
  }

  returnRangeMonths(range:number){
    let start;
    let end;
    let now = new Date();

    let d = new Date(now.getFullYear()+"-"+(now.getMonth()+1)+"-01 00:00");
    start = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    
    d.setMonth(d.getMonth()+range);
    end = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    
    start = new Date(start+" 00:00");
    end = new Date(end+" 00:00");
    return [start,end];
  }

  returnJsonToArray(data:any){
    let variable = JSON.parse(data);
    if(variable!= null && variable!= ""){
      let arrayAux = Array();
      for(let i in variable){
        if(variable[i].toLowerCase() != 'todas' ){
          let cod = i;
          if(isNaN(parseInt(cod))){ // no es un numero
            arrayAux.push({
              codigo:    i,
              nombre:    variable[i]
            })
          }else{
            arrayAux.push({
              codigo:    parseInt(i),
              nombre:    variable[i]
            })
          }
        }
      }
      return arrayAux;
    }
  }

// Alerta imagen de navidad 
  // navidad(){
  //   Swal.fire({
  //     title: "",
  //     imageUrl: "assets/img/360.png",
  //     imageWidth: 900,
  //     width:680,
  //     imageHeight: 750,
  //     backdrop: `
  //       rgba(0, 0, 123, 0.4)
  //       url("https://usagif.com/wp-content/uploads/gif/snwflks-54.gif")
  //       no-repeat
  //       right center
  //       / cover
  //     `,
  //     position: "center",
  //     // showConfirmButton: false,
  //   });
  // }

}
