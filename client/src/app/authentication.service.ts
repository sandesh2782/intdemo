import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

export interface UserDetails {
  _id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

export interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password: string;
  name?: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private token: string;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  private getToken() {

    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }

    return this.token;
  }

  public logOut(): void {
    this.token = '';
    localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
  }

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload: string;

    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user: UserDetails = this.getUserDetails();

    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  private request(method: 'post'|'get', type: 'login'|'register'|'profile', user?: TokenPayload): Observable<any> {
    let base: any;

    if (method === 'post') {
      base = this.http.post(`/api/${type}`, user);
    } else {
      base = this.http.get(`/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }

    const requestData = base.pipe(
      (data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      }
    );

    return requestData;
  }

  public register(user: TokenPayload): Observable<any> {
    return this.request('post', 'register', user);
  }

  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }

  public profile(): Observable<any> {
    return this.request('get', 'profile');
  }

}
