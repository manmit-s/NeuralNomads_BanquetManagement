import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import type { ResourceCategory } from "../../prisma/generated-client";

interface CalculatedResource {
    resourceId: string;
    resourceName: string;
    category: ResourceCategory;
    unit: string;
    calculatedQty: number;
}

export class ResourceService {
    /**
     * Deterministic resource calculation engine.
     *
     * 1. Fetch booking → verify CONFIRMED
     * 2. Fetch event's menu items (if any)
     * 3. For each menu item, look up MenuItemResource entries and sum
     *    quantityPerGuest × guestCount
     * 4. Apply global structural rules:
     *    - Waiters   = ceil(guestCount / 20)
     *    - Chairs    = guestCount
     *    - Tables    = ceil(guestCount / 8)
     * 5. Merge menu-based and structural resources
     * 6. Upsert into BookingResource (skip manually-edited rows unless force=true)
     * 7. Return final aggregated list
     */
    static async calculateAndSave(bookingId: string, branchScope?: string, force = false) {
        // ── 1. Fetch booking ──
        const where: any = { id: bookingId };
        if (branchScope) where.branchId = branchScope;

        const booking = await prisma.booking.findFirst({
            where,
            include: {
                event: {
                    include: {
                        menuItems: {
                            include: {
                                menuItem: {
                                    include: {
                                        menuItemResources: {
                                            include: { resource: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!booking) throw new NotFoundError("Booking");

        const guestCount = booking.guestCount;

        // ── 2. Calculate menu-based resources ──
        const resourceMap = new Map<string, CalculatedResource>();

        if (booking.event?.menuItems) {
            for (const selection of booking.event.menuItems) {
                if (!selection.menuItem.menuItemResources) continue;
                for (const mir of selection.menuItem.menuItemResources) {
                    const existing = resourceMap.get(mir.resourceId);
                    const qty = mir.quantityPerGuest * guestCount;
                    if (existing) {
                        existing.calculatedQty += qty;
                    } else {
                        resourceMap.set(mir.resourceId, {
                            resourceId: mir.resourceId,
                            resourceName: mir.resource.name,
                            category: mir.resource.category,
                            unit: mir.resource.unit,
                            calculatedQty: qty,
                        });
                    }
                }
            }
        }

        // ── 3. Apply global structural rules ──
        const structuralRules: { name: string; category: ResourceCategory; unit: string; calc: (g: number) => number }[] = [
            { name: "Waiters", category: "STAFF", unit: "persons", calc: (g) => Math.ceil(g / 20) },
            { name: "Chairs", category: "FURNITURE", unit: "pieces", calc: (g) => g },
            { name: "Tables", category: "FURNITURE", unit: "pieces", calc: (g) => Math.ceil(g / 8) },
        ];

        for (const rule of structuralRules) {
            // Ensure the resource row exists (upsert)
            const resource = await prisma.resource.upsert({
                where: { name_category: { name: rule.name, category: rule.category } },
                update: {},
                create: { name: rule.name, category: rule.category, unit: rule.unit },
            });

            const existing = resourceMap.get(resource.id);
            const qty = rule.calc(guestCount);
            if (existing) {
                existing.calculatedQty += qty;
            } else {
                resourceMap.set(resource.id, {
                    resourceId: resource.id,
                    resourceName: rule.name,
                    category: rule.category,
                    unit: rule.unit,
                    calculatedQty: qty,
                });
            }
        }

        // ── 4. Upsert BookingResource rows ──
        for (const res of resourceMap.values()) {
            const existingRow = await prisma.bookingResource.findUnique({
                where: { bookingId_resourceId: { bookingId, resourceId: res.resourceId } },
            });

            // Skip manually-edited rows unless force recalculation
            if (existingRow?.isManuallyEdited && !force) continue;

            await prisma.bookingResource.upsert({
                where: { bookingId_resourceId: { bookingId, resourceId: res.resourceId } },
                update: {
                    calculatedQty: res.calculatedQty,
                    category: res.category,
                    ...(force ? { isManuallyEdited: false, manualQty: null } : {}),
                },
                create: {
                    bookingId,
                    resourceId: res.resourceId,
                    calculatedQty: res.calculatedQty,
                    category: res.category,
                },
            });
        }

        return this.getForBooking(bookingId);
    }

    /**
     * Fetch existing BookingResource rows for a booking.
     */
    static async getForBooking(bookingId: string) {
        const rows = await prisma.bookingResource.findMany({
            where: { bookingId },
            include: { resource: true },
            orderBy: [{ category: "asc" }, { resource: { name: "asc" } }],
        });

        return rows.map((r) => ({
            id: r.id,
            resourceId: r.resourceId,
            resourceName: r.resource.name,
            category: r.category,
            unit: r.resource.unit,
            calculatedQty: r.calculatedQty,
            manualQty: r.manualQty,
            isManuallyEdited: r.isManuallyEdited,
            effectiveQty: r.isManuallyEdited && r.manualQty !== null ? r.manualQty : r.calculatedQty,
        }));
    }

    /**
     * Get or auto-generate resources for a booking.
     */
    static async getOrGenerate(bookingId: string, branchScope?: string, force = false) {
        if (force) {
            return this.calculateAndSave(bookingId, branchScope, true);
        }

        const existing = await prisma.bookingResource.findMany({ where: { bookingId } });
        if (existing.length > 0) {
            return this.getForBooking(bookingId);
        }

        // First time — auto-generate
        return this.calculateAndSave(bookingId, branchScope, false);
    }

    /**
     * Bulk update resource quantities (manual edits).
     */
    static async updateResources(
        bookingId: string,
        updates: { resourceId: string; manualQty: number }[],
        branchScope?: string
    ) {
        // Verify booking exists
        const where: any = { id: bookingId };
        if (branchScope) where.branchId = branchScope;
        const booking = await prisma.booking.findFirst({ where });
        if (!booking) throw new NotFoundError("Booking");

        for (const u of updates) {
            await prisma.bookingResource.upsert({
                where: { bookingId_resourceId: { bookingId, resourceId: u.resourceId } },
                update: {
                    manualQty: u.manualQty,
                    isManuallyEdited: true,
                },
                create: {
                    bookingId,
                    resourceId: u.resourceId,
                    calculatedQty: u.manualQty,
                    manualQty: u.manualQty,
                    isManuallyEdited: true,
                    category: "OTHER",
                },
            });
        }

        return this.getForBooking(bookingId);
    }
}
