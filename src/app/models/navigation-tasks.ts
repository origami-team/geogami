import { QuestionType, AnswerType, TaskMode } from './types'


export const navtasks: ReadonlyArray<any> = [
    {
        category: "nav",
        type: "nav-flag",
        name: "Navigation zur Zielfahne",
        question: {
            type: QuestionType.TEXT,
            text: "Gehe zur Fahne."
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: "distanceToPoint",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            minor: undefined
        }
    }, {
        category: "nav",
        type: "nav-arrow",
        name: "Navigation mit Richtungspfeil",
        question: {
            type: QuestionType.TEXT,
            text: "Folge dem Pfeil bis zum Ziel."
        },
        answer: {
            type: AnswerType.POSITION,
            mode: TaskMode.NAV_ARROW,
            position: undefined
        },
        evaluate: "distanceToPoint",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            minor: undefined
        }
    }, {
        category: "nav",
        type: "nav-text",
        name: "Navigation mit Textanweisung",
        question: {
            type: QuestionType.NAV_INSTRUCTION,
            text: ""
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: "distanceToPoint",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            minor: undefined
        }
    }
]