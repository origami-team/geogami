import {BaseQuestionType} from './questionType.model'
import {BaseAnswerType} from './answerType.model'

export interface Task {
    category: String
    questionType: BaseQuestionType
    answerType: BaseAnswerType
    evaluate: String
    settings: {
        confirmation: String,
        mapFeatures: any,
        avatarSpeed: number,
        showEnvSettings: boolean,
        showPathVisualization: boolean,
        mapSize: number,
    }
}