import { Validators } from '@angular/forms';

export default [
    {
        "type": "theme-loc",
        "name": "Selbst-Lokalisation",
        "developer": [
            {
                "type": "input",
                "name": "text",
                "inputType": "area",
                "label": "Aufgabenstellung",
                "text": "Wo befindest du dich gerade? Markiere deine Position mit einem Klick auf der Karte.",
                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt",
                validation: [Validators.required, Validators.minLength(4)]
            }
        ]
    },
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
]