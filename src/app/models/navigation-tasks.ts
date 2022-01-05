import { QuestionType, AnswerType, TaskMode } from './types';


export const navtasks: ReadonlyArray<any> = [
    {
        category: 'nav',
        type: 'nav-flag',
        //name: 'Navigation zur Zielfahne',
        name: 'Tasktypes.navigationToFlag',
        question: {
            type: QuestionType.TEXT,
            text: 'QuestionText.goToFlag'
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: 'distanceToPoint',
        settings: {}
    }, {
        category: 'nav',
        type: 'nav-arrow',
        //name: 'Navigation mit Richtungspfeil',
        name: 'Tasktypes.navigationWithArrow',
        question: {
            type: QuestionType.TEXT,
            text: 'QuestionText.followTheArrow'
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
            text: 'QuestionText.followTheArrow'
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: 'distanceToPoint',
        settings: {}
    }
];