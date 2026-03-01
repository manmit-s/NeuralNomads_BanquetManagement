import axios from "axios";

const HF_TOKEN = process.env.HF_TOKEN;

export class HFService {
    static async analyzeSentiment(text: string) {
        if (!HF_TOKEN) {
            console.error("HF_TOKEN is missing in environment variables");
            return null;
        }

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
        } catch (error: any) {
            console.error("HF Error:", error.response?.data || error.message);
            return null;
        }
    }
}
