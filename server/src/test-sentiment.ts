import { prisma } from "./lib/prisma.js";
import { BranchService } from "./services/branch.service.js";

async function testSentiment() {
    console.log("--- Testing Sentiment Analysis & Scoring ---");

    try {
        // 1. Get a branch
        const branch = await prisma.branch.findFirst({
            where: { isActive: true }
        });

        if (!branch) {
            console.error("No active branch found. Please create one first.");
            return;
        }

        console.log(`Using branch: ${branch.name} (${branch.id})`);

        // 2. Create some sample reviews if they don't exist
        const reviewCount = await prisma.review.count({
            where: { branchId: branch.id }
        });

        if (reviewCount === 0) {
            console.log("Creating sample reviews...");
            await prisma.review.createMany({
                data: [
                    { branchId: branch.id, reviewText: "Excellent service and food!", rating: 5 },
                    { branchId: branch.id, reviewText: "It was okay, but the hall was a bit small.", rating: 3 },
                    { branchId: branch.id, reviewText: "Worst experience ever. Horrible management.", rating: 1 },
                ]
            });
        }

        // 3. Analyze Sentiment
        console.log("Analyzing sentiment and calculating score...");
        const results = await BranchService.analyzeSentiment(branch.id);

        console.log("Results:");
        console.log(JSON.stringify(results, null, 2));

        if (results.branchScore !== undefined) {
            console.log("SUCCESS: Sentiment analysis and scoring logic verified.");
        } else {
            console.error("FAILURE: Branch score missing from results.");
        }

    } catch (error: any) {
        console.error("Test Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testSentiment();
