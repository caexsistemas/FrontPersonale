import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/users';
import { Tools} from '../Tools/tools.page';

import { global } from './global';

@Injectable()

export class UserServices {
       public url: string;
    constructor(public _http: HttpClient,private _tools:Tools) {
        this.url = global.url;
    }
    getAllUser():Observable<any>{
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': this._tools.getToken()
          })
         return this._http.get(this.url+'User',{headers:reqHeader})

    }
    getOneUser(id):Observable<any>{
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': this._tools.getToken()
          })
         return this._http.get(this.url+'User/show/'+id,{headers:reqHeader})

    }
    saveUser(user):Observable<any>{
        let json =JSON.stringify(user);
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': this._tools.getToken()
          })
        return this._http.post(this.url+'User/create',json,{headers:reqHeader});

    }
    updateUser(user,id):Observable<any>{
        let json =JSON.stringify(user);
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': this._tools.getToken()
          })
        return this._http.put(this.url+'user/update/'+id,json,{headers:reqHeader});

    }
}