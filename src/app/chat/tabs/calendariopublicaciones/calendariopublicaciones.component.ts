import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatDatepickerModule, MatDatepicker} from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core'; 
@Component({
  selector: 'app-calendariopublicaciones',
  templateUrl: './calendariopublicaciones.component.html',
  styleUrls: ['./calendariopublicaciones.component.scss']
})

export class CalendariopublicacionesComponent implements OnInit {

  selected: Date | null;
  constructor(){

  }

  ngOnInit(): void {
  
  }

}
