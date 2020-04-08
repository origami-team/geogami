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
                "text": "Gehe zur Fahne.",
                "info": "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
            },
            {
                "type": "map",
                "name": "point",
                "featureType": "point",
                "label": "Zielort",
                "info": "Setze einen Marker. Dieser Zielort wird dem Spieler auf der Karte als Zielfahne angezeigt.",
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
                "text": "Folge dem Pfeil bis zum Ziel.",
                "info": "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
                validation: [Validators.required, Validators.minLength(4)]
            },
            {
                "type": "map",
                "name": "point",
                "featureType": "point",
                "label": "Zielort",
                "info": "Setze einen Marker. Zu diesem Zielort wird der Spieler mithilfe eines Richtungspfeils geleitet. Die Karte ist während der Aufgabe nicht sichtbar.",
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
                "label": "Zielort",
                "info": "Setze einen Marker. Zu diesem Zielort wird der Spieler mithilfe deiner Navigationsanweisung geleitet.",
                validation: [Validators.required]
            },
            {
                "type": "input",
                "name": "text",
                "inputType": "area",
                "label": "Navigationsanweisung",
                "info": "Diese Navigationsanweisung wird dem Spieler im Spiel angezeigt. Sofern keine Zielfahne eingeblendet werden soll, muss die Navigationsanweisung sehr genau sein.",
                validation: [Validators.required, Validators.minLength(4)]
            },
        ]
    },
    //{
    //    "type": "nav-route",
    //    "name": "Navigation entlang einer Route",
    //    "developer": [
    //        {
    //            "type": "input",
    //            "name": "text",
    //            "inputType": "area",
    //            "label": "Aufgabenstellung",
    //            "text": "Folge der Route.",
    //            "info": "Diese Aufgabenstellung wird dem Spieler im Spiel angezeigt.",
    //            validation: [Validators.required, Validators.minLength(4)]
    //        },
    //        {
    //            "type": "map",
    //            "name": "point",
    //            "featureType": "point",
    //            "label": "Route (und Zwischenziele)",
    //            "info": "Wähle die zu laufende Route durch einfaches Klicken auf der Karte. Wähle „unsichtbare“ Zwischenziele mit einem Doppelklick. In der Aufgabenübersicht können den unsichtbaren Zwischenzielen nachträglich thematische Aufgaben zugeordnet werden.",
    //            validation: [Validators.required]
    //        },
    //    ]
    // },
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