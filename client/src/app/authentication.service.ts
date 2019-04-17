import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
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

// Added the comment to check

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

  private request(method: string, type: string, user: TokenPayload): Observable<any> {
    let base;

    if (method === 'post') {
      base = this.http.post(`/api/${type}`, user);
    } else {
      base = this.http.get(`/api/${type}`, { headers: { Authorization: `Bearer: ${this.getToken()}` } });
    }

    const request = base.pipe( map( (data: TokenResponse) => {

      if (data.token) {
        this.saveToken(data.token);
      }

      return data;
    }));

    return request;
  }

}
