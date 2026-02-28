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
}
