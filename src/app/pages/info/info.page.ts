import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  dark: boolean = false

  constructor() {
  }

  ngOnInit() {
    this.dark = document.body.classList.contains('dark')
  }

  onDarkThemeChange() {
    document.body.classList.toggle('dark')
    this.dark = !this.dark
  }

}
