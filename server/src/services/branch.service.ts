import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export class BranchService {
    static async findAll() {
        return prisma.branch.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });
    }

    static async findById(id: string) {
        const branch = await prisma.branch.findUnique({
            where: { id },
            include: {
                halls: { where: { isActive: true } },
                _count: { select: { users: true, bookings: true } },
            },
        });
        if (!branch) throw new NotFoundError("Branch");
        return branch;
    }

    static async create(data: { name: string; address: string; city: string; phone: string; email: string }) {
        return prisma.branch.create({ data });
    }

    static async update(id: string, data: Partial<{ name: string; address: string; city: string; phone: string; email: string }>) {
        return prisma.branch.update({ where: { id }, data });
    }

    static async deactivate(id: string) {
        return prisma.branch.update({ where: { id }, data: { isActive: false } });
    }

    static async analyzeSentiment(branchId: string) {
        const { HFService } = await import("./hf.service.js");

        const reviews = await prisma.review.findMany({
            where: { branchId },
            take: 50,
            orderBy: { createdAt: "desc" },
        });

        if (reviews.length === 0) {
            return { score: 0, reviews: [], count: 0 };
        }

        let totalScore = 0;
        let positiveCount = 0;
        let neutralCount = 0;
        let negativeCount = 0;
        const results = [];

        for (const review of reviews) {
            const sentiment = await HFService.analyzeSentiment(review.reviewText.slice(0, 500));

            if (sentiment && sentiment[0]) {
                const label = sentiment[0][0]?.label;
                const score = sentiment[0][0]?.score;

                if (label === "POSITIVE") {
                    totalScore += 2;
                    positiveCount++;
                } else if (label === "NEUTRAL") {
                    totalScore += 1;
                    neutralCount++;
                } else {
                    negativeCount++;
                }

                results.push({
                    reviewId: review.id,
                    text: review.reviewText,
                    label,
                    score,
                });
            } else {
                results.push({
                    reviewId: review.id,
                    text: review.reviewText,
                    sentiment: null,
                });
            }
        }

        const count = reviews.length;
        const branchScore = (totalScore / (count * 2)) * 10;
        const finalScore = Number(branchScore.toFixed(2));

        const stats = {
            positive: Math.round((positiveCount / count) * 100),
            neutral: Math.round((neutralCount / count) * 100),
            negative: Math.round((negativeCount / count) * 100),
        };

        // Store the result
        await prisma.branchSentiment.create({
            data: {
                branchId,
                sentimentScore: finalScore,
            }
        });

        return {
            branchId,
            branchScore: finalScore,
            reviewsCount: count,
            stats,
            analysis: results,
        };
    }

    static async getLatestSentiment(branchId: string) {
        const latest = await prisma.branchSentiment.findFirst({
            where: { branchId },
            orderBy: { analyzedAt: "desc" },
        });

        if (!latest) return null;

        return {
            ...latest,
            stats: { positive: 0, neutral: 0, negative: 0 } // Default for historical
        };
    }
}
