enum QuestionType {
    MAP_TARGET
}

enum AnswerType {
    POSITION
}

export default [
    {
        category: "navTask",
        name: "Navigation zur Zielfahne",
        question: {
            type: QuestionType.MAP_TARGET,
            text: "Gehe zur Fahne."
        },
        answer: {
            type: AnswerType.POSITION
        },
        evaluate: "distanceToPoint",
    }, {
        category: "navTask",
        name: "Navigation mit Richtungspfeil",
        questionType: "textDirection",
        answerType: "position",
        evaluate: "distanceToPoint",
        settings: {
            text: "Gehe zur Fahne."
        }
    }, {
        category: "navTask",
        name: "Navigation mit Textanweisung",
        questionType: "text",
        answerType: "position",
        evaluate: "distanceToPoint",
        settings: {
            text: "Gehe zur Fahne."
        }
    }
]