import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tools} from '../Tools/tools.page';

import { global } from './global';

@Injectable()

export class RoleServices {
       public url: string;
    constructor(public _http: HttpClient,private _tools:Tools) {
        this.url = global.url;
    }
    getAllRole():Observable<any>{
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': this._tools.getToken()
          })
         return this._http.get(this.url+'role',{headers:reqHeader})

    }
    getListRoleSelect():Observable<any>{
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': this._tools.getToken()
          });
         return this._http.get(this.url+'Role/listRole',{headers:reqHeader})
    }
}