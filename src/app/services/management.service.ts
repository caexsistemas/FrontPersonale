import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tools } from '../Tools/tools.page';

import { global } from './global';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {

  public url: string;
  constructor(public _http: HttpClient, private _tools: Tools) {
    this.url = global.url;
  }
  getAllPersonal(): Observable<any> {
    alert(this.url + 'Personale');
    let reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._tools.getToken()
    })
    return this._http.get(this.url + 'Personale', { headers: reqHeader })
  }
  getInformationUser(data) {
    let json ={idPersonale:data};    
    let reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._tools.getToken()
    })
    return this._http.post(this.url + 'Personale/getInformation', json, { headers: reqHeader });
  }
  getFiltersUser(json) {      
    let reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this._tools.getToken()
    })
    return this._http.post(this.url + 'Personale/filterData', json, { headers: reqHeader });
  }
}
