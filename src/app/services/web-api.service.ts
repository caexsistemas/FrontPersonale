import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "./../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class WebApiService {
  // VARIABLES
  token: string = "";
  urlKaysenBackend = environment.url;
  urlApiContact = environment.apiContact;

  // PERMISOS DE APLICACION
  permission = null;

  // CONSTRUCTOR
  constructor(private _http: HttpClient) {}

  // ESTABLECE CABECERA
  setHeaders() {
    let headers = new HttpHeaders().append("Authorization", this.token);
    return headers;
  }

  // METODO GET
  getRequest(url: string, params: any): Observable<any> {
    params = this.processParams(params);
    let headers = this.setHeaders();
    url = this.urlKaysenBackend + url;
    return this._http.get<any>(url, { headers, params });
  }

  // METODO POST
  postRequest(url: string, body: any, params: any): Observable<any> {
    
    let headers = this.setHeaders();
    body = JSON.stringify(body);
    url = this.urlKaysenBackend + url;
    return this._http.post<any>(url, body, { headers, params });
  }

  // METODO PUT
  putRequest(url: string, body: any, params: any): Observable<any> {
    let headers = this.setHeaders();
    body = JSON.stringify(body);
    url = this.urlKaysenBackend + url;
    return this._http.put<any>(url, body, { headers, params });
  }

  //METODO CARGUE EXCEL
  uploadRequest(url: any, file: any, params: any): Observable<any> {
    // header
    // let headers = this.setHeaders();
    // let formData = new FormData();
    // formData.append('file', file, file.name);
    // url = this.urlKaysenBackend+url;
    // return this._http.post<any>(url, formData,{headers,params});

    let headers = this.setHeaders();
    let formData = new FormData();
    formData.append("file", file, file.name);

    // body = JSON.stringify(body);
    url = this.urlKaysenBackend + url;
    return this._http.post<any>(url, formData, { headers, params });
  }


  // METODO DELETE
  deleteRequest(url: string, body: any, params: any) {
    let headers = this.setHeaders();
    params = Object.assign(body, params);
    params = this.processParams(params);
    url = this.urlKaysenBackend + url;
    return this._http.delete(url, { headers, params });
  }

  processParams(params: any) {
    let queryParams = {};
    for (var key in params) {
      if (params[key] != undefined && params[key] != null) {
        queryParams[key] = params[key];
      }
    }
    return new HttpParams({ fromObject: queryParams });
  }
  //---------------------------------------------------------------
  // METOD GET USER CONTACT
  // METODO GET
  getRequestContact(url: string): Observable<any> {
    url = this.urlApiContact + url;
    console.log(url);

    return this._http.get(url);
  }
  // METOD POST CONTACT
  // header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  // setHeadersCont(){
  //   let headers = new HttpHeaders()
  //     .append('Authorization');
  //   return headers;
  // }
  postRequestContact(url: string, body: any): Observable<any> {
    url = this.urlApiContact + url;
    // const headersC = new HttpHeaders().set('Content-Type', 'application/json');

    // const headers =  new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Access-Control-Allow-Origin': '*', // Permitir acceso desde cualquier origen
    //   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE' // Métodos permitidos
    // })

    // const headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .set('Access-Control-Allow-Origin', 'http://localhost:4200'); // Cambia la URL a la permitida en tu caso
    console.log(url, body);

    return this._http.post(url, body);
  }

  // postRequestContact(url: string, body: any): Observable<any> {
  //   url = this.urlApiContact + url;

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Access-Control-Allow-Origin': '*', // Permitir acceso desde cualquier origen
  //     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE', // Métodos permitidos
  //     'Access-Control-Allow-Headers': 'Content-Type' // Permitir envío de la cabecera Content-Type
  //   });

  //   return this._http.post(url, body, { headers });
  // }

  //-----------------------------------------------------------------
  uploadFile(file: File, url: string, params: any): Observable<any> {
    const formData = new FormData();
    // params = this.processParams(params);
    let headers = this.setHeaders();

    url = this.urlKaysenBackend + url;
    formData.append("excelFile", file);
    console.log(formData);

    return this._http.post(url, formData, { headers, params });
  }
}
