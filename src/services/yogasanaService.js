import yogasanaData from '../data/yogasanas.json';

function getAllYogasanas() {
    return yogasanaData.yogasanas;
}


function getYogasanaById(id) {
    const yogasanaById = yogasanaData.yogasanas.find(yogasana => yogasana.id === id);
    if (yogasanaById) {
        return yogasanaById;
    }
    return undefined;
}

export {getAllYogasanas, getYogasanaById};