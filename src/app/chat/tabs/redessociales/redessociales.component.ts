import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { RedSocial } from './redsocial.model';

@Component({
  selector: 'app-redessociales',
  templateUrl: './redessociales.component.html',
  styleUrls: ['./redessociales.component.scss']
})

export class RedesSocialesComponent implements OnInit {
  redSocial: RedSocial[];
  redesSocialesList: any;

  constructor(private modalService: NgbModal, private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<RedSocial[]>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redessociales').subscribe(
      redesSociales => {
        const sorted = redesSociales.sort((a, b) => a.nombre > b.nombre ? 1 : -1);

        const grouped = sorted.reduce((groups, redSocial) => {
          const grupo = redSocial.nombregrupo ? redSocial.nombregrupo : 'Sin Grupo De Visualización';
          groups[grupo] = groups[grupo] || [];
          groups[grupo].push(redSocial);

          return groups;
        }, {});

        this.redesSocialesList = Object.keys(grouped).map(key => ({ key, socialRedes: grouped[key] }));
      },
      error => {
        console.error(error);
      }
    );
  }

  openContactsModal(content) {
    this.modalService.open(content, { centered: true });
  }
}
