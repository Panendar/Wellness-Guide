import React, { useState, useEffect } from "react";
import { getAllYogasanas } from "./services/yogasanaService";
import ModeSelector from "./components/shared/ModeSelector";
import PracticeSession from "./components/Practice/PracticeSession";

// 1. Imports
import GoalInput from "./components/Configure/GoalInput";
import RecommendationList from "./components/Configure/RecommendationList";
import RoutineForm from "./components/Configure/RoutineForm";

function App() {
  const [mode, setMode] = useState("configure");

  // 2. & 3. State
  const [recommendations, setRecommendations] = useState([]);
  const [selectedYogasanas, setSelectedYogasanas] = useState([]);

  useEffect(() => {
    const data = getAllYogasanas();
    console.log("Yogasanas loaded:", data);
  }, []);

  return (
    <div className="app">
      <ModeSelector
        currentMode={mode}
        onModeChange={setMode}
      />

      {/* PRACTICE MODE */}
      {mode === "practice" && (
        <PracticeSession yogasanas={selectedYogasanas} />
      )}

      {/* CONFIGURE MODE */}
      {mode === "configure" && (
        <>
          {/* 4. Goal input */}
          <GoalInput onRecommendations={setRecommendations} />

          {/* 5–6. Recommendations */}
          {recommendations.length > 0 && (
            <RecommendationList
              recommendedYogasanas={recommendations}
              onSelectionChange={setSelectedYogasanas}
            />
          )}

          {/* 7–8. Routine form */}
          {selectedYogasanas.length > 0 && (
            <RoutineForm
              selectedYogasanas={selectedYogasanas}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
