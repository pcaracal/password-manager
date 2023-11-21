import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _url: string = "http://localhost:8000";

  constructor(private _http: HttpClient) {
  }

  loginPost(username: string, password: string): Observable<any> {
    const body = {username: username, password: password};
    return this._http.post(this._url + "/login", body);
  }

  registerPost(username: string, password: string): Observable<any> {
    const body = {username: username, password: password};
    return this._http.post(this._url + "/register", body);
  }

  getData(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': sessionStorage.getItem('token') || ""
      })
    }

    return this._http.get(this._url + "/data", httpOptions);
  }

  postData(name: string, username: string, password: string, url: string, notes: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': sessionStorage.getItem('token') || ""
      })
    }

    const body = {fk_user_id: -1, name: name, username: username, password: password, url: url, notes: notes};
    return this._http.post(this._url + "/data", body, httpOptions);
  }
}
