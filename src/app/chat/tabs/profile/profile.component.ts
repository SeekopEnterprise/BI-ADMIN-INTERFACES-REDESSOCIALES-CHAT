import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
/**
 * Tabs-Profile component
 */
export class ProfileComponent implements OnInit {

  senderName:any;
  senderProfile:any;

  constructor() { }

  ngOnInit(): void {
    const user = window.localStorage.getItem('currentUser');
    this.senderName = JSON.parse(user).username
    this.senderProfile = 'assets/images/users/'+JSON.parse(user).profile
  }

}
