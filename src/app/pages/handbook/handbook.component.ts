import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-handbook",
  templateUrl: "./handbook.component.html",
  styleUrls: ["./handbook.component.scss"],
})
export class HandbookComponent implements OnInit {
  sections = [
    /* Draußen in der realen Welt */
    {
      sectionTitle: "Draußen in der realen Welt",
      subsections: [
        /* Spiel spielen */
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
            },
          ],
        },
        /* Spiel erstellen */
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
        /* Spiele bearbeiten/löschen/speichern */
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
    /* Aufgabentypen */
    {
      sectionTitle: "Aufgabentypen",
      subsections: [
        /* Navigationsaufgaben */
        {
          heading: "Navigationsaufgaben",
          path: "assets/handbook/aufgabentypen/navigationsaufgaben",
          content: [
            {
              text: "Bei Navigationsaufgaben müssen die Spielenden immer einen bestimmten Ort erreichen um die Aufgabe zu lösen. Verschiedene Aufgabentypen legen fest welche Bedingungen dabei gelten und welche Hilfestellungen und Orientierungspunkte die Spielenden erhalten. Die einzelnen Aufgabentypen werden unter 'Lernen' genauer erläutert \n Wähle zunächst einen Aufgabentypen aus der Liste aus.",
              images: ["1"],
            },
            {
              text: "Lege die Aufgabenstellug und den Zielort fest. Je mehr Orientierungspunkte es um die Fahne herum gibt, desto leichter ist es sie zu finden.",
              images: ["2"],
            },
            {
              text: 'Nutze ggf. die besonderen Tools (unter "weitere Einstellungen" erklärt) um die Schwierigkeit und den Lernprozess zu optimieren und auf deine Testungen anzupassen. (Link)\n Bestimme den Radius, der als erfolgreiches erreichen des Zielorts gewertet wird. Setzt du den Radius zu klein, kann es sein, dass Spielende die Aufgabe richtig lösen, dies aber nicht erkannt wird. Setzt du den Radius zu groß, kann die Aufgabe fälschlicherweise als richtig erkannt werden. Probiere dein Spiel deshalb am besten selbst aus. \n Klicke auf Kartenfeatures um Eigenschaften der Karte und der Marker einzustellen. Diese sind wichtig, um den Schwierigkeitsgrad festzulegen und um die Aufgabe so zu gestalten, dass das was du testen möchtest, getestet werden kann. Die Eigenschaften der Karten und der Marker sind in einem eigenen Reiter erklärt. (Link)',
              images: ["3"],
            },
          ],
        },
        /* Orientierungsaufgaben */
        {
          heading: "Orientierungsaufgaben",
          path: "assets/handbook/aufgabentypen/orientierungsaufgaben",
          content: [
            {
              text: 'Bei Orientierungsaufgaben müssen die Spielenden sich oder Objekte lokalisieren, bestimmen in welche Richtung sie gucken oder freie Aufgaben lösen. Die verschiedenen Aufgabentypen werden dir unter dem Reiter "Lernen" im Hauptmenü angezeigt.\n Wähle zunächst einen Aufgabentypen aus der Liste aus. ',
              images: ["1"],
            },
            {
              text: 'Je nach Aufgabentyp musst du die Aufgabe nun präzisieren. Dafür wird dir automatisch eine Reiter-Navigation angezeigt. Auch hierfür findest du mehr unter dem Reiter "Lernen" im Hauptmenü.',
              images: ["2"],
            },
            {
              text: 'Weitere aufgabenbedingte Einstellungsoptionen werden dir automatisch angezeigt. Die Eingaben für diese Einstellungen ergeben sich aus der Aufgabe. \n Nutze ggf. die besonderen Tools (unter "weitere Einstellungen" erklärt) um die Schwierigkeit und den Lernprozess zu optimieren und auf deine Testungen anzupassen. (Link) \n Klicke auf Kartenfeatures um Eigenschaften der Karte und der Marker einzustellen. Diese sind wichtig, um den Schwierigkeitsgrad festzulegen und um die Aufgabe so zu gestalten, dass das was du testen möchtest, getestet werden kann. Die Eigenschaften der Karten und der Marker sind in einem eigenen Reiter erklärt. (Link)',
              images: ["3"],
            },
          ],
        },
        /* Freie Aufgaben */
        {
          heading: "Freie Aufgaben",
          path: "assets/handbook/aufgabentypen/freie_aufgaben",
          content: [
            {
              text: "Freie Aufgaben erlauben eine Vielfalt an Möglichkeiten, die sich in Single-Choice Aufgaben und Frage-Antwort Aufgaben klassifizieren lassen \n Es kann in beiden Aufgabentypen durch Auswahl oder Erstellen eines Fotos oder Texts geantwortet werden",
              images: ["1", "2"],
            },
            {
              text: "Bei Single-Choice Aufgaben muss genau eine Antwort richtig sein. Um dennoch mehr Antwortmöglichkeiten zu erlauben, muss das Feedback ausgestellt werden.",
              images: ["3"],
            },
          ],
        },
        /* Informationsbaustein */
        {
          heading: "Informationsbaustein",
          path: "assets/handbook/aufgabentypen/informationsblock",
          content: [
            {
              text: "Diese dient meist dazu auf kommende Aufgaben vorzubereiten. Hier kannst du für die Spielenden Erklärungen einfügen und besondere Handlungsanweisungen für kommende Aufgaben geben. \n Verfasse einen Infomationstext mit den Informationen für die kommenden Aufgaben. \n Füge, wenn du möchtest, Fotos und Grafiken hinzu. Diese können als weitere Erklärung dienen. \n Klicke auf Kartenfeatures um Eigenschaften der Karte und der Marker einzustellen. Diese sind wichtig, um den Schwierigkeitsgrad festzulegen und um die Aufgabe so zu gestalten, dass das was du testen möchtest, getestet werden kann. Die Eigenschaften der Karten und der Marker sind in einem eigenen Reiter erklärt. (Link) \n Klicke auf Kartenfeatures um Eigenschaften der Karte und der Marker einzustellen. Diese sind wichtig, um den Schwierigkeitsgrad festzulegen und um die Aufgabe so zu gestalten, dass das was du testen möchtest, getestet werden kann. Die Eigenschaften der Karten und der Marker sind in einem eigenen Reiter erklärt. (Link)",
              images: ["1"],
            },
          ],
        },
      ],
    },
    /* Virtuelle Welt */
    {
      sectionTitle: "Virtuelle Welt",
      subsections: [
        // Spiel spielen
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
        // VR Spiel erstellen
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
        // Spiele bearbeiten/löschen/speichern
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
    /* Aufgabentypen VR */
    {
      sectionTitle: "Aufgabentypen VR",
      subsections: [
        /* Navigationsaufgaben */
        {
          heading: "Navigationsaufgaben",
          path: "assets/handbook/vr_aufgabentypen/navigationsaufgaben",
          content: [
            {
              text: "Bei Navigationsaufgaben müssen die Spielenden immer einen bestimmten Ort erreichen um die Aufgabe zu lösen. Verschiedene Aufgabentypen legen fest welche Bedingungen dabei gelten und welche Hilfestellungen und Orientierungspunkte die Spielenden erhalten. Die einzelnen Aufgabentypen werden unter 'Lernen' genauer erläutert. \n Wähle zunächst einen Aufgabentypen aus der Liste aus.",
              images: ["1"],
            },
            {
              text: "Lege optional die Position des Avatars und seine Blickrichtung fest. So kannst du forcieren welchen Weg die Spielenden zurücklegen und ob sie von Beginn in die richtige Blickrichtung gucken oder nicht.",
              images: ["2"],
            },
            {
              text: 'Lege den Zielort fest. Je mehr Orientierungspunkte es um die Fahne herum gibt, desto leichter ist es sie zu finden. Nutze ggf. die besonderen Tools (unter "weitere Einstellungen" erklärt) um die Schwierigkeit und den Lernprozess zu optimieren und auf deine Testungen anzupassen. (Link) \n Bestimme den Radius, der als erfolgreiches erreichen des Zielorts gewertet wird. Setzt du den Radius zu klein, kann es sein, dass Spielende die Aufgabe richtig lösen, dies aber nicht erkannt wird. Setzt du den Radius zu groß, kann die Aufgabe fälschlicherweise als richtig erkannt werden. Probiere dein Spiel deshalb am besten selbst aus. \n Klicke auf Kartenfeatures um Eigenschaften der Karte und der Marker einzustellen. Diese sind wichtig, um den Schwierigkeitsgrad festzulegen und um die Aufgabe so zu gestalten, dass das was du testen möchtest, getestet werden kann. Die Eigenschaften der Karten und der Marker sind in einem eigenen Reiter erklärt. (Link)',
              images: ["3"],
            },
          ],
        },
        /* Orientierungsaufgaben */
        {
          heading: "Orientierungsaufgaben",
          path: "assets/handbook/vr_aufgabentypen/orientierungsaufgaben",
          content: [
            {
              text: 'Wähle zunächst einen Aufgabentypen aus der Liste aus. Je nach Aufgabentyp musst du die Aufgabe nun präzisieren. Dafür wird dir automatisch eine Reiter-Navigation angezeigt.',
              images: ["1"],
            },
            {
              text: 'Lege optional die Position des Avatars und seine Blickrichtung fest. So kannst du forcieren welchen Weg die Spielenden zurücklegen und ob sie von Beginn in die richtige Blickrichtung gucken oder nicht. So variierst du die Schwierigkeit und kannst genau das testen, was du möchtest.',
              images: ["2"],
            },
            {
              text: 'Setze nun die aufgabenbezogenen Ziele (Suchgebiet, Suchobjekt, Ausrichtung) auf der Karte fest und nimm weitere Einstelungen vor (Feedback, mehrere Versuche, Kartenfeatures).',
              images: ["3"],
            },
          ],
        },
        /* Freie Aufgaben */
        {
          heading: "Freie Aufgaben",
          path: "assets/handbook/vr_aufgabentypen/freie_aufgaben",
          content: [
            {
              text: "Freie Aufgaben erlauben eine Vielfalt an Möglichkeiten, die sich in Single-Choice Aufgaben und Frage-Antwort Aufgaben klassifizieren lassen \n Es kann in beiden Aufgabentypen durch Auswahl oder Erstellen eines Fotos oder Texts geantwortet werden. Optional kann der Avatar und seine Blickrichtung auf der Karte platziert werden.",
              images: ["1", "2"],
            },
            {
              text: "Bei Single-Choice Aufgaben muss genau eine Antwort richtig sein. Um dennoch mehr Antwortmöglichkeiten zu erlauben, muss das Feedback ausgestellt werden.",
              images: ["3"],
            },
          ],
        },
        /* Informationsbaustein */
        {
          heading: "Informationsbaustein",
          path: "assets/handbook/vr_aufgabentypen/informationsblock",
          content: [
            {
              text: "Diese dient meist dazu auf kommende Aufgaben vorzubereiten. Hier kannst du für die Spielenden Erklärungen einfügen und besondere Handlungsanweisungen für kommende Aufgaben geben. \n Füge, wenn du möchtest, Fotos und Grafiken hinzu. Verfasse einen Infomationstext mit den Informationen für die kommenden Aufgaben.",
              images: ["1"],
            },{
              text: "Setze optional den Avatar und seine Blickrichtung fest. Füge, wenn du möchtest, Fotos und Grafiken hinzu. Diese können als weitere Erklärung dienen. \n Klicke auf Kartenfeatures um Eigenschaften der Karte und der Marker einzustellen. Diese sind wichtig, um den Schwierigkeitsgrad festzulegen und um die Aufgabe so zu gestalten, dass das was du testen möchtest, getestet werden kann. Die Eigenschaften der Karten und der Marker sind in einem eigenen Reiter erklärt. (Link)",
              images: ["2"],
            },
          ],
        },
      ],
    },
    /* Kartenfeatures */
    {
      sectionTitle: "Kartenfeatures",
      subsections: [
        /* Navigationsaufgaben */
        {
          heading: "Kartenfeatures",
          path: "assets/handbook/vr_aufgabentypen/navigationsaufgaben",
          content: [
            {
              text: "Zoom: Hier kannst du einstellen, ob der Zoom auf die Aufgabe, die Karte, vom Spieler selbst oder gar nicht gesetzt werden soll.",
              images: ["no"],
            },
            {
              text: "Kartenbereich: Hier kannst du einstellen, ob der gesamte Kartenausschnitt oder ein Bestimmter ständig zu sehen ist, oder ob sich der Kartenbereich mitbewegt und somit verschieben kann.",
              images: ["no"],
            },
            {
              text: 'Kartenrotation: Hier stellst du die Ausrichtung der Karte ein (guckt man immer nach oben oder ist oben immer Norden?)',
              images: ["no"],
            },
            {
              text: 'Positionsmarker: Die Positionsmarkereinstellung verändert die Aufgabe gravierend. Ist er ausgeschaltet, müssen sich die Spielenden allein an der Umwelt orientieren um zu entscheiden wo sie sich befinden. Ist er angeschaltet, können sie sich anhand des Markers orientieren. Ist er nur zu Aufgabenbeginn angeschaltet, können sie sich einmalig am Anfang orientieren, ist er auf Knopdfruck angeschaltet, können die Spielenden selbst entscheiden, wie oft sie diese Hilfe gebrauchen',
              images: ["no"],
            },
            {
              text: 'Blickrichtungsmarker: Es gelten die gleichen Hinweise, wie beim Positionsmarker. Allerdings wird nicht nur der Ort an dem man sich befindet dargestellt, sondern auch die Richtung in die man guckt. Nur mit eingeschaltetem Positionsmarker ist diese Funktion nutzbar.',
              images: ["no"],
            },
            {
              text: 'Trackaufzeichnung; Wenn du die Trackaufzeichnung anstellst, kann der Spielende live seine eigene Spielbewegung auf der Karte sehen und visuell nachvollziehen. Bei Kindern ist es beliebt, so Formen wie einen Kreis oder ein Herz auf die Karte zu "malen". Trackaufzeichnung bezieht sich nur auf das visualisieren auf der Karte: Im Hintergrund zeichnet GeoGami immer den Track auf.',
              images: ["no"],
            },
            {
              text: 'Straßenmarkierung: Du kannst den Abschnitt der Straße, an dem du dich befindest so rot markieren. Anders als beim Positionsmarker erfährst du aber nicht deine exakte Position.',
              images: ["no"],
            },
            {
              text: 'Hervorhebung von Landmarken: Damit kannst du auf Dinge in der Landschaft hinweisen, die beispielsweise die Orientierung erleichtern können',
              images: ["no"],
            },
          ],
        }
      ],
    },
    /* "Weitere Einstellungen" für Aufgaben */
    {
      sectionTitle: "'Weitere Einstellungen' für Aufgaben",
      subsections: [
        /* Weitere Einstellungen */
        {
          heading: "Weitere Einstellungen",
          path: "assets/handbook/weitere-einstellungen",
          content: [
            {
              text: "Je nach Aufgabentyp kannst du noch weitere EInstellungen vornehmen, die das Spielerlebnis verbessern oder das Ziel der Aufgabe besser ansprechen. \n Eingabebestätigung an- und ausschalten; So bestimmst du, ob die Spielenden selber feststellen müssen, dass sie die Aufgabe richtig gelöst haben.",
              images: ["1"],
            },
            {
              text: "Fahne anzeigen; So bestimmst du den Schwierigkeitsgrad der Aufgabe, da du einstellen kannst, ob die Zielfahne auf der Karte sichtbar ist.",
              images: ["2"],
            },
            {
              text: 'Feedback an- und ausschalten; So bestimmst du ob die Spielenden direkt erfahren, ob sie die Aufgabe richtig oder falsch gelöst haben.',
              images: ["3"],
            },
            {
              text: 'Fahne auf der Karte behalten; So bestimmst du ob, das Ziel dieser Aufgabe bei den nächsten Aufgaben sichtbar bleibt.',
              images: ["4"],
            },
            {
              text: 'Mehrere Versuche einstellen; so bestimmst du, ob die Spielenden eine neue Chance erhalten, wenn sie die Aufgabe falsch lösen (nur bei Themenaufgaben).',
              images: ["5"],
            },
            {
              text: 'Genauigkeit: Hier kannst du einstellen, wie nah man sich am Ziel befinden muss, damit man als "am richtigen Ort" angesehen wird. Aufgrund von GPS-Ungenauigkeiten sollte hier keine zu kleine Distanz gewählt werden.',
              images: ["6"],
            },
            {
              text: 'Unter Kartenfeatures können noch Einstellungen zum Positionsmarker und zur Interaktion mit der Karte selbst vorgenommen werden. Unter "Lernen" im Hauptmenü können diese ausprobiert werden.',
              images: ["7"],
            },
            {
              text: 'Hervorhebung von Landmarken: Damit kannst du auf Dinge in der Landschaft hinweisen, die beispielsweise die Orientierung erleichtern können',
              images: ["no"],
            },
          ],
        }
      ],
    },
  ];

  constructor() {}

  ngOnInit() {}
}
