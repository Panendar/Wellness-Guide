import React from "react";

function ModeSelector(props) {
    const { currentMode, onModeChange } = props;

    return (
        <div>
            <button className={currentMode === 'configure' ? 'active' : ''} onClick= {() => onModeChange('configure')}>
                <label>Configure</label>
            </button>
            <button className={currentMode === 'practice' ? 'active' : ''} onClick= {() => onModeChange('practice')}>
                <label>Practice</label>
            </button>
        </div>
    )
}

export default ModeSelector;