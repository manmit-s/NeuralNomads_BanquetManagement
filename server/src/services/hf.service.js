import axios from "axios";

const HF_TOKEN = process.env.HF_TOKEN;

export async function analyzeSentiment(text) {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("HF Error:", error.response?.data || error.message);
    return null;
  }
}