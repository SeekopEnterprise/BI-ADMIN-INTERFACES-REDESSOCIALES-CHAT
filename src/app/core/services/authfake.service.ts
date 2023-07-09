import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/auth.models';

function getDefaultUser(correo: string) {
  return {
    email: correo,
    username: correo, // Si el username también debe ser el correo, si no cambia esto.
    token: 'fake-jwt-token',
    profile: 'avatar-1.jpg'
  };
}

@Injectable({ providedIn: 'root' })
export class AuthfakeauthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    let user;
    try {
      user = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
      console.log('Error obteniendo el usuario del localStorage', e);
    }
    if (!user) {
      user = getDefaultUser('default.pruebas@seekoop.com'); // Define un correo por defecto aquí.
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (e) {
        console.log('Error estableciendo el usuario en el localStorage', e);
      }
    }
    this.currentUserSubject = new BehaviorSubject<User>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`/users/authenticate`, { email, password })
      .pipe(map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          try {
            localStorage.setItem('currentUser', JSON.stringify(user));
          } catch (e) {
            console.log('Error estableciendo el usuario en el localStorage', e);
          }
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }


  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
