const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

function extractAllowedItems(text, allowedItems) {
    if (!text || !Array.isArray(allowedItems) || allowedItems.length === 0) {
        return [];
    }

    const allowedSet = new Set(allowedItems);
    const cleaned = String(text)
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/[\r\n]+/g, "\n")
        .replace(/^[\s\-*\d.)]+/gm, "");

    const parts = cleaned
        .split(/[,;\n]+/)
        .map((p) => p.trim())
        .filter(Boolean);

    const picked = [];
    for (const part of parts) {
        const candidate = part.replace(/^[-*\s]+/, "").trim();
        if (allowedSet.has(candidate) && !picked.includes(candidate)) {
            picked.push(candidate);
        }
    }

    return picked;
}

async function callGeminiGenerateContent(model, prompt) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    if (!response.ok) {
        const message = data?.error?.message || `Gemini API error (${response.status})`;
        throw new Error(message);
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Try to get recommendations from backend first (more secure)
 * Falls back to direct Gemini API if backend endpoint unavailable
 */
async function getRecommendationsFromBackend(userGoal, yogasanaIds) {
    try {
        const response = await fetch(`${BACKEND_URL}/recommendations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                goal: userGoal,
                yogasana_ids: yogasanaIds
            })
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return data?.recommendations || [];
    } catch (err) {
        console.warn("Backend recommendation endpoint unavailable:", err.message);
        return null; // Signal to try Gemini API directly
    }
}

async function getRecommendations(userGoal, yogasanaIds) {
    // Try backend first (secure method)
    const backendRecommendations = await getRecommendationsFromBackend(userGoal, yogasanaIds);
    if (backendRecommendations) {
        return backendRecommendations;
    }

    // Fallback: Try direct Gemini API
    if (!API_KEY || API_KEY === "your-api-key-here") {
        console.warn("⚠️  No Gemini API key configured");
        // Return empty array or a default recommendation
        console.log(
            "ℹ️  To enable AI recommendations:\n" +
            "1. Get a free API key from https://aistudio.google.com/app/apikey\n" +
            "2. Add it to src/.env: REACT_APP_GEMINI_API_KEY=your-key-here\n" +
            "3. Restart the development server (npm start)"
        );
        return yogasanaIds.slice(0, 3); // Return first 3 as fallback
    }

    const prompt = `Based on the user's goal: "${userGoal}", recommend 5–6 suitable yogasanas ONLY from the following list of IDs: ${yogasanaIds.join(
        ", "
    )}.\n\nReturn ONLY the IDs of the recommended yogasanas as a comma-separated list (no explanations).`;

    let text = "";
    try {
        // Primary: Gemini 2.5 Flash
        text = await callGeminiGenerateContent("gemini-2.5-flash", prompt);
    } catch (err) {
        // Fallback: try gemini-1.5-pro
        console.warn("Gemini 2.5 Flash failed, falling back to gemini-1.5-pro:", err);
        try {
            text = await callGeminiGenerateContent("gemini-1.5-pro", prompt);
        } catch (err2) {
            // Last resort: try older gemini-pro
            console.warn("Gemini 1.5 Pro failed, falling back to gemini-pro:", err2);
            text = await callGeminiGenerateContent("gemini-pro", prompt);
        }
    }

    const recommendations = extractAllowedItems(text, yogasanaIds);
    return recommendations;
}

export { getRecommendations };