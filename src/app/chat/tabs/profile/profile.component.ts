import { Component, OnInit } from '@angular/core';
import { GlobalUserService } from '../../../services/global-user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
/**
 * Tabs-Profile component
 */
export class ProfileComponent implements OnInit {

  senderName: any;
  senderProfile: any;
  constructor(private globalUserService: GlobalUserService) { } // Inyecta el servicio en el constructor

  ngOnInit(): void {
    // Intenta obtener el usuario del servicio
    let user = this.globalUserService.getCurrentUser();

    // Si no hay usuario en el servicio, busca en localStorage
    if (!user) {
      user = JSON.parse(localStorage.getItem('currentUser'));

      // Si encontramos un usuario en localStorage, lo guardamos en el servicio para futuras referencias
      if (user) {
        this.globalUserService.setCurrentUser(user);
      }
    }

    // Si tenemos un usuario (del servicio o localStorage), establecemos los valores correspondientes
    if (user) {
      this.senderName = user.username;
      this.senderProfile = 'assets/images/users/' + user.profile;
    }
  }
}
