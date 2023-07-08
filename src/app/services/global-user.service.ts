import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalUserService {
  private currentUser: any;

  setCurrentUser(user: any): void {
    this.currentUser = user;
  }

  getCurrentUser(): any {
    return this.currentUser;
  }
}
