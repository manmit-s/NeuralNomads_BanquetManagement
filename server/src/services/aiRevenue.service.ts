import axios from "axios";

export const callAIRevenue = async (payload: any) => {
  try {
    console.log("Calling Python microservice...");
    console.log("Payload:", payload);

    const response = await axios.post(
      "http://localhost:8000/ai-revenue",
      payload,
      { timeout: 10000 }
    );

    console.log("Python response received:", response.data);

    return response.data;

  } catch (error: any) {
    console.error("ERROR CALLING PYTHON:", error.message);

    if (error.response) {
      console.error("Python returned error:", error.response.data);
    }

    throw error;
  }
};