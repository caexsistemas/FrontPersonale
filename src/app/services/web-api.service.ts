import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class WebApiService{
  // VARIABLES
  token:string = "";
  urlKaysenBackend      = environment.url;

  // PERMISOS DE APLICACION
  permission = null;

  
  // CONSTRUCTOR
  constructor(
    private _http:HttpClient
  ){}

  // ESTABLECE CABECERA
  setHeaders(){
    let headers = new HttpHeaders()
      .append('Authorization', this.token);
    return headers;
  }

  // METODO GET
  getRequest(url:string,params:any):Observable<any>{
    params = this.processParams(params)
    let headers = this.setHeaders();
    url = this.urlKaysenBackend+url;
    //console.log('Parametro: '+params+ 'Headers: ' +headers+ 'Url: '+url);
    return this._http.get<any>(url,{headers, params});
  }
  
  // METODO POST
  postRequest(url:string,body:any,params:any):Observable<any>{
    // header
    let headers = this.setHeaders();
    body = JSON.stringify(body);
    url = this.urlKaysenBackend+url;
    return this._http.post<any>(url,body,{headers,params});
  }
  //METODO CARGUE EXCEL
  uploadRequest(url:any,file:any,params:any):Observable<any>{
    // header
    // let headers = this.setHeaders();
    // let formData = new FormData();
    // formData.append('file', file, file.name);
    // url = this.urlKaysenBackend+url;
    // return this._http.post<any>(url, formData,{headers,params});
    
    let headers = this.setHeaders();
    let formData = new FormData();
    formData.append('file', file, file.name);
    
    // body = JSON.stringify(body);
    url = this.urlKaysenBackend+url;
    return this._http.post<any>(url,formData,{headers,params});
  }

  // METODO PUT
  putRequest(url:string,body:any,params:any):Observable<any>{
    // header
    let headers = this.setHeaders();
    body = JSON.stringify(body);
    url = this.urlKaysenBackend+url;
    return this._http.put<any>(url,body,{headers,params});
  }

  // METODO DELETE
  deleteRequest(url:string,body:any,params:any){
    let headers = this.setHeaders();
    params = Object.assign(body,params);
    params = this.processParams(params);
    url = this.urlKaysenBackend+url;
    return this._http.delete(url,{headers,params});
  }

  processParams(params:any){
    let queryParams = {};
    for(var key in params){
      if(params[key] != undefined && params[key] !=null){
        queryParams[key] = params[key];
      }
    }
    return new HttpParams({fromObject:queryParams});
  }


}
