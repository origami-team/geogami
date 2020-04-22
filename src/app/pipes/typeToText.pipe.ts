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
        TEXT: "... mit Textanweisung",
        PHOTO: "... mit Foto",
        MAP_FEATURE: "... mit Kartenmarkierung",
        MULTIPLE_CHOICE: "... durch Wählen eines Fotos",
    }

    transform(value: string, taskType: string, answer: boolean): string {
        console.log(value, taskType, answer)
        if (taskType == "theme-object") {
            return this.textMappingsObject[value];
        }

        if (value == "MAP_DIRECTION" && answer) {
            return "... durch Markierung der Richtung auf der Karte"
        }

        if (taskType == "free") {
            if (value === "PHOTO" && answer) {
                return "... Aufnahme eines Fotos"
            }
            return this.textMappingsFree[value]
        }

        return this.textMappingsDirection[value];

    }
}