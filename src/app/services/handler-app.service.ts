import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// import { KaysenComponent } from '../kaysen/kaysen.component';
import { FormGroup, FormControl } from '@angular/forms';

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
    // private kaysen:KaysenComponent
    
  ){}

  getPermissions(component){
    
   
      this.permissionsApp.view   = false,
      this.permissionsApp.create = false,
      this.permissionsApp.update = false,
      this.permissionsApp.delete = false
   

    
    if(this.permissions != undefined){
      console.log(this.permissions[component])
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
              console.log('permiso no existe');
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
    // console.log(this.permissions);
    // console.log(component);
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
              console.log('permiso no existe');
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
      console.log(data.message);
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

  showError(message=null){
    if(message== null){
      Swal.fire({
        title: '',
        text: "Se produjo un error",
        icon: 'warning'
      });
    }else{
      Swal.fire({
        title: '',
        text: message,
        icon: 'warning'
      });
    }
  }

  showSuccess(message){
    Swal.fire({
      title: '',
      text: message,
      icon: 'success'
    });
  }

  closeSession(){
    localStorage.removeItem('isLogged');
    localStorage.removeItem('currentUser');
    // this.kaysen.isLogged = false;
    // this.kaysen.cuser = null;
    window.location.href = '/'
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

}
