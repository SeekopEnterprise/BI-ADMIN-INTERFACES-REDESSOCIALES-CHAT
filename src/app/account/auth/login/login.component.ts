import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { environment } from '../../../../environments/environment';
import { GlobalUserService } from '../../../services/global-user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted = false;
  error = '';
  returnUrl: string;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private globalUserService: GlobalUserService, private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, public authenticationService: AuthenticationService, public authFackservice: AuthfakeauthenticationService) { }


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['chatvia@themesbrand.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
    });

    // Verifica si el usuario ya está autenticado
    try {
      // Intenta leer localStorage. Esto fallará si estamos en un iframe de un origen distinto.
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.token) {
        // Usuario ya autenticado, redirige a index
        this.router.navigate(['/']);
      } else {
        // reset login status
        // this.authenticationService.logout();
        // get return url from route parameters or default to '/'
        // tslint:disable-next-line: no-string-literal
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      }
    } catch (e) {
      // Si falla la lectura de localStorage, asumimos que estamos en un iframe de un origen distinto.
      // En ese caso, escuchamos los mensajes del padre.
      window.addEventListener('message', (event) => {
        // Verifica el origen del mensaje
        /* if (event.origin !== 'https://parent-website.com') {
        return;
        } */
        console.log("este es el maldito evento: ", event);
        // Verifica si el usuario ya está autenticado
        const currentUser = event.data;
        if (currentUser && currentUser.token) {
          // Almacena el usuario en el servicio
          this.globalUserService.setCurrentUser(currentUser);
          console.log("Se seteo correctamente el usuario:", this.globalUserService.getCurrentUser());

          // Usuario ya autenticado, redirige a index
          this.router.navigate(['/']);
        }
      });
    }
  }


  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      if (environment.defaultauth === 'firebase') {
        this.authenticationService.login(this.f.email.value, this.f.password.value).then((res: any) => {
          this.router.navigate(['/']);
        })
          .catch(error => {
            this.error = error ? error : '';
          });
      } else if (environment.defaultauth === 'fackbackend') {
        this.authFackservice.login(this.f.email.value, this.f.password.value)
          .pipe(first())
          .subscribe(
            data => {
              this.router.navigate(['/']);
            },
            error => {
              this.error = error ? error : '';
            });
      }
    }
  }
}
