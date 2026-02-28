import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        take: 5,
        select: { id: true, email: true, name: true, role: true, branchId: true },
    });
    console.log("USERS:", JSON.stringify(users, null, 2));

    const halls = await prisma.hall.findMany({
        take: 5,
        select: { id: true, name: true, branchId: true, capacity: true },
    });
    console.log("HALLS:", JSON.stringify(halls, null, 2));

    const branches = await prisma.branch.findMany({
        take: 5,
        select: { id: true, name: true },
    });
    console.log("BRANCHES:", JSON.stringify(branches, null, 2));

    await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
