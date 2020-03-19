import { Validators } from "@angular/forms";

export default [
  {
    type: "theme-loc",
    name: "Selbst-Lokalisation",
    developer: [
      {
        type: "input",
        name: "text",
        inputType: "area",
        label: "Aufgabenstellung",
        text:
          "Wo bist du jetzt? Tippe auf die Karte.",
        info:
          "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
        validation: [Validators.required, Validators.minLength(4)]
      }
    ]
  },
  {
    type: "theme-object",
    name: "Objekt-Lokalisation",
    developer: [
      {
        type: "select",
        label: "Das gesuchte Objekt",
        name: "question-type",
        selectOptions: [
          {
            label: "... wird auf der Karte angezeigt",
            name: "question-type-map",
            items: [
              {
                type: "input",
                name: "text",
                inputType: "area",
                label: "Aufgabenstellung",
                text: "",
                info:
                  "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "map",
                name: "polygon",
                featureType: "polygon",
                label: "Objektposition",
                info:
                  "Markiere das Objekt, das der Spieler in seiner Umgebung finden soll. Diese Markierung wird dem Spieler im Spiel angezeigt. Klicke dazu auf das kleine Quadrat, umrande das Objekt dann mit mehreren Klicks und tippe auf den zuletzt gewählten Punkt, um deine Auswahl zu bestätigen.",
                validation: [Validators.required]
              },
              {
                type: "select",
                label: "Der Spieler antwortet",
                name: "answer-type",
                selectOptions: [
                  {
                    label: "... durch Wählen eines Fotos (Multiple Choice)",
                    name: "multiple-choice",
                    text: "Finde das markierte Haus in deiner Umgebung. Wähle das passende Foto.",
                    items: [
                      {
                        type: "photoUploadMultipleChoice",
                        name: "multiple-choice",
                        label: "Multiple Choice",
                        validation: [Validators.required]
                      }
                    ]
                  },
                  {
                    label: "... mit der Aufnahme eines Fotos",
                    name: "take-photo",
                    text: "Finde das markierte Haus in deiner Umgebung. Mache ein Foto davon.",
                    items: []
                  }
                ]
              }
            ]
          },
          {
            label: "... wird als Foto gezeigt",
            name: "photo",
            items: [
              {
                type: "input",
                name: "text",
                inputType: "area",
                label: "Aufgabenstellung",
                text:
                  "Suche dieses Haus in deiner Umgebung. Finde es auf der Karte und tippe es an.",
                info:
                  "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "photoUpload",
                name: "photo",
                label: "Foto des zu suchenden Objekts",
                text: "",
                info:
                  "Wähle ein Foto vom Objekt, das der Spieler auf der Karte finden soll.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "map",
                name: "polygon",
                featureType: "polygon",
                label: "Objektposition",
                info:
                  "Markiere das fotografierte Objekt. Diese Markierung wird dem Spieler im Spiel NICHT angezeigt. Klicke dazu auf das kleine Quadrat, umrande dann das Objekt mit mehreren Klicks und tippe auf den zuletzt gewählten Punkt, um deine Auswahl zu bestätigen.",
                validation: [Validators.required]
              }
            ]
          },
          {
            label: "... wird mit einem Text beschrieben",
            name: "description",
            items: [
              {
                type: "input",
                name: "object-description",
                inputType: "area",
                label: "Objektbeschreibung",
                text: "",
                info:
                  "Beschreibe das Objekt, das der Spieler finden soll, möglichst genau.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "input",
                name: "text",
                inputType: "area",
                label: "Aufgabenstellung",
                text: "",
                info:
                  "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "select",
                label: "Der Spieler antwortet",
                name: "answer-type",
                selectOptions: [
                  {
                    label: "... durch Setzen einer Kartenmarkierung",
                    name: "set-point",
                    text: "Finde das Haus auf der Karte. Tippe es an.",
                    items: [
                      {
                        type: "map",
                        name: "polygon",
                        featureType: "polygon",
                        label: "Objektposition",
                        info:
                          "Markiere das beschriebene Objekt. Diese Markierung wird dem Spieler im Spiel NICHT angezeigt. Klicke dazu auf das kleine Quadrat, umrande dann das Objekt mit mehreren Klicks und tippe auf den zuletzt gewählten Punkt, um deine Auswahl zu bestätigen.",
                        validation: [Validators.required]
                      }
                    ]
                  },
                  {
                    label: "... durch Wählen eines Fotos (Multiple Choice)",
                    name: "select-photo",
                    text: "Wähle das passende Foto.",
                    items: [
                      {
                        type: "photoUploadMultipleChoice",
                        name: "multiple-choice",
                        label: "Multiple Choice",
                        validation: [Validators.required]
                      }
                    ]
                  },
                  {
                    label: "... mit der Aufnahme eines Fotos",
                    name: "take-photo",
                    text: "Mache ein Foto davon.",
                    items: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: "theme-direction",
    name: "Richtungsbestimmung",
    developer: [
      {
        type: "select",
        label: "Die gesuchte Richtung",
        name: "question-type",
        selectOptions: [
          {
            label: "... wird auf der Karte angezeigt",
            name: "question-type-map",
            items: [
              {
                type: "input",
                name: "text",
                inputType: "area",
                label: "Aufgabenstellung",
                text: "",
                info:
                  "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "map",
                name: "direction",
                featureType: "direction",
                label: "Richtung auf der Karte",
                info:
                  "Markiere die Richtung, in die der Spieler blicken soll, auf der Karte. Diese Markierung wird ihm im Spiel angezeigt. Setze dazu den roten Ring um die Position des Spielers, die er zu Aufgabenbeginn hat. Drehe die Karte nun so, dass der Pfeil in die gewünschte Richtung zeigt.",
                validation: [Validators.required]
              },
              {
                type: "select",
                label: "Der Spieler antwortet",
                name: "answer-type",
                selectOptions: [
                  {
                    label: "... durch Auswahl eines Fotos (Multiple Choice)",
                    name: "multiple-choice",
                    text: "Drehe dich in die Richtung, die auf der Karte zu sehen ist. Wähle das passende Foto dazu.",
                    items: [
                      {
                        type: "photoUploadMultipleChoice",
                        name: "multiple-choice",
                        label: "Multiple Choice",
                        info:
                          "Lade ein Foto vom dem zu suchenden Objekt hoch sowie drei weitere Fotos, die nicht der korrekten Lösung entsprechen.",
                        validation: [Validators.required]
                      }
                    ]
                  },
                  {
                    label: "... durch Einnehmen der Richtung",
                    type: "rotateTo",
                    text: "Drehe dich in die Richtung, die auf der Karte zu sehen ist.",
                    items: []
                  }
                ]
              }
            ]
          },
          {
            label: "... wird mit einem Pfeil vorgegeben",
            name: "question-type-arrow",
            items: [
              {
                type: "input",
                name: "text",
                inputType: "area",
                label: "Aufgabenstellung",
                text:
                  "Drehe dich, bis die Pfeile in die gleiche Richtung zeigen.",
                info:
                  "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt. Die Karte wird im Spiel ausgeblendet und der Spieler sieht zwei Pfeile, die er in dieselbe Richtung bringen muss, indem er seine eigene Blickrichtung verändert.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "map",
                name: "direction",
                featureType: "direction",
                label: "Gewünschte Blickrichtung",
                info:
                  "Markiere die Richtung, in die der Spieler blicken soll, auf der Karte. Die App wird den Spieler in diese Richtung leiten, ohne die Karte anzuzeigen. Setze dazu den roten Ring um die Position des Spielers, die er zu Aufgabenbeginn hat. Drehe die Karte nun so, dass der Pfeil in die gewünschte Richtung zeigt.",
                validation: [Validators.required]
              }
            ]
          },
          {
            label: "... entspricht der aktuellen Blickrichtung",
            name: "question-type-current-direction",
            items: [
              {
                type: "input",
                name: "text",
                inputType: "area",
                label: "Aufgabenstellung",
                text:
                  "Wohin siehst du jetzt? Markiere deine Blickrichtung auf der Karte.",
                info:
                  "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
              }
            ]
          },
          {
            label: "... wird mit einem Foto angezeigt",
            name: "photo",
            items: [
              {
                type: "input",
                name: "text",
                inputType: "area",
                label: "Aufgabenstellung",
                text:
                  "Drehe dich in die Richtung vom Foto. Markiere deine Blickrichtung auf der Karte.",
                info:
                  "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "photoUpload",
                name: "photo",
                label: "Foto der zu suchenden Richtung",
                info:
                  "Wähle ein Foto, das die gesuchte Blickrichtung zeigt.",
                validation: [Validators.required, Validators.minLength(4)]
              },
              {
                type: "map",
                name: "direction",
                featureType: "direction",
                label: "Richtung auf der Karte",
                info:
                  "Markiere die Richtung, in die der Spieler blicken soll, auf der Karte. Diese Markierung wird im Spiel NICHT angezeigt. Setze dazu den roten Ring um die Position des Spielers, die er zu Aufgabenbeginn hat. Drehe die Karte nun so, dass der Pfeil in die gewünschte Richtung zeigt.",
                validation: [Validators.required]
              }
            ]
          }
        ]
      }
    ]
  }
  // {
  //     "type": "theme-object",
  //     "name": "Objektsuche",
  //     "developer": [
  //         {
  //             "type": "input",
  //             "name": "text",
  //             "inputType": "area",
  //             "label": "Aufgabenstellung",
  //             "text": "Wo befindest du dich gerade? Markiere deine Position mit einem Klick auf der Karte.",
  //             "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt",
  //             validation: [Validators.required, Validators.minLength(4)]
  //         }
  //     ]
  // }
];
