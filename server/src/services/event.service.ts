import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export class EventService {
    static async create(data: { bookingId: string; eventDate: string; guestCount: number; branchId: string; notes?: string }) {
        return prisma.event.create({
            data: {
                bookingId: data.bookingId,
                eventDate: new Date(data.eventDate),
                guestCount: data.guestCount,
                branchId: data.branchId,
                notes: data.notes,
            },
            include: { booking: { include: { hall: true, lead: true } } },
        });
    }

    static async findById(id: string, branchScope?: string) {
        const where: any = { id };
        if (branchScope) where.branchId = branchScope;

        const event = await prisma.event.findFirst({
            where,
            include: {
                booking: { include: { hall: true, lead: true } },
                menuSelections: { include: { menuItem: true } },
                vendorBookings: { include: { vendor: true } },
                checklist: { orderBy: { dueDate: "asc" } },
            },
        });
        if (!event) throw new NotFoundError("Event");
        return event;
    }

    static async findAll(branchScope: string | undefined) {
        const where: any = {};
        if (branchScope) where.branchId = branchScope;

        return prisma.event.findMany({
            where,
            include: {
                booking: { include: { hall: { select: { name: true } }, lead: { select: { customerName: true } } } },
            },
            orderBy: { eventDate: "asc" },
        });
    }

    // ── Menu selection ──
    static async addMenuItems(eventId: string, items: { menuItemId: string; quantity: number }[]) {
        const records = items.map((item) => ({
            eventId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
        }));

        await prisma.eventMenuItem.createMany({ data: records, skipDuplicates: true });
        return this.findById(eventId);
    }

    // ── Vendor allocation ──
    static async addVendor(eventId: string, data: { vendorId: string; service: string; cost: number; notes?: string }) {
        await prisma.eventVendor.create({
            data: { eventId, ...data },
        });
        return this.findById(eventId);
    }

    // ── Checklist ──
    static async addChecklistItem(eventId: string, data: { task: string; dueDate?: string }) {
        await prisma.eventChecklist.create({
            data: {
                eventId,
                task: data.task,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
        });
        return this.findById(eventId);
    }

    static async updateChecklistItem(checklistId: string, status: "PENDING" | "IN_PROGRESS" | "DONE") {
        return prisma.eventChecklist.update({
            where: { id: checklistId },
            data: {
                status,
                completedAt: status === "DONE" ? new Date() : null,
            },
        });
    }
}
