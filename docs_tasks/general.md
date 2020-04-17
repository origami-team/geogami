Fragetypen:                                 Code:
Text                                        "text"      
Text mit Zielfahne                          "textMapTarget"      
Text mit Bild                               "textPhoto"
Text mit Richtungspfeil                     "textDirection"
Text mit Kartenfeature                      "textMapFeature"
Text mit Ausrichtungspfeil                  "textOrientation"


Antworttypen:
Position einnehmen                          "position"
In Richtung drehen                          "direction"
Karte - Punkt klicken                       "mapPoint"
Karte - Blickrichtung einzeichnen           "mapDirection"
Multiple Choice Auswahl                     "multipleChoice"
Foto aufnehmen                              "photo"

Auswerttypen:
Keine Auswertung                            "evalNone"
Punkt in Polygon?                           "evalPointInPolygon"
Distanz des Punktes zu Position             "evalDistanceToPoint"
Ausgewähltes Foto richtig?                  "evalMultipleChoice"
Aktuelle Blickrichtung korrekt?             "evalDirection"
Eingezeichnete Blickrichtung korrekt?       "evalMapDirection"

Jeder Fragetyp gehört zu einer Kategorie
- Navigationsaufgabe                        "navTask"
- Objekt-Lokalisation
- Richtungsbestimmung


Navigationsaufgaben:
[
    {
        category:       "navTask",
        questionType:   "textMapTarget",
        answerType:     "position",
        evaluate:       "distanceToPoint"
        settings: {
            text:           "Gehe zur Fahne."
            confirmation:   "true",
            target:         GeolocationPosition
        }
    }, {
        category:       "navTask",
        questionType:   "textDirection",
        answerType:     "position",
        evaluate:       "distanceToPoint"
        text:           "Gehe zur Fahne."
    }, {
        category:       "navTask",
        questionType:   "text",
        answerType:     "position",
        evaluate:       "distanceToPoint"
        text:           "Gehe zur Fahne."
    }
]

Thematische Aufgaben:
[
    // Selbstlokalisation
    {
        category:       "selfLocaization"
        questionType:   "text",
        answerType:     "mapPoint",
        evaluate:       "evalDistanceToPoint"
        text:           "Wo bist du jetzt? Tippe auf die Karte."
    }, 
    // Objekt-Lokalisation
    {
        category:       "objectLocalization"
        questionType:   "textMapFeature",       // polygon
        answerType:     "multipleChoice",
        evaluate:       "evalMultipleChoice"
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization"
        questionType:   "textMapFeature",       // polygon
        answerType:     "photo",
        evaluate:       "evalNone"
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization"
        questionType:   "textPhoto",
        answerType:     "mapPoint",
        evaluate:       "evalPointInPolygon"
        text:           "Suche dieses Haus in deiner Umgebung. Finde es auf der Karte und tippe es an."
    }, {
        category:       "objectLocalization"
        questionType:   "text",
        answerType:     "mapPoint",
        evaluate:       "evalPointInPolygon"
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization"
        questionType:   "text",
        answerType:     "multipleChoice",
        evaluate:       "evalMultipleChoice"
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization"
        questionType:   "text",
        answerType:     "photo",
        evaluate:       "evalNone"
        text:           "LOREM IPSUM"
    }
    // Richtungsbestimmung
    {
        category:       "direction"
        questionType:   "textMapFeature",       // direction marker
        answerType:     "multipleChoice",
        evaluate:       "evalMultipleChoice"
        text:           "LOREM IPSUM"
    }, {
        category:       "direction"
        questionType:   "textMapFeature",       // direction marker
        answerType:     "direction",
        evaluate:       "evalDirection"
        text:           "LOREM IPSUM"
    }, {
        category:       "direction"
        questionType:   "textOrientation",       
        answerType:     "direction",
        evaluate:       "evalDirection"
        text:           "Drehe dich, bis die Pfeile in die gleiche Richtung zeigen."
    }, {
        category:       "direction"
        questionType:   "text",       
        answerType:     "mapDirection",
        evaluate:       "evalMapDirection"
        text:           "Wohin siehst du jetzt? Markiere deine Blickrichtung auf der Karte."
    }, {
        category:       "direction"
        questionType:   "textPhoto",       
        answerType:     "mapDirection",
        evaluate:       "evalMapDirection"
        text:           "Drehe dich in die Richtung vom Foto. Markiere deine Blickrichtung auf der Karte."
    }
]