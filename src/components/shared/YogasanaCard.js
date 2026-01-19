import React from 'react';

function YogasanaCard(props) {
    const { yogasana } = props;

    return (
        <div className = "yogasana-card">
            <img src = {yogasana.image_Url} alt = {yogasana.name}></img>
            <h3>{yogasana.name}</h3>
            <p>{yogasana.benefits}</p>
        </div>
    )
}
export default YogasanaCard;