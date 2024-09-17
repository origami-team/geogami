import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-handbook',
  templateUrl: './handbook.component.html',
  styleUrls: ['./handbook.component.scss'],
})
export class HandbookComponent implements OnInit {

  sections = [
    {
      heading: "Spiel spielen",
      text: 'In GeoGami kannst du eigene und von anderen erstellte Spiele spielen.Für eine Liste der Spiele wählst du die Option "Spiele" im Hauptmenü aus, wenn du einen QR-Code hast, kannst du diesen einfach scannen',
      path: "assets/handbook/spielen",
      images: ["1"]
    },
    {
      heading: "Spiel spielen2",
      text: 'In GeoGami kannst du eigene und von anderen erstellte Spiele spielen.Für eine Liste der Spiele wählst du die Option "Spiele" im Hauptmenü aus, wenn du einen QR-Code hast, kannst du diesen einfach scannen2',
      path: "assets/handbook/spielen",
      images: ["2","3"]
    },
    {
      heading: "Spiel spielen3",
      text: 'In GeoGami kannst du eigene und von anderen erstellte Spiele spielen.Für eine Liste der Spiele wählst du die Option "Spiele" im Hauptmenü aus, wenn du einen QR-Code hast, kannst du diesen einfach scannen2',
      path: "assets/handbook/spielen",
      images: ["2","3"]
    }

  ]

  constructor() { }

  ngOnInit() {}

}
