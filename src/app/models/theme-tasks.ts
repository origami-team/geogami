enum QuestionType {
    TEXT,
    MAP_FEATURE
}

export default [
    {
        name:           "Selbst-Lokalisation",
        category:       "selfLocaization",
        question:       {
            type: QuestionType.TEXT,
            text: "Wo bist du jetzt? Tippe auf die Karte."
        },
        answerType:     "mapPoint",
        evaluate:       "evalDistanceToPoint",
    }, 
    {
        category:       "objectLocalization",
        questionType:   "textMapFeature",
        question:       {
            type: QuestionType.MAP_FEATURE,
            text: "Finde das markierte Haus in deiner Umgebung. Wähle das passende Foto."
        },       
        answerType:     "multipleChoice",
        evaluate:       "evalMultipleChoice",
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization",
        questionType:   "textMapFeature",       
        answerType:     "photo",
        evaluate:       "evalNone",
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization",
        questionType:   "textPhoto",
        answerType:     "mapPoint",
        evaluate:       "evalPointInPolygon",
        text:           "Suche dieses Haus in deiner Umgebung. Finde es auf der Karte und tippe es an."
    }, {
        category:       "objectLocalization",
        questionType:   "text",
        answerType:     "mapPoint",
        evaluate:       "evalPointInPolygon",
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization",
        questionType:   "text",
        answerType:     "multipleChoice",
        evaluate:       "evalMultipleChoice",
        text:           "LOREM IPSUM"
    }, {
        category:       "objectLocalization",
        questionType:   "text",
        answerType:     "photo",
        evaluate:       "evalNone",
        text:           "LOREM IPSUM"
    },
    {
        category:       "direction",
        questionType:   "textMapFeature",       
        answerType:     "multipleChoice",
        evaluate:       "evalMultipleChoice",
        text:           "LOREM IPSUM"
    }, {
        category:       "direction",
        questionType:   "textMapFeature",       
        answerType:     "direction",
        evaluate:       "evalDirection",
        text:           "LOREM IPSUM"
    }, {
        category:       "direction",
        questionType:   "textOrientation",       
        answerType:     "direction",
        evaluate:       "evalDirection",
        text:           "Drehe dich, bis die Pfeile in die gleiche Richtung zeigen."
    }, {
        category:       "direction",
        questionType:   "text",       
        answerType:     "mapDirection",
        evaluate:       "evalMapDirection",
        text:           "Wohin siehst du jetzt? Markiere deine Blickrichtung auf der Karte."
    }, {
        category:       "direction",
        questionType:   "textPhoto",       
        answerType:     "mapDirection",
        evaluate:       "evalMapDirection",
        text:           "Drehe dich in die Richtung vom Foto. Markiere deine Blickrichtung auf der Karte."
    }
]