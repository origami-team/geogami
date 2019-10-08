import { Validators } from '@angular/forms';


export default [
    {
        "type": "nav-text",
        "name": "Textnavigation",
        "developer": [
            {
                "type": "input",
                "name": "nav-task-text",
                "inputType": "area",
                "label": "Navigationsanweisung",
                "text": "",
                "info": "Notiere hier deine Navigationsanweisung an den Spieler:",
                validation: [Validators.required, Validators.minLength(4)]
            },
            {
                "type": "map",
                "name": "nav-task-map",
                "featureType": "point",
                "info": "Wähle den korrekten Zielort",
                validation: [Validators.required]
            }
        ]
    },
    {
        "type": "nav-target",
        "name": "Zielnavigation",
        "developer": [
            {
                "type": "map",
                "featureType": "point",
                "name": "nav-task-map",
                "info": "Wähle den Zielort"
            },
            {
                "type": "input",
                "inputType": "area",
                "label": "Navigationsanweisung",
                "text": "Laufe bis zum nächsten Ziel. Bestätige mit OK, wenn du angekommen bist.",
                "info": "Aufgabenstellung an den Spieler"
            }
        ]
    },
    {
        "type": "nav-arrow",
        "name": "Pfeilnavigation",
        "developer": [
            {
                "type": "info",
                "text": "Wähle den Zielort"
            },
            {
                "type": "map",
                "featureType": "point"
            },
            {
                "type": "info",
                "text": "Aufgabenstellung an den Spieler"
            },
            {
                "type": "text-input",
                "inputType": "area",
                "label": "Navigationsanweisung",
                "text": "Folge dem Pfeil bis zum nächsten Ziel."
            }
        ]
    },
    {
        "type": "nav-route",
        "name": "Routennavigation",
        "developer": [
            {
                "type": "info",
                "text": "Wähle den Zielort"
            },
            {
                "type": "map",
                "featureType": "point"
            },
            {
                "type": "info",
                "text": "Markiere möglichst genau eine Route, die der Spieler gehen soll"
            },
            {
                "type": "map",
                "featureType": "route"
            },
            {
                "type": "info",
                "text": "Aufgabenstellung an den Spieler"
            },
            {
                "type": "text-input",
                "inputType": "area",
                "label": "Navigationsanweisung",
                "text": " Folge der vorgegebenen Route bis zum nächsten Ziel."
            }
        ]
    }
]