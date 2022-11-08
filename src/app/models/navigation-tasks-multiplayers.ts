import { QuestionType, AnswerType, TaskMode } from './types';


export const navtasksMultiplayers: ReadonlyArray<any> = [
    {
        category: 'nav',
        type: 'nav-flag',
        //name: 'Navigation zur Zielfahne',
        name: 'Tasktypes.navigationToFlag',
        question: [
            {
                type: QuestionType.TEXT,
                text: 'Gehe zur Fahne.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Gehe zur Fahne.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Gehe zur Fahne.'
            }
        ],
        answer: [
            {
                type: AnswerType.POSITION,
                position: undefined
            },
            {
                type: AnswerType.POSITION,
                position: undefined
            },
            {
                type: AnswerType.POSITION,
                position: undefined
            }
        ],
        evaluate: 'distanceToPoint',
        settings: {}
    }, {
        category: 'nav',
        type: 'nav-arrow',
        //name: 'Navigation mit Richtungspfeil',
        name: 'Tasktypes.navigationWithArrow',
        question: {
            type: QuestionType.TEXT,
            text: 'Folge dem Pfeil bis zum Ziel.'
        },
        answer: {
            type: AnswerType.POSITION,
            mode: TaskMode.NAV_ARROW,
            position: undefined
        },
        evaluate: 'distanceToPoint',
        settings: {}
    }, {
        category: 'nav',
        type: 'nav-text',
        //name: 'Navigation mit Textanweisung',
        name: 'Tasktypes.navigationViaText',
        question: {
            type: QuestionType.NAV_INSTRUCTION,
            text: ''
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: 'distanceToPoint',
        settings: {}
    }, {
        category: 'nav',
        type: 'nav-photo',
        //name: 'Navigation mit Foto',
        name: 'Tasktypes.navigationViaPhoto',
        question: {
            type: QuestionType.NAV_INSTRUCTION_PHOTO,
            text: 'Gehe zu dem Ort, den man auf dem Foto sieht.'
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: 'distanceToPoint',
        settings: {}
    }
];