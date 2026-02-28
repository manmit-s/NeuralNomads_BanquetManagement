import app from "./app.js";
import { config } from "./config/index.js";

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API base: http://localhost:${PORT}/api/v1`);
    console.log(`🌍 Environment: ${config.nodeEnv}\n`);
});
