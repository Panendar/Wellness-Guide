const STORAGE_KEY = 'wellness_routine';

function saveRoutine(routine) {
    routine.createdAt = new Date().toISOString();
    const jsonString = JSON.stringify(routine);
    localStorage.setItem(STORAGE_KEY, jsonString);
}

function loadRoutine() {
    const storedString = localStorage.getItem(STORAGE_KEY);
    if (!storedString) {
        return null;
    }
    return JSON.parse(storedString);
}

export { saveRoutine, loadRoutine };
