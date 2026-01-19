const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

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

async function getRecommendations(userGoal, yogasanaIds) {
    try {
        if (!API_KEY) {
            console.warn("Missing REACT_APP_GEMINI_API_KEY; returning empty recommendations.");
            return [];
        }

        const prompt = `Based on the user's goal: "${userGoal}", recommend 5–6 suitable yogasanas ONLY from the following list of IDs: ${yogasanaIds.join(
            ", "
        )}.\n\nReturn ONLY the IDs of the recommended yogasanas as a comma-separated list (no explanations).`;

        let text = "";
        try {
            // Primary: Gemini 2.5 Flash
            text = await callGeminiGenerateContent("gemini-2.5-flash", prompt);
        } catch (err) {
            // Fallback: older model (keeps the app working if 2.5 isn't enabled on the key)
            console.warn("Gemini 2.5 Flash failed, falling back to gemini-pro:", err);
            text = await callGeminiGenerateContent("gemini-pro", prompt);
        }

        const recommendations = extractAllowedItems(text, yogasanaIds);
        return recommendations;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export { getRecommendations };