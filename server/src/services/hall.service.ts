import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export class HallService {
    static async findByBranch(branchId: string) {
        return prisma.hall.findMany({
            where: { branchId, isActive: true },
            orderBy: { name: "asc" },
        });
    }

    static async create(data: {
        name: string;
        capacity: number;
        pricePerEvent: number;
        amenities?: string[];
        branchId: string;
    }) {
        return prisma.hall.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                pricePerEvent: data.pricePerEvent,
                amenities: data.amenities || [],
                branchId: data.branchId,
            },
        });
    }

    static async update(id: string, data: Partial<{
        name: string;
        capacity: number;
        pricePerEvent: number;
        amenities: string[];
    }>) {
        const hall = await prisma.hall.findUnique({ where: { id } });
        if (!hall) throw new NotFoundError("Hall");
        return prisma.hall.update({ where: { id }, data });
    }

    static async deactivate(id: string) {
        return prisma.hall.update({ where: { id }, data: { isActive: false } });
    }
}
