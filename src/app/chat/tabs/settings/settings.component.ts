import { Component, OnInit } from '@angular/core';
import { GlobalUserService } from '../../../services/global-user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
/**
 * Tabs-settings component
 */
export class SettingsComponent implements OnInit {

  senderName:any;
  senderProfile:any;
  playerName:any;

  constructor(private globalUserService: GlobalUserService) { } // Inyecta el servicio en el constructor

  ngOnInit(): void {
    // Intenta obtener el usuario del servicio
    let user = this.globalUserService.getCurrentUser();

    // Si no hay usuario en el servicio, busca en localStorage
    if (!user) {
      user = JSON.parse(localStorage.getItem('currentUser'));

      // Si encontramos un usuario en localStorage, lo guardamos en el servicio para futuras referencias
      if(user) {
        this.globalUserService.setCurrentUser(user);
      }
    }

    // Si tenemos un usuario (del servicio o localStorage), establecemos los valores correspondientes
    if (user) {
      this.senderName = user.username;
      this.playerName = user.username;
      this.senderProfile = 'assets/images/users/' + user.profile;
    }
  }
  // User Profile Update
  imageURL: string | undefined;

/*
Este código define una función llamada fileChange que se activa cuando un elemento de entrada de archivo cambia.
Lee el archivo seleccionado utilizando la API FileReader y establece su resultado como una URL de imagen imageURL.
Luego selecciona todos los elementos con el ID userProfile y establece su origen a la URL de la imagen.
Este código probablemente se utiliza para cargar y mostrar imágenes de perfil de usuario.
*/
  fileChange(event:any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll('#user_profile').forEach((element:any) => {
        element.src = this.imageURL;
      });
    }
    reader.readAsDataURL(file)
  }

  // User Name Update
  edit_userName(message) {
    this.playerName = this.senderName
    document.getElementById("user_name").classList.toggle("visually-hidden");
    document.getElementById("user_name_edit").classList.toggle("visually-hidden");
    document.getElementById("edit-user-name").classList.toggle("visually-hidden");
  }

  // User Name Update
userNameChange() {
  this.senderName = this.playerName
    document.getElementById("user_name").classList.toggle("visually-hidden");
    document.getElementById("edit-user-name").classList.toggle("visually-hidden");
    document.getElementById("user_name_edit").classList.toggle("visually-hidden");

}

}
