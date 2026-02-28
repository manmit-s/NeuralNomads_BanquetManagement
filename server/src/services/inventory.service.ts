import { prisma } from "../lib/prisma.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import { Prisma } from "@prisma/client";

export class InventoryService {
    // ── CRUD ─────────────────────────────────────────────

    static async findAll(branchScope: string | undefined) {
        const where: any = { isActive: true };
        if (branchScope) where.branchId = branchScope;

        return prisma.inventoryItem.findMany({
            where,
            orderBy: { name: "asc" },
        });
    }

    static async findById(id: string) {
        const item = await prisma.inventoryItem.findUnique({
            where: { id },
            include: {
                stockMovements: { orderBy: { createdAt: "desc" }, take: 20 },
            },
        });
        if (!item) throw new NotFoundError("Inventory item");
        return item;
    }

    static async create(data: any) {
        return prisma.inventoryItem.create({ data });
    }

    static async update(id: string, data: any) {
        return prisma.inventoryItem.update({ where: { id }, data });
    }

    // ── Manual stock adjustment (purchase, return, correction) ──

    static async adjustStock(itemId: string, type: "PURCHASE" | "ADJUSTMENT" | "RETURN", quantity: number, notes?: string) {
        return prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
            if (!item) throw new NotFoundError("Inventory item");

            const newStock = type === "ADJUSTMENT"
                ? quantity // absolute set
                : item.currentStock + quantity;

            await tx.inventoryItem.update({
                where: { id: itemId },
                data: { currentStock: newStock },
            });

            await tx.stockMovement.create({
                data: {
                    inventoryItemId: itemId,
                    type,
                    quantity,
                    notes,
                },
            });

            return tx.inventoryItem.findUnique({ where: { id: itemId } });
        });
    }

    // ── Low-stock alerts ──

    static async getLowStockItems(branchScope?: string) {
        const where: any = { isActive: true };
        if (branchScope) where.branchId = branchScope;

        return prisma.$queryRaw`
      SELECT id, name, category, unit, "currentStock", "minStockLevel", "branchId"
      FROM inventory_items
      WHERE "isActive" = true
        AND "currentStock" <= "minStockLevel"
        ${branchScope ? Prisma.sql`AND "branchId" = ${branchScope}` : Prisma.empty}
      ORDER BY ("currentStock" - "minStockLevel") ASC
    `;
    }

    // ──────────────────────────────────────────────────────────
    // AUTO-DEDUCTION LOGIC (Transactional)
    // ──────────────────────────────────────────────────────────
    //
    // Called when a menu is finalised for an event.
    //
    // Steps inside a single Prisma transaction:
    // 1. For each menu item × guest count, compute required raw materials.
    // 2. Lock inventory rows with SELECT … FOR UPDATE.
    // 3. Verify sufficient stock for ALL items (fail-fast).
    // 4. Deduct stock and create StockMovement audit records.
    // 5. Return low-stock warnings (items that drop below threshold).
    //
    // If ANY ingredient is insufficient, the ENTIRE transaction rolls back.
    // ──────────────────────────────────────────────────────────

    static async deductForEvent(
        eventId: string,
        menuItems: { menuItemId: string; quantity: number }[], // quantity = servings
        guestCount: number
    ) {
        return prisma.$transaction(async (tx) => {
            // ── 1. Calculate required quantities ──
            const requirements: Map<string, { name: string; required: number; unit: string }> = new Map();

            for (const mi of menuItems) {
                const ingredients = await tx.menuItemIngredient.findMany({
                    where: { menuItemId: mi.menuItemId },
                    include: { inventoryItem: { select: { id: true, name: true, unit: true } } },
                });

                for (const ing of ingredients) {
                    const totalNeeded = ing.quantityPerServing * guestCount;
                    const existing = requirements.get(ing.inventoryItemId);

                    if (existing) {
                        existing.required += totalNeeded;
                    } else {
                        requirements.set(ing.inventoryItemId, {
                            name: ing.inventoryItem.name,
                            required: totalNeeded,
                            unit: ing.inventoryItem.unit,
                        });
                    }
                }
            }

            if (requirements.size === 0) return { deducted: [], warnings: [] };

            // ── 2. Lock inventory rows ──
            const itemIds = Array.from(requirements.keys());
            const lockedItems = await tx.$queryRaw<
                { id: string; name: string; currentStock: number; minStockLevel: number }[]
            >`
        SELECT id, name, "currentStock", "minStockLevel"
        FROM inventory_items
        WHERE id = ANY(${itemIds}::text[])
        FOR UPDATE
      `;

            // ── 3. Verify stock sufficiency ──
            const insufficientItems: string[] = [];
            for (const item of lockedItems) {
                const req = requirements.get(item.id);
                if (req && item.currentStock < req.required) {
                    insufficientItems.push(
                        `${item.name}: need ${req.required} ${req.unit}, have ${item.currentStock} ${req.unit}`
                    );
                }
            }

            if (insufficientItems.length > 0) {
                throw new AppError(
                    `Insufficient stock: ${insufficientItems.join("; ")}`,
                    400
                );
            }

            // ── 4. Deduct & create audit records ──
            const deducted: { name: string; deducted: number; remaining: number; unit: string }[] = [];
            const warnings: { name: string; currentStock: number; minStockLevel: number }[] = [];

            for (const item of lockedItems) {
                const req = requirements.get(item.id)!;

                const newStock = item.currentStock - req.required;

                await tx.inventoryItem.update({
                    where: { id: item.id },
                    data: { currentStock: newStock },
                });

                await tx.stockMovement.create({
                    data: {
                        inventoryItemId: item.id,
                        type: "DEDUCTION",
                        quantity: req.required,
                        eventId,
                        notes: `Auto-deducted for event ${eventId} (${guestCount} guests)`,
                    },
                });

                deducted.push({
                    name: item.name,
                    deducted: req.required,
                    remaining: newStock,
                    unit: req.unit,
                });

                if (newStock <= item.minStockLevel) {
                    warnings.push({
                        name: item.name,
                        currentStock: newStock,
                        minStockLevel: item.minStockLevel,
                    });
                }
            }

            return { deducted, warnings };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 15000,
        });
    }
}
