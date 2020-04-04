import { BaseAnswerType } from './answerType.model';
import {Task} from "./task.model"

export default class AnswerTypePositionComponent implements BaseAnswerType {
    task: Task;
    map: any;
    init: Function;
    onOkClicked: Function;
    destroy: Function;
}