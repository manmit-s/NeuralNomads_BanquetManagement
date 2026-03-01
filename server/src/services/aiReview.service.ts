import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export const callAIReviews = async (payload: any) => {
    console.log("[ReviewService] Forwarding to Python:", JSON.stringify(payload));

    const response = await axios.post(
        `${AI_SERVICE_URL}/ai-reviews`,
        payload,
        { timeout: 60000 }
    );

    console.log("[ReviewService] Response received:", response.status);
    return response.data;
};

export const callDemoReviews = async () => {
    console.log("[ReviewService] Calling demo endpoint...");

    const response = await axios.get(
        `${AI_SERVICE_URL}/ai-reviews/demo`,
        { timeout: 90000 }
    );

    console.log("[ReviewService] Demo response received:", response.status);
    return response.data;
};
