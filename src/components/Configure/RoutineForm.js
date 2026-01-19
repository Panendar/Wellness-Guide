import React, { useState } from "react";
import { saveRoutine } from "../../services/storageService";

function RoutineForm({ selectedYogasanas }) {
  const [durations, setDurations] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleDurationChange(yogasanaId, newDuration) {
    setDurations({
      ...durations,
      [yogasanaId]: newDuration
    });
  }

  function validateRoutine() {
    if (
      selectedYogasanas.length < 3 ||
      selectedYogasanas.length > 5
    ) {
      setError("Please select 3-5 yogasanas");
      return false;
    }

    for (let yogasana of selectedYogasanas) {
      const duration = durations[yogasana.id];
      if (!duration || duration <= 0) {
        setError(
          "Please enter valid durations for all yogasanas"
        );
        return false;
      }
    }

    setError("");
    return true;
  }

  async function handleSaveRoutine() {
    if (!validateRoutine()) return;

    const routineObject = {
      selectedYogasanas: selectedYogasanas.map((y) => ({
        yogasana: y.id,
        durationSeconds: parseInt(durations[y.id], 10)
      }))
    };

    saveRoutine(routineObject);
    setSuccessMessage(
      "Routine saved! Switch to Practice mode to begin."
    );
  }

  return (
    <div>
      <h2>Build Your Routine</h2>

      {selectedYogasanas.map((yogasana) => (
        <div key={yogasana.id}>
          <div>{yogasana.name}</div>

          <label>
            Duration (seconds):
            <input
              type="number"
              value={
                durations[yogasana.id] ||
                yogasana.suggestedDuration
              }
              placeholder={yogasana.suggestedDuration}
              onChange={(e) =>
                handleDurationChange(
                  yogasana.id,
                  e.target.value
                )
              }
            />
          </label>
        </div>
      ))}

      <button onClick={handleSaveRoutine}>
        Save Routine
      </button>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {successMessage && (
        <p style={{ color: "green" }}>
          {successMessage}
        </p>
      )}
    </div>
  );
}

export default RoutineForm;
