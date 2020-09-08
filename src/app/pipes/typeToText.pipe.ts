import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'typeToText' })
export class TypeToTextPipe implements PipeTransform {

    textMappingsObject: object = {
        MAP_FEATURE: "... wird auf der Karte angezeigt",
        MAP_FEATURE_PHOTO: "... wird als Foto angezeigt",
        TEXT: "... wird mit einem Text beschrieben",
        MULTIPLE_CHOICE: "... durch Wählen eines Fotos",
        MAP_POINT: "... durch Markierung des Objekts auf der Karte",
        PHOTO: "... mit der Aufnahme eines Fotos",
        MULTIPLE_CHOICE_TEXT: "... durch Wählen einer Textantwort",
    }

    textMappingsDirection: object = {
        MAP_DIRECTION_MARKER: "... wird auf der Karte angezeigt",
        MAP_DIRECTION_PHOTO: "... wird mit einem Foto angezeigt",
        MAP_DIRECTION: "... wird mit einem Pfeil vorgegeben",
        TEXT: "... entspricht der aktuellen Blickrichtung",
        MULTIPLE_CHOICE: "... durch Wählen eines Fotos",
        DIRECTION: "... durch Einnehmen der Blickrichtung"
    }

    textMappingsFree: object = {
        TEXT: "Text",
        PHOTO: "Text und Foto",
        MAP_FEATURE_FREE: "Text und Kartenmarkierung",
        MULTIPLE_CHOICE: "... durch Wählen eines Fotos",
        MULTIPLE_CHOICE_TEXT: "... durch Wählen einer Textantwort",
        NUMBER: "... durch Eingabe einer Zahl"
    }

    transform(value: string, taskType: string, answer: boolean): string {
        if (taskType == "theme-object" || taskType == "nav-flag-with-answer") {
            return this.textMappingsObject[value];
        }

        if (value == "MAP_DIRECTION" && answer) {
            return "... durch Markierung der Richtung auf der Karte"
        }

        if (taskType == "free") {
            if (value === "PHOTO" && answer) {
                return "... mit der Aufnahme eines Fotos"
            }
            if (value === "TEXT" && answer) {
                return "... durch Texteingabe"
            }
            return this.textMappingsFree[value]
        }

        return this.textMappingsDirection[value];

    }
}