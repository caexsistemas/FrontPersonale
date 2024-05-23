import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WolkService {
  constructor(private http: HttpClient) {}

  fetchData(): Observable<any> {
    const wolkvoxServer = '34.73.136.144';
    const apiKey = '7b69645f6469737472697d2d3230323130313034313631333537';
    const dateIni = '20240508070000';
    const dateEnd = '20240508180000';

    const url = `https://wv0016.wolkvox.com/api/v2/reports_manager.php?api=cdr_1&date_ini=${dateIni}&date_end=${dateEnd}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'wolkvox-token': '7b69645f6469737472697d2d3230323130313034313631333537'
    });

    return this.http.get(url, { headers, observe: 'response' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }),
      tap(response => console.log('Response:', response))
    );
  }
  getReport(endpoint: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'wolkvox-token': token
    });

    return this.http.get(endpoint, { headers });
  }
}
