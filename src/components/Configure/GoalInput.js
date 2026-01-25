import React, { useState } from "react";
import { getRecommendations } from "../../services/llmService";
import { getAllYogasanas } from "../../services/yogasanaService";

function GoalInput({ onRecommendations }) {
    const [goalText, setGoalText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleGetRecommendations() {
        if (!goalText.trim()) {
            setError("Please enter a wellness goal.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const allYogasanas = getAllYogasanas();
            const yogasanaIds = allYogasanas.map((y) => y.id);

            const recommendedIds = await getRecommendations(goalText, yogasanaIds);
            onRecommendations(recommendedIds);
        } catch (err) {
            console.error(err);
            setError(err?.message || "Could not get recommendations. Please try again.");
            onRecommendations([]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <p className="disclaimer">
                This app provides wellness guidance, not medical advice. Consult a
                healthcare professional for medical concerns.
            </p>

            <textarea
                placeholder="Enter your wellness goal...."
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
            />

            <button disabled={isLoading} onClick={handleGetRecommendations}>
                {isLoading ? "Loading..." : "Get Recommendations"}
            </button>

            {error && <p>{error}</p>}
        </div>
    );
}

export default GoalInput;