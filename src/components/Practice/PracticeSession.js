import React, { useState, useEffect } from "react";
import { loadRoutine } from "../../services/storageService";
import { getYogasanaById } from "../../services/yogasanaService";

function PracticeSession() {
  const [routine, setRoutine] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const savedRoutine = loadRoutine();
    setRoutine(savedRoutine);
  }, []);

  // If no routine exists
  if (!routine) {
    return (
      <div>
        No routine found. Please create a routine in Configure mode first.
      </div>
    );
  }

  // 6. Show completion message before displaying yogasana
  if (isComplete) {
    return <div>Routine Complete! Great job!</div>;
  }

  // 1. Get current routine item
  const currentItem = routine.selectedYogasanas[currentIndex];

  // 2. Get full yogasana details
  const yogasana = getYogasanaById(currentItem.yogasana);

  // 2–5. Handle next button logic
  function handleNext() {
    if (currentIndex + 1 >= routine.selectedYogasanas.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  return (
    <div className="practice-session">
      {/* Progress indicator */}
      <p>
        Pose {currentIndex + 1} of {routine.selectedYogasanas.length}
      </p>

      {/* Yogasana image */}
      <img
        src={yogasana.image_Url}
        alt={yogasana.name}
        style={{ width: "100%", maxWidth: "400px" }}
      />

      {/* Yogasana name */}
      <h1>{yogasana.name}</h1>

      {/* Steps */}
      <ol>
        {yogasana.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>

      {/* Duration */}
      <p>Hold for {currentItem.durationSeconds} seconds</p>

      {/* Next button */}
      <button onClick={handleNext}>Next</button>
    </div>
  );
}

export default PracticeSession;
