import mapboxgl, { LngLatBounds, LngLatBoundsLike } from 'mapbox-gl';
import bbox from '@turf/bbox';


const calcBounds = (task: any): mapboxgl.LngLatBounds => {
    const bounds = new mapboxgl.LngLatBounds();

    if (task.answer.position) {
        try {
            bounds.extend(task.answer.position.geometry.coordinates);
        } catch (e) {

        }
    }

    if (task.question.geometry) {
        try {
            bounds.extend(bbox(task.question.geometry) as LngLatBoundsLike);
        } catch (e) {

        }
    }

    if (task.question.area) {
        try {
            bounds.extend(bbox(task.question.area) as LngLatBoundsLike);
        } catch (e) {

        }
    }

    if (task.question.direction) {
        try {
            bounds.extend(task.question.direction.position.geometry.coordinates);
        } catch (e) {

        }
    }

    if (task.mapFeatures?.landmarkFeatures && task.mapFeatures?.landmarkFeatures.features.length > 0) {
        try {
            bounds.extend(bbox(task.mapFeatures.landmarkFeatures) as LngLatBoundsLike);
        } catch (e) {

        }
    }

    return bounds;
};

export { calcBounds };