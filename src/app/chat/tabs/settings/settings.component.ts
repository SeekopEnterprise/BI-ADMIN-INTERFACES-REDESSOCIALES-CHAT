import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
    const user = window.localStorage.getItem('currentUser');
    this.senderName = JSON.parse(user).username
    this.playerName = JSON.parse(user).username
    this.senderProfile = 'assets/images/users/'+JSON.parse(user).profile
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
