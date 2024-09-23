import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-handbook",
  templateUrl: "./handbook.component.html",
  styleUrls: ["./handbook.component.scss"],
})
export class HandbookComponent implements OnInit {
  sections = [
    {
      sectionTitle: "Draußen in der realen Welt",
      subsections: [
        /* subsection_1 R */
        {
          heading: "Spiel spielen",
          path: "assets/handbook/spiel_spielen",
          content: [
            {
              text: 'In GeoGami kannst du eigene und von anderen erstellte Spiele spielen.Für eine Liste der Spiele wählst du die Option "Spiele" im Hauptmenü aus, wenn du einen QR-Code hast, kannst du diesen einfach scannen',
              images: ["1"],
            },
            {
              text: 'Kontrolliere, ob oben im Dropdown-Menü "Realraum" ausgewählt ist und wähle zwischen Einzel- und Mehrspieler (Einzelspieler ist der Standard). Jetzt kannst du nach deinem Spiel suchen. Unten Rechts kannst du über die Map Spiele in deiner Nähe finden.',
              images: ["2", "3"],
            },
            {
              text: 'Wenn du ein Spiel ausgewählt hast, musst du deinen Spielernamen eingeben. Um GeoGami zu spielen, verwendet GeoGami Deine akutelle GPS Position, aber speichert sie nicht. Gibst du dein Einverständnis, werden GPS und Interaktionsdaten DSGVO konform gespeichert (mehr Information unter "Daten zu Lehr- und Forschungszwecken frei geben") und können später vom Ersteller der Spiels zur Auswertung genutzt werden.',
              images: ["4"],
            }
          ],
        },
        /* subsection_2 R */
        {
          heading: "Spiel erstellen",
          path: "assets/handbook/spiel_erstellen",
          content: [
            {
              text: "Du kannst beim Spiele erstellen alle Bedingungen und Schwierigkeiten selbst einstellen und sie auf die Spielenden zuschneiden. Drücke auch dafür im Hauptmenü auf Spiele.",
              images: ["1"],
            },
            {
              text: 'Unten rechts wird dir jetzt ein Plus-Symbol angezeigt. Wählst du dieses aus, kannst du ein neues Spiel erstellen. Wähle "Realraum"',
              images: ["2", "3", "4"],
            },
            {
              text: 'Erstelle jetzt die Aufgaben. Die einzelnen Aufgaben und ein Beispiel werden dir unter dem Reiter "Aufgabentypen erklärt"',
              images: ["5"],
            },
          ],
        },
        /* subsection_3 R */
        {
          heading: "Spiele bearbeiten/löschen/speichern",
          path: "assets/handbook/spiel_bearbeiten",
          content: [
            {
              text: "Du kannst von dir erstellte Spiele wieder löschen, falls sie nicht mehr benötigt werden. Du kannst sie auch noch einmal bearbeiten, wenn dir Fehler im Spiel aufgefallen sind, oder du es generell verändern möchtest.",
              images: ["1"],
            },
            {
              text: 'Gehe dafür nach dem Einloggen auf "Meine Spiele". Beachte, dass nur die zu Spielumgebung und Spielmodus passenden Spiele angezeigt werden. Klicke auf das "Bearbeiten"-Symbol rechts neben dem Spiel.',
              images: ["2"],
            },
            {
              text: "Jetzt kann das Spiel bearbeitet, gelöscht oder gespeichert werden. Wenn du das Spiel bearbeitest, sieht es genau so aus, als würdest du ein neues Spiel erstellen und dir stehen die gleichen Funktionen zur Verfügung.",
              images: ["3"],
            },
            {
              text: "Drücke zum Speichern auf das Speichersymbol oben rechts. Gib den Spielnamen und den Spielort ein. Wenn die Aufgaben es verlangen, kann der Kartenausschniit angepasst werden. Speichere das Spiel nun endgültig.",
              images: ["4"],
            },
          ],
        },
      ],
    },
    {
      sectionTitle: "Virtuelle Welt",
      subsections: [
        // subsection_1 VR
        {
          heading: "Spiel spielen",
          path: "assets/handbook/vr_spiel_spielen",
          content: [
            {
              text: 'In GeoGami kannst du eigene und von anderen erstellte Spiele spielen.Für eine Liste der Spiele wählst du die Option "Spiele" im Hauptmenü aus, wenn du einen QR-Code hast, kannst du diesen einfach scannen',
              images: ["1"],
            },
            {
              text: 'Klicke im Dropdown-Menü au "Virtuelle Welt" und wähle zwischen Einzel- und Mehrspieler (Einzelspieler ist der Standard). Jetzt kannst du nach deinem Spiel suchen.',
              images: ["2", "3"],
            },
            {
              text: 'Wenn du ein Spiel ausgewählt hast, musst du deinen Spielernamen eingeben. Um GeoGami zu spielen, verwendet GeoGami Deine akutelle GPS Position, aber speichert sie nicht. Gibst du dein Einverständnis, werden GPS und Interaktionsdaten DSGVO konform gespeichert (mehr Information unter "Daten zu Lehr- und Forschungszwecken frei geben") und können später vom Ersteller der Spiels zur Auswertung genutzt werden.',
              images: ["4"],
            },
          ],
        },
        // subsection_2 VR
        {
          heading: "VR Spiel erstellen",
          path: "assets/handbook/vr_spiel_erstellen",
          content: [
            {
              text: "Du kannst beim Spiele erstellen alle Bedingungen und Schwierigkeiten selbst einstellen und sie auf die Spielenden zuschneiden. Drücke auch dafür im Hauptmenü auf Spiele.",
              images: ["1"],
            },
            {
              text: 'Unten rechts wird dir jetzt ein Plus-Symbol angezeigt. Wählst du dieses aus, kannst du ein neues Spiel erstellen. Wähle "Virtuelle Welt"',
              images: ["2", "3", "4"],
            },
            {
              text: "Wähle eine virtuelle Welt. Diese kann mit jeder neuen Aufgabe geändert werden.Überlege, welche Eigenschaften die Welt haben soll (wieviele Straßen, Häuser, Bäume, andere Landmarken...).",
              images: ["5"],
            },
            {
              text: 'Erstelle jetzt die Aufgaben. Die einzelnen Aufgaben und ein Beispiel werden dir unter dem Reiter "Aufgabentypen erklärt"',
              images: ["6"],
            },
          ],
        },
        // subsection_3 VR
        {
          heading: "Spiele bearbeiten/löschen/speichern",
          path: "assets/handbook/vr_spiel_bearbeiten",
          content: [
            {
              text: "Du kannst von dir erstellte Spiele wieder löschen. Du kannst sie auch noch einmal bearbeiten, wenn dir Fehler im Spiel aufgefallen sind, oder du es generell verändern möchtest. Kuratiere sie, wenn du der Meinung bist, dass auch andere dieses Spiel gebrauchen könnten.",
              images: ["1"],
            },
            {
              text: 'Gehe dafür nach dem Einloggen auf "Meine Spiele". Beachte, dass nur die zu Spielumgebung und Spielmodus passenden Spiele angezeigt werden. Klicke auf das "Bearbeiten"-Symbol rechts neben dem Spiel.',
              images: ["2"],
            },
            {
              text: "Jetzt kann das Spiel bearbeitet, gelöscht oder gespeichert werden. Wenn du das Spiel bearbeitest, sieht es genau so aus, als würdest du ein neues Spiel erstellen und dir stehen die gleichen Funktionen zur Verfügung.",
              images: ["3"],
            },
            {
              text: "Drücke zum Speichern auf das Speichersymbol oben rechts. Gib den Spielnamen und den Spielort ein. Wenn die Aufgaben es verlangen, kann der Kartenausschniit angepasst werden. Speichere das Spiel nun endgültig.",
              images: ["4"],
            },
          ],
        },
      ],
    },
  ];

  constructor() {}

  ngOnInit() {}
}
