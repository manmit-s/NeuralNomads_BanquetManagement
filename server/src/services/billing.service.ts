import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { generateRefNumber } from "../utils/helpers.js";

export class BillingService {
    // ── Invoices ───────────────────────────────────────────

    static async createInvoice(data: {
        bookingId: string;
        branchId: string;
        subtotal: number;
        taxRate: number;
        dueDate: string;
        notes?: string;
    }) {
        const taxAmount = (data.subtotal * data.taxRate) / 100;
        const totalAmount = data.subtotal + taxAmount;

        const count = await prisma.invoice.count({ where: { branchId: data.branchId } });
        const invoiceNumber = generateRefNumber("INV", count + 1);

        return prisma.invoice.create({
            data: {
                invoiceNumber,
                bookingId: data.bookingId,
                branchId: data.branchId,
                subtotal: data.subtotal,
                taxRate: data.taxRate,
                taxAmount,
                totalAmount,
                dueDate: new Date(data.dueDate),
                notes: data.notes,
            },
            include: { booking: { include: { lead: true, hall: true } } },
        });
    }

    static async findInvoice(id: string, branchScope?: string) {
        const where: any = { id };
        if (branchScope) where.branchId = branchScope;

        const invoice = await prisma.invoice.findFirst({
            where,
            include: {
                booking: { include: { lead: true, hall: true } },
                payments: { orderBy: { paidAt: "desc" } },
                branch: { select: { name: true } },
            },
        });
        if (!invoice) throw new NotFoundError("Invoice");
        return invoice;
    }

    static async findAllInvoices(branchScope?: string, status?: string) {
        const where: any = {};
        if (branchScope) where.branchId = branchScope;
        if (status) where.status = status;

        return prisma.invoice.findMany({
            where,
            include: {
                booking: { include: { lead: { select: { customerName: true } } } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    // ── Payments ───────────────────────────────────────────

    static async recordPayment(data: {
        invoiceId: string;
        amount: number;
        method: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
        type: "ADVANCE" | "PARTIAL" | "FULL" | "REFUND";
        referenceNo?: string;
        notes?: string;
    }, userId: string) {
        return prisma.$transaction(async (tx: any) => {
            const invoice = await tx.invoice.findUnique({
                where: { id: data.invoiceId },
            });
            if (!invoice) throw new NotFoundError("Invoice");

            // Create payment record
            const payment = await tx.payment.create({
                data: {
                    invoiceId: data.invoiceId,
                    amount: data.amount,
                    method: data.method,
                    type: data.type,
                    referenceNo: data.referenceNo,
                    notes: data.notes,
                    receivedById: userId,
                },
            });

            // Update invoice totals
            const newPaidAmount = data.type === "REFUND"
                ? invoice.paidAmount - data.amount
                : invoice.paidAmount + data.amount;

            const newStatus = newPaidAmount >= invoice.totalAmount
                ? "PAID"
                : newPaidAmount > 0
                    ? "PARTIALLY_PAID"
                    : invoice.status;

            await tx.invoice.update({
                where: { id: data.invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus,
                },
            });

            // Also update booking balance
            if (invoice.bookingId) {
                const booking = await tx.booking.findUnique({ where: { id: invoice.bookingId } });
                if (booking) {
                    const newBalance = booking.totalAmount - newPaidAmount;
                    await tx.booking.update({
                        where: { id: invoice.bookingId },
                        data: {
                            advanceAmount: newPaidAmount,
                            balanceAmount: Math.max(0, newBalance),
                        },
                    });
                }
            }

            return payment;
        });
    }

    // ── Outstanding reminders ──
    static async getOutstanding(branchScope?: string) {
        const where: any = {
            status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
        };
        if (branchScope) where.branchId = branchScope;

        return prisma.invoice.findMany({
            where,
            include: {
                booking: { include: { lead: { select: { customerName: true, customerPhone: true } } } },
            },
            orderBy: { dueDate: "asc" },
        });
    }
}
