import { Validators } from '@angular/forms';


export default [
    {
        "type": "nav-flag",
        "name": "Navigation zur Zielfahne",
        "developer": [
            {
                "type": "input",
                "name": "text",
                "inputType": "area",
                "label": "Aufgabenstellung",
                "text": "Gehe zur nächsten Zielfahne.",
                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt",
                validation: [Validators.required, Validators.minLength(4)]
            },
            {
                "type": "map",
                "name": "point",
                "featureType": "point",
                "label": "Zielort",
                "info": "Dieser Zielort wird dem Spieler im Spielverlauf mit einer Zielfahne auf der Karte angezeigt",
                validation: [Validators.required]
            }
        ]
    },
    {
        "type": "nav-arrow",
        "name": "Navigation mit Richtungspfeil",
        "developer": [
            {
                "type": "input",
                "name": "text",
                "inputType": "area",
                "label": "Aufgabenstellung",
                "text": "Folge dem Pfeil bis zum nächsten Ziel.",
                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt",
                validation: [Validators.required, Validators.minLength(4)]
            },
            {
                "type": "map",
                "name": "point",
                "featureType": "point",
                "label": "Zielort",
                "info": "Zu diesem Zielort wird der Spieler mithilfe eines Richtungspfeils geleitet. Die Karte ist während der Aufgabe nicht sichtbar",
                validation: [Validators.required]
            }
        ]
    },
    {
        "type": "nav-text",
        "name": "Navigation mit Textanweisung",
        "developer": [
            {
                "type": "map",
                "name": "point",
                "featureType": "point",
                "label": "Zielort (und Zwischenziele)",
                "info": "Der letztgewählte Ort wir dem Spieler als Ziel auf der Karte angezeigt. Alle weiteren Ziele sind Zwischenziele, die auf der Karte nicht angezeigt werden, also unsichtbar sind. In der Aufgabenübersicht könnenden unsichtbaren Zwischenzielen nachträglich thematische Aufgaben zugeordnet werden.",
                validation: [Validators.required]
            },
            {
                "type": "input",
                "name": "text",
                "inputType": "area",
                "label": "Navigationsanweisung(en)",
                "info": "Diese Navigationsanweisungen werden dem Spieler im Spielverlauf angezeigt.Für jedes Zwischenziel muss eine eigene Navigationsanweisung formuliert werden",
                validation: [Validators.required, Validators.minLength(4)]
            },
        ]
    },
    {
        "type": "nav-route",
        "name": "Navigation entlang einer Route",
        "developer": [
            {
                "type": "input",
                "name": "text",
                "inputType": "area",
                "label": "Aufgabenstellung",
                "text": "Gehe entlang der Route bis zur nächsten Zielfahne.",
                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
            },
            {
                "type": "map",
                "name": "point",
                "featureType": "point",
                "label": "Route (und Zwischenziele)",
                "info": "Wähle die zu laufende Route durch einfaches Klicken auf der Karte. Wähle „unsichtbare“ Zwischenziele mit einem Doppelklick. In der Aufgabenübersicht können den unsichtbaren Zwischenzielen nachträglich thematische Aufgaben zugeordnet werden.",
                validation: [Validators.required]
            },
        ]
    },
    // {
    //     "type": "nav-text",
    //     "name": "Textnavigation",
    //     "developer": [
    //         {
    //             "type": "input",
    //             "name": "nav-task-text",
    //             "inputType": "area",
    //             "label": "Navigationsanweisung",
    //             "text": "",
    //             "info": "Notiere hier deine Navigationsanweisung an den Spieler:",
    //             validation: [Validators.required, Validators.minLength(4)]
    //         },
    //         {
    //             "type": "map",
    //             "name": "nav-task-map",
    //             "featureType": "point",
    //             "info": "Wähle den korrekten Zielort",
    //             "label": "Zielort",
    //             validation: [Validators.required]
    //         }
    //     ]
    // },
    // {
    //     "type": "nav-target",
    //     "name": "Zielnavigation",
    //     "developer": [
    //         {
    //             "type": "map",
    //             "name": "nav-task-text",
    //             "featureType": "point",
    //             "name": "nav-task-map",
    //             "info": "Wähle den Zielort"
    //         },
    //         {
    //             "type": "input",
    //             "inputType": "area",
    //             "label": "Navigationsanweisung",
    //             "text": "Laufe bis zum nächsten Ziel. Bestätige mit OK, wenn du angekommen bist.",
    //             "info": "Aufgabenstellung an den Spieler"
    //         }
    //     ]
    // },
    // {
    //     "type": "nav-arrow",
    //     "name": "Pfeilnavigation",
    //     "developer": [
    //         {
    //             "type": "info",
    //             "text": "Wähle den Zielort"
    //         },
    //         {
    //             "type": "map",
    //             "featureType": "point"
    //         },
    //         {
    //             "type": "info",
    //             "text": "Aufgabenstellung an den Spieler"
    //         },
    //         {
    //             "type": "text-input",
    //             "inputType": "area",
    //             "label": "Navigationsanweisung",
    //             "text": "Folge dem Pfeil bis zum nächsten Ziel."
    //         }
    //     ]
    // },
    // {
    //     "type": "nav-route",
    //     "name": "Routennavigation",
    //     "developer": [
    //         {
    //             "type": "map",
    //             "featureType": "point",
    //             "name": "nav-task-map-end",
    //             "info": "Wähle den Zielort"
    //         },
    //         {
    //             "type": "map",
    //             "featureType": "route",
    //             "name": "nav-task-map-route",
    //             "info": "Markiere möglichst genau eine Route, die der Spieler gehen soll"
    //         },
    //         {
    //             "type": "input",
    //             "inputType": "area",
    //             "label": "Navigationsanweisung",
    //             "text": " Folge der vorgegebenen Route bis zum nächsten Ziel.",
    //             "info": "Aufgabenstellung an den Spieler",
    //             "name": "nav-task"
    //         }
    //     ]
    // }
]