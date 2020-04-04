import { mapboxgl } from 'mapbox-gl'
import {Task} from './task.model'

export interface BaseAnswerType {
    task: Task
    map: mapboxgl.Map
    init: Function
    onOkClicked: Function
    destroy: Function
}