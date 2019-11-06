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
    {
        "type": "theme-object",
        "name": "Objektsuche",
        "developer": [
            {
                "type": "select",
                "label": "Fragetyp",
                "name": "question-type",
                "selectOptions": [
                    {
                        "label": "... mittels Beschreibung",
                        "name": "description",
                        "items": [
                            {
                                "type": "input",
                                "name": "object-description",
                                "inputType": "area",
                                "label": "Objektbeschreibung",
                                "text": "",
                                "info": "Beschreibe das Objekt, das der Spieler finden soll, möglichst genau.",
                                validation: [Validators.required, Validators.minLength(4)]
                            },
                            {
                                "type": "input",
                                "name": "text",
                                "inputType": "area",
                                "label": "Aufgabenstellung",
                                "text": "",
                                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                                validation: [Validators.required, Validators.minLength(4)]
                            },
                            {
                                "type": "select",
                                "label": "Antworttyp",
                                "name": "answer-type",
                                "selectOptions": [
                                    {
                                        "label": "Setzen eines Kartenpunktes",
                                        "name": "set-point",
                                        "items": [
                                            {
                                                "type": "map",
                                                "name": "point",
                                                "featureType": "point",
                                                "label": "Objektposition",
                                                "info": "Umrande das Objekt, das der Spieler finden soll, mit mehreren Klicks auf der Karte. Die Markierung wird dem Spieler nicht angezeigt",
                                                validation: [Validators.required]
                                            }
                                        ]
                                    },
                                    {
                                        "label": "Wählen eines Fotos",
                                        "name": "select-photo",
                                        "items": [
                                            {
                                                "type": "photoUploadMultipleChoice",
                                                "name": "multiple-choice",
                                                "label": "Multiple Choice",
                                                "info": "Lade ein Foto vom dem zu suchenden Objekt hoch sowie drei weitere Fotos, die nicht der korrekten Lösung entsprechen.",
                                                validation: [Validators.required]
                                            }
                                        ]
                                    }, {
                                        "label": "Aufnahme eines Fotos",
                                        "name": "take-photo",
                                        "items": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "label": "... mittels Foto",
                        "name": "photo",
                        "items": [
                            {
                                "type": "input",
                                "name": "text",
                                "inputType": "area",
                                "label": "Aufgabenstellung",
                                "text": "Suche in deiner Umgebung das Objekt, das du hier auf dem Foto siehst. Klicke das Objekt auf der Karte an.",
                                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                                validation: [Validators.required, Validators.minLength(4)]
                            },
                            {
                                "type": "photoUpload",
                                "name": "photo",
                                "label": "Foto des zu suchenden Objekts",
                                "text": "",
                                "info": "Lade ein Foto von dem Objekt hoch, das der Spieler finden soll.",
                                validation: [Validators.required, Validators.minLength(4)]
                            }, {
                                "type": "map",
                                "name": "point",
                                "featureType": "point",
                                "label": "Objektposition",
                                "info": "Umrande das Objekt, das der Spieler finden soll, mit mehreren Klicks auf der Karte. Die Markierung wird dem Spieler nicht angezeigt",
                                validation: [Validators.required]
                            }
                        ]
                    }, {
                        "label": "... mittels Karte",
                        "items": [
                            {
                                "type": "input",
                                "name": "text",
                                "inputType": "area",
                                "label": "Aufgabenstellung",
                                "text": "",
                                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                                validation: [Validators.required, Validators.minLength(4)]
                            },
                            {
                                "type": "map",
                                "name": "point",
                                "featureType": "point",
                                "label": "Objektposition",
                                "info": "Umrande das Objekt, das der Spieler finden soll, mit mehreren Klicks auf der Karte. Diese Markierung wird dem Spieler während der Aufgabenstellung angezeigt",
                                validation: [Validators.required]
                            },
                            {
                                "type": "select",
                                "label": "Antworttyp",
                                "name": "answer-type",
                                "selectOptions": [
                                    {
                                        "label": "Wählen eines Fotos",
                                        "items": [
                                            {
                                                "type": "photoUploadMultipleChoice",
                                                "name": "multiple-choice",
                                                "label": "Multiple Choice",
                                                "info": "Lade ein Foto vom dem zu suchenden Objekt hoch sowie drei weitere Fotos, die nicht der korrekten Lösung entsprechen.",
                                                validation: [Validators.required]
                                            }
                                        ]
                                    }, {
                                        "label": "Aufnahme eines Fotos",
                                        "items": []
                                    },
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "type": "theme-direction",
        "name": "Richtungssuche",
        "developer": [
            {
                "type": "select",
                "label": "Fragetyp",
                "name": "question-type",
                "selectOptions": [
                    {
                        "label": "... durch Blickausrichtung",
                        "items": [
                            {
                                "type": "input",
                                "name": "text",
                                "inputType": "area",
                                "label": "Aufgabenstellung",
                                "text": "Drehe dich, bis die Pfeile übereinander liegen. Markiere deine neue Blickrichtung mit einem Klick auf der Karte.",
                                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                                validation: [Validators.required, Validators.minLength(4)]
                            },
                            {
                                "type": "map",
                                "name": "direction",
                                "featureType": "direction",
                                "label": "Gewünschte Blickrichtung",
                                "info": "Markiere die Richtung, in die der Spieler blicken soll, mit einem Klick auf der Karte. Die App wird den Spieler in diese Richtung „drehen“ und ihn daraufhin auffordern, seine neue Blickrichtung in die Karte einzuzeichnen",
                                validation: [Validators.required]
                            },
                        ]
                    }, {
                        "label": "... mittels Foto",
                        "name": "photo",
                        "items": [
                            {
                                "type": "input",
                                "name": "text",
                                "inputType": "area",
                                "label": "Aufgabenstellung",
                                "text": "Markiere die Richtung, die du auf dem Bild siehst, mit einem Klick auf der Karte.",
                                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                                validation: [Validators.required, Validators.minLength(4)]
                            },
                            {
                                "type": "photoUpload",
                                "name": "photo",
                                "label": "Foto der zu suchenden Richtung",
                                "info": " Lade ein Foto hoch, das am Startpunkt aufgenommen wurde und in die gesuchte Richtung zeigt.",
                                validation: [Validators.required, Validators.minLength(4)]
                            }, {
                                "type": "map",
                                "name": "point",
                                "featureType": "point",
                                "label": "Richtung auf der Karte",
                                "info": "Markiere die Richtung, die der Spieler finden soll, mit einem Klick auf der Karte. Diese Markierung wird dem Spieler bei Aufgabenstellung nicht angezeigt",
                                validation: [Validators.required]
                            },
                        ]
                    }, {
                        "label": "... mittels Karte",
                        "name": "question-type-map",
                        "items": [
                            {
                                "type": "input",
                                "name": "text",
                                "inputType": "area",
                                "label": "Aufgabenstellung",
                                "text": "",
                                "info": "Diese Aufgabenstellung wird dem Spieler im Spielverlauf angezeigt.",
                                validation: [Validators.required, Validators.minLength(4)]
                            },
                            {
                                "type": "map",
                                "name": "map-direction",
                                "featureType": "direction",
                                "label": "Richtung auf der Karte",
                                "info": " Markiere die Richtung, die der Spieler finden soll, mit einem Klick auf der Karte. Diese Richtung wird dem Spieler bei Aufgabenstellung auf der Karte angezeigt.",
                                validation: [Validators.required]
                            }, {
                                "type": "select",
                                "label": "Antworttyp",
                                "name": "answer-type",
                                "selectOptions": [
                                    {
                                        "label": "Einnehmen einer Blickrichtung",
                                        "items": []
                                    }, {
                                        "label": "Wählen eines Fotos",
                                        "items": [
                                            {
                                                "type": "photoUploadMultipleChoice",
                                                "name": "multiple-choice",
                                                "label": "Multiple Choice",
                                                "info": "Lade ein Foto vom dem zu suchenden Objekt hoch sowie drei weitere Fotos, die nicht der korrekten Lösung entsprechen.",
                                                validation: [Validators.required]
                                            }
                                        ]
                                    },
                                ]
                            }
                        ]
                    }
                ]
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