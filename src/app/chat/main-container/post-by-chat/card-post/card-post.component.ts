import { Component, Input, OnInit } from '@angular/core';
import { Publicacion } from '../../../../interfaces/kpi-post-chat.interface';

@Component({
  selector: 'app-card-post',
  templateUrl: './card-post.component.html',
  styleUrls: ['./card-post.component.scss']
})
export class CardPostComponent implements OnInit {
  @Input() publicaciones: Publicacion[] = [];
  ngOnInit() { 
    console.log(this.publicaciones);
  }
}
