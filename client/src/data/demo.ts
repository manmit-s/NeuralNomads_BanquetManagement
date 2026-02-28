/**
 * ═══════════════════════════════════════════════════════════════
 *  EVENTORA — Centralized Demo Data
 * ─────────────────────────────────────────────────────────────
 *  Every page imports from THIS file.
 *  Change a name, amount, or date here and it reflects everywhere.
 * ═══════════════════════════════════════════════════════════════
 */

import type {
    Branch,
    Hall,
    Lead,
    Booking,
    DashboardSummary,
    LeadStatus,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────
const id = (n: number) => `demo-${String(n).padStart(3, "0")}`;
const today = new Date();
const d = (month: number, day: number) =>
    new Date(2026, month - 1, day).toISOString();

// ─── BRANCHES ─────────────────────────────────────────────────
export interface DemoBranch extends Branch {
    state?: string;
    staffCount?: number;
    hallCount?: number;
}

export const DEMO_BRANCHES: DemoBranch[] = [
    {
        id: id(1),
        name: "Grand Palace",
        address: "Plot 12, Juhu Tara Road, Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        phone: "+91-22-4048-9000",
        email: "mumbai@eventora.in",
        isActive: true,
        staffCount: 24,
        hallCount: 3,
    },
    {
        id: id(2),
        name: "Royal Gardens",
        address: "Survey 45, Koregaon Park",
        city: "Pune",
        state: "Maharashtra",
        phone: "+91-20-6728-3100",
        email: "pune@eventora.in",
        isActive: true,
        staffCount: 16,
        hallCount: 2,
    },
    {
        id: id(3),
        name: "Crystal Heights",
        address: "C-14, Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        phone: "+91-11-4356-7200",
        email: "delhi@eventora.in",
        isActive: true,
        staffCount: 20,
        hallCount: 3,
    },
    {
        id: id(4),
        name: "Lake View",
        address: "Near Fateh Sagar Lake, Panchwati",
        city: "Udaipur",
        state: "Rajasthan",
        phone: "+91-294-245-8800",
        email: "udaipur@eventora.in",
        isActive: true,
        staffCount: 10,
        hallCount: 2,
    },
];

// ─── HALLS ────────────────────────────────────────────────────
export const DEMO_HALLS: Hall[] = [
    { id: id(11), name: "Crystal Ballroom", capacity: 350, pricePerEvent: 250000, amenities: ["AC", "Stage", "Sound System", "Valet Parking"], branchId: id(1) },
    { id: id(12), name: "Diamond Hall", capacity: 200, pricePerEvent: 150000, amenities: ["AC", "Projector", "Wi-Fi"], branchId: id(1) },
    { id: id(13), name: "Emerald Room", capacity: 100, pricePerEvent: 80000, amenities: ["AC", "Sound System"], branchId: id(1) },
    { id: id(14), name: "Garden Pavilion", capacity: 250, pricePerEvent: 180000, amenities: ["Open-air", "Stage", "Lighting"], branchId: id(2) },
    { id: id(15), name: "Rose Court", capacity: 150, pricePerEvent: 120000, amenities: ["AC", "Garden View"], branchId: id(2) },
    { id: id(16), name: "Platinum Hall", capacity: 400, pricePerEvent: 300000, amenities: ["AC", "Stage", "LED Wall", "Valet Parking"], branchId: id(3) },
    { id: id(17), name: "Ruby Room", capacity: 120, pricePerEvent: 90000, amenities: ["AC", "Projector"], branchId: id(3) },
    { id: id(18), name: "Sapphire Suite", capacity: 80, pricePerEvent: 60000, amenities: ["AC", "Lounge"], branchId: id(3) },
    { id: id(19), name: "Lake Terrace", capacity: 200, pricePerEvent: 200000, amenities: ["Lake View", "Stage", "Lighting"], branchId: id(4) },
    { id: id(20), name: "Sunset Lounge", capacity: 80, pricePerEvent: 70000, amenities: ["Lake View", "Bar"], branchId: id(4) },
];

const hallById = (hid: string) => DEMO_HALLS.find((h) => h.id === hid)!;

// ─── LEADS ────────────────────────────────────────────────────
export const DEMO_LEADS: Lead[] = [
    // CALL — new inquiries
    { id: id(101), customerName: "Ananya Sharma", customerPhone: "+91-98765-43201", customerEmail: "ananya@gmail.com", eventType: "Wedding", eventDate: d(4, 12), guestCount: 300, status: "CALL" as LeadStatus, source: "Website", branchId: id(1), branch: { id: id(1), name: "Grand Palace" }, assignedTo: { id: "u1", name: "Priya Singh", email: "priya@eventora.in" }, createdAt: d(2, 20) },
    { id: id(102), customerName: "Rohit Kapoor", customerPhone: "+91-88765-21040", eventType: "Corporate", eventDate: d(3, 20), guestCount: 150, status: "CALL" as LeadStatus, source: "Referral", branchId: id(3), branch: { id: id(3), name: "Crystal Heights" }, assignedTo: { id: "u2", name: "Amit Verma", email: "amit@eventora.in" }, createdAt: d(2, 22) },
    { id: id(103), customerName: "Meera Patel", customerPhone: "+91-97654-31020", eventType: "Birthday", eventDate: d(3, 15), guestCount: 80, status: "CALL" as LeadStatus, source: "Instagram", branchId: id(2), branch: { id: id(2), name: "Royal Gardens" }, createdAt: d(2, 25) },
    { id: id(104), customerName: "Karan Malhotra", customerPhone: "+91-99887-65432", eventType: "Reception", eventDate: d(5, 5), guestCount: 250, status: "CALL" as LeadStatus, source: "Walk-in", branchId: id(1), branch: { id: id(1), name: "Grand Palace" }, createdAt: d(2, 27) },

    // VISIT — done site visit
    { id: id(105), customerName: "Deepika Reddy", customerPhone: "+91-90123-45670", customerEmail: "deepika.r@outlook.com", eventType: "Wedding", eventDate: d(4, 25), guestCount: 400, status: "VISIT" as LeadStatus, source: "WeddingBazaar", branchId: id(3), branch: { id: id(3), name: "Crystal Heights" }, assignedTo: { id: "u2", name: "Amit Verma", email: "amit@eventora.in" }, createdAt: d(2, 15) },
    { id: id(106), customerName: "Vikram Joshi", customerPhone: "+91-87654-32100", eventType: "Conference", eventDate: d(3, 28), guestCount: 200, status: "VISIT" as LeadStatus, source: "LinkedIn", branchId: id(3), branch: { id: id(3), name: "Crystal Heights" }, createdAt: d(2, 18) },
    { id: id(107), customerName: "Nisha Gupta", customerPhone: "+91-78901-23456", eventType: "Anniversary", eventDate: d(3, 10), guestCount: 120, status: "VISIT" as LeadStatus, source: "Referral", branchId: id(2), branch: { id: id(2), name: "Royal Gardens" }, assignedTo: { id: "u1", name: "Priya Singh", email: "priya@eventora.in" }, createdAt: d(2, 12) },

    // TASTING — food tasting scheduled
    { id: id(108), customerName: "Arjun Mehta", customerPhone: "+91-91234-56789", customerEmail: "arjun.mehta@yahoo.com", eventType: "Wedding", eventDate: d(3, 22), guestCount: 350, status: "TASTING" as LeadStatus, source: "Website", branchId: id(1), branch: { id: id(1), name: "Grand Palace" }, assignedTo: { id: "u1", name: "Priya Singh", email: "priya@eventora.in" }, createdAt: d(2, 5) },
    { id: id(109), customerName: "Pooja Iyer", customerPhone: "+91-82345-67890", eventType: "Reception", eventDate: d(4, 8), guestCount: 180, status: "TASTING" as LeadStatus, source: "Facebook", branchId: id(4), branch: { id: id(4), name: "Lake View" }, createdAt: d(2, 8) },

    // ADVANCE — converted, paid advance
    { id: id(110), customerName: "Siddharth Agarwal", customerPhone: "+91-99001-12233", customerEmail: "sid.agarwal@gmail.com", eventType: "Wedding", eventDate: d(3, 8), guestCount: 280, status: "ADVANCE" as LeadStatus, source: "Referral", branchId: id(1), branch: { id: id(1), name: "Grand Palace" }, assignedTo: { id: "u1", name: "Priya Singh", email: "priya@eventora.in" }, createdAt: d(1, 20) },
    { id: id(111), customerName: "Radhika Nair", customerPhone: "+91-87001-44556", customerEmail: "radhika.nair@hotmail.com", eventType: "Corporate", eventDate: d(3, 14), guestCount: 100, status: "ADVANCE" as LeadStatus, source: "Website", branchId: id(3), branch: { id: id(3), name: "Crystal Heights" }, assignedTo: { id: "u2", name: "Amit Verma", email: "amit@eventora.in" }, createdAt: d(1, 25) },
    { id: id(112), customerName: "Kavya Deshmukh", customerPhone: "+91-93456-78901", eventType: "Birthday", eventDate: d(3, 1), guestCount: 60, status: "ADVANCE" as LeadStatus, source: "Instagram", branchId: id(2), branch: { id: id(2), name: "Royal Gardens" }, createdAt: d(2, 1) },

    // LOST
    { id: id(113), customerName: "Rajesh Kumar", customerPhone: "+91-76543-21098", eventType: "Wedding", eventDate: d(5, 10), guestCount: 500, status: "LOST" as LeadStatus, notes: "Went with competitor — lower price", source: "WeddingBazaar", branchId: id(1), branch: { id: id(1), name: "Grand Palace" }, createdAt: d(1, 10) },
    { id: id(114), customerName: "Tanvi Shah", customerPhone: "+91-65432-10987", eventType: "Conference", eventDate: d(4, 1), guestCount: 300, status: "LOST" as LeadStatus, notes: "Budget constraints", source: "LinkedIn", branchId: id(3), branch: { id: id(3), name: "Crystal Heights" }, createdAt: d(1, 15) },
];

// ─── BOOKINGS ─────────────────────────────────────────────────
// Spread across Feb–Mar 2026 for a rich calendar
export const DEMO_BOOKINGS: (Booking & {
    menuItems?: any[];
    vendors?: any[];
    payments?: any[];
})[] = [
        {
            id: id(201),
            bookingNumber: "BK-2026-001",
            customerName: "Siddharth & Priya Agarwal",
            customerPhone: "+91-99001-12233",
            customerEmail: "sid.agarwal@gmail.com",
            eventType: "Wedding",
            eventDate: d(3, 8),
            startDate: d(3, 8),
            endDate: d(3, 8),
            startTime: "11:00 AM",
            endTime: "4:00 PM",
            guestCount: 280,
            status: "CONFIRMED",
            totalAmount: 850000,
            advanceAmount: 250000,
            paidAmount: 425000,
            balanceAmount: 425000,
            hallId: id(11),
            hall: hallById(id(11)),
            leadId: id(110),
            notes: "Maharashtrian-style wedding. Mandap decoration + live dhol.",
            createdAt: d(1, 22),
            menuItems: [
                { name: "Paneer Butter Masala", category: "Main Course (Veg)", price: 450 },
                { name: "Dal Makhani", category: "Main Course (Veg)", price: 350 },
                { name: "Chicken Biryani", category: "Main Course (Non-Veg)", price: 550 },
                { name: "Gulab Jamun", category: "Dessert", price: 200 },
                { name: "Masala Papad", category: "Starter", price: 150 },
                { name: "Fruit Punch", category: "Beverages", price: 120 },
            ],
            vendors: [
                { name: "Royal Decorators", category: "Decoration", phone: "+91-98111-22334", status: "CONFIRMED" },
                { name: "Shutter Stories", category: "Photography", phone: "+91-98222-33445", status: "CONFIRMED" },
                { name: "DJ Akash", category: "Entertainment", phone: "+91-99333-44556", status: "CONFIRMED" },
                { name: "Flower World", category: "Florist", phone: "+91-98444-55667", status: "TENTATIVE" },
            ],
            payments: [
                { amount: 250000, paymentMethod: "Bank Transfer", createdAt: d(1, 22), status: "COMPLETED" },
                { amount: 175000, paymentMethod: "UPI", createdAt: d(2, 15), status: "COMPLETED" },
            ],
        },
        {
            id: id(202),
            bookingNumber: "BK-2026-002",
            customerName: "Radhika Nair",
            customerPhone: "+91-87001-44556",
            customerEmail: "radhika.nair@hotmail.com",
            eventType: "Corporate",
            eventDate: d(3, 14),
            startDate: d(3, 14),
            endDate: d(3, 14),
            startTime: "9:00 AM",
            endTime: "6:00 PM",
            guestCount: 100,
            status: "CONFIRMED",
            totalAmount: 280000,
            advanceAmount: 100000,
            paidAmount: 280000,
            balanceAmount: 0,
            hallId: id(17),
            hall: hallById(id(17)),
            leadId: id(111),
            notes: "Annual town hall for Infosys Pune team. Need projector + mic setup.",
            createdAt: d(1, 28),
            menuItems: [
                { name: "Assorted Sandwiches", category: "Snacks", price: 180 },
                { name: "Coffee & Tea Station", category: "Beverages", price: 100 },
                { name: "Working Lunch Thali", category: "Main Course (Veg)", price: 400 },
            ],
            vendors: [
                { name: "AV Solutions", category: "AV Equipment", phone: "+91-98555-66778", status: "CONFIRMED" },
            ],
            payments: [
                { amount: 100000, paymentMethod: "Bank Transfer", createdAt: d(1, 28), status: "COMPLETED" },
                { amount: 180000, paymentMethod: "Bank Transfer", createdAt: d(2, 25), status: "COMPLETED" },
            ],
        },
        {
            id: id(203),
            bookingNumber: "BK-2026-003",
            customerName: "Kavya Deshmukh",
            customerPhone: "+91-93456-78901",
            eventType: "Birthday",
            eventDate: d(3, 1),
            startDate: d(3, 1),
            endDate: d(3, 1),
            startTime: "6:00 PM",
            endTime: "11:00 PM",
            guestCount: 60,
            status: "CONFIRMED",
            totalAmount: 150000,
            advanceAmount: 50000,
            paidAmount: 100000,
            balanceAmount: 50000,
            hallId: id(15),
            hall: hallById(id(15)),
            leadId: id(112),
            notes: "Surprise 30th birthday party. Balloon decoration + DJ.",
            createdAt: d(2, 3),
            menuItems: [
                { name: "Pasta Station", category: "Live Counter", price: 350 },
                { name: "Mini Burgers", category: "Starter", price: 250 },
                { name: "Chocolate Fountain", category: "Dessert", price: 500 },
            ],
            vendors: [
                { name: "Balloon Bliss", category: "Decoration", phone: "+91-97666-77889", status: "CONFIRMED" },
                { name: "DJ Neon", category: "Entertainment", phone: "+91-96777-88990", status: "CONFIRMED" },
            ],
            payments: [
                { amount: 50000, paymentMethod: "UPI", createdAt: d(2, 3), status: "COMPLETED" },
                { amount: 50000, paymentMethod: "Cash", createdAt: d(2, 20), status: "COMPLETED" },
            ],
        },
        {
            id: id(204),
            bookingNumber: "BK-2026-004",
            customerName: "Arjun & Sneha Mehta",
            customerPhone: "+91-91234-56789",
            customerEmail: "arjun.mehta@yahoo.com",
            eventType: "Wedding",
            eventDate: d(3, 22),
            startDate: d(3, 22),
            endDate: d(3, 22),
            startTime: "10:00 AM",
            endTime: "3:00 PM",
            guestCount: 350,
            status: "TENTATIVE",
            totalAmount: 1200000,
            advanceAmount: 300000,
            paidAmount: 300000,
            balanceAmount: 900000,
            hallId: id(11),
            hall: hallById(id(11)),
            leadId: id(108),
            notes: "Gujarati wedding — need special dietary arrangements. Waiting on final guest list.",
            createdAt: d(2, 8),
            menuItems: [
                { name: "Undhiyu", category: "Main Course (Veg)", price: 380 },
                { name: "Dhokla Platter", category: "Starter", price: 200 },
                { name: "Jalebi & Fafda", category: "Dessert", price: 250 },
                { name: "Buttermilk Station", category: "Beverages", price: 80 },
            ],
            vendors: [
                { name: "Mandap Kings", category: "Decoration", phone: "+91-98111-22334", status: "TENTATIVE" },
                { name: "Wedding Clicks", category: "Photography", phone: "+91-97222-33445", status: "CONFIRMED" },
            ],
            payments: [
                { amount: 300000, paymentMethod: "Cheque", createdAt: d(2, 10), status: "COMPLETED" },
            ],
        },
        {
            id: id(205),
            bookingNumber: "BK-2026-005",
            customerName: "TechVista Solutions",
            customerPhone: "+91-11-4567-8900",
            customerEmail: "events@techvista.com",
            eventType: "Conference",
            eventDate: d(3, 18),
            startDate: d(3, 18),
            endDate: d(3, 19),
            startTime: "8:00 AM",
            endTime: "7:00 PM",
            guestCount: 200,
            status: "CONFIRMED",
            totalAmount: 650000,
            advanceAmount: 200000,
            paidAmount: 650000,
            balanceAmount: 0,
            hallId: id(16),
            hall: hallById(id(16)),
            leadId: id(106),
            notes: "2-day tech conference. Need breakout rooms + main stage setup.",
            createdAt: d(2, 1),
            menuItems: [
                { name: "Continental Breakfast", category: "Breakfast", price: 350 },
                { name: "Hi-Tea Package", category: "Snacks", price: 250 },
                { name: "Buffet Lunch", category: "Main Course", price: 600 },
            ],
            vendors: [
                { name: "AV Solutions", category: "AV Equipment", phone: "+91-98555-66778", status: "CONFIRMED" },
                { name: "Print Express", category: "Printing", phone: "+91-96888-99001", status: "CONFIRMED" },
            ],
            payments: [
                { amount: 200000, paymentMethod: "Bank Transfer", createdAt: d(2, 1), status: "COMPLETED" },
                { amount: 450000, paymentMethod: "Bank Transfer", createdAt: d(3, 1), status: "COMPLETED" },
            ],
        },
        {
            id: id(206),
            bookingNumber: "BK-2026-006",
            customerName: "Nisha & Rahul Gupta",
            customerPhone: "+91-78901-23456",
            eventType: "Anniversary",
            eventDate: d(3, 10),
            startDate: d(3, 10),
            endDate: d(3, 10),
            startTime: "7:00 PM",
            endTime: "11:00 PM",
            guestCount: 120,
            status: "CONFIRMED",
            totalAmount: 320000,
            advanceAmount: 100000,
            paidAmount: 200000,
            balanceAmount: 120000,
            hallId: id(15),
            hall: hallById(id(15)),
            leadId: id(107),
            notes: "25th silver jubilee anniversary. Elegant floral theme.",
            createdAt: d(2, 14),
            menuItems: [
                { name: "Mushroom Galouti", category: "Starter", price: 320 },
                { name: "Rogan Josh", category: "Main Course (Non-Veg)", price: 480 },
                { name: "Tiramisu", category: "Dessert", price: 350 },
            ],
            vendors: [
                { name: "Flower World", category: "Florist", phone: "+91-98444-55667", status: "CONFIRMED" },
                { name: "Live Notes Band", category: "Entertainment", phone: "+91-95111-22334", status: "CONFIRMED" },
            ],
            payments: [
                { amount: 100000, paymentMethod: "UPI", createdAt: d(2, 14), status: "COMPLETED" },
                { amount: 100000, paymentMethod: "Card", createdAt: d(2, 28), status: "COMPLETED" },
            ],
        },
        {
            id: id(207),
            bookingNumber: "BK-2026-007",
            customerName: "Pooja & Aditya Iyer",
            customerPhone: "+91-82345-67890",
            eventType: "Reception",
            eventDate: d(3, 28),
            startDate: d(3, 28),
            endDate: d(3, 28),
            startTime: "6:00 PM",
            endTime: "11:30 PM",
            guestCount: 180,
            status: "TENTATIVE",
            totalAmount: 480000,
            advanceAmount: 150000,
            paidAmount: 150000,
            balanceAmount: 330000,
            hallId: id(19),
            hall: hallById(id(19)),
            leadId: id(109),
            notes: "Wedding reception with lake-side cocktail hour.",
            createdAt: d(2, 10),
            menuItems: [
                { name: "South Indian Platter", category: "Main Course (Veg)", price: 420 },
                { name: "Prawn Fry", category: "Starter (Non-Veg)", price: 380 },
                { name: "Filter Coffee Station", category: "Beverages", price: 100 },
            ],
            vendors: [
                { name: "Lakeside Lights", category: "Lighting", phone: "+91-94999-11223", status: "TENTATIVE" },
            ],
            payments: [
                { amount: 150000, paymentMethod: "Bank Transfer", createdAt: d(2, 10), status: "COMPLETED" },
            ],
        },
        {
            id: id(208),
            bookingNumber: "BK-2026-008",
            customerName: "Mehta Family",
            customerPhone: "+91-98765-43210",
            eventType: "Wedding",
            eventDate: d(2, 28),
            startDate: d(2, 28),
            endDate: d(2, 28),
            startTime: "10:00 AM",
            endTime: "2:00 PM",
            guestCount: 350,
            status: "CONFIRMED",
            totalAmount: 980000,
            advanceAmount: 300000,
            paidAmount: 750000,
            balanceAmount: 230000,
            hallId: id(11),
            hall: hallById(id(11)),
            leadId: id(110),
            notes: "Mehta wedding reception — premium setup with LED wall and valet.",
            createdAt: d(1, 5),
            payments: [
                { amount: 300000, paymentMethod: "Bank Transfer", createdAt: d(1, 5), status: "COMPLETED" },
                { amount: 250000, paymentMethod: "UPI", createdAt: d(2, 1), status: "COMPLETED" },
                { amount: 200000, paymentMethod: "Cash", createdAt: d(2, 20), status: "COMPLETED" },
            ],
        },
        {
            id: id(209),
            bookingNumber: "BK-2026-009",
            customerName: "Infosys Team Outing",
            customerPhone: "+91-20-6728-3100",
            customerEmail: "hr@infosys.com",
            eventType: "Corporate",
            eventDate: d(2, 28),
            startDate: d(2, 28),
            endDate: d(2, 28),
            startTime: "5:00 PM",
            endTime: "10:00 PM",
            guestCount: 200,
            status: "CONFIRMED",
            totalAmount: 420000,
            advanceAmount: 200000,
            paidAmount: 420000,
            balanceAmount: 0,
            hallId: id(16),
            hall: hallById(id(16)),
            leadId: id(111),
            notes: "Annual gala with awards ceremony.",
            createdAt: d(1, 15),
            payments: [
                { amount: 200000, paymentMethod: "Bank Transfer", createdAt: d(1, 15), status: "COMPLETED" },
                { amount: 220000, paymentMethod: "Bank Transfer", createdAt: d(2, 15), status: "COMPLETED" },
            ],
        },
        {
            id: id(210),
            bookingNumber: "BK-2026-010",
            customerName: "Sharma Anniversary",
            customerPhone: "+91-91111-22233",
            eventType: "Anniversary",
            eventDate: d(2, 28),
            startDate: d(2, 28),
            endDate: d(2, 28),
            startTime: "7:00 PM",
            endTime: "11:00 PM",
            guestCount: 120,
            status: "CONFIRMED",
            totalAmount: 280000,
            advanceAmount: 80000,
            paidAmount: 200000,
            balanceAmount: 80000,
            hallId: id(14),
            hall: hallById(id(14)),
            leadId: id(107),
            notes: "Golden jubilee celebration with garden setup.",
            createdAt: d(1, 20),
            payments: [
                { amount: 80000, paymentMethod: "UPI", createdAt: d(1, 20), status: "COMPLETED" },
                { amount: 120000, paymentMethod: "Cash", createdAt: d(2, 10), status: "COMPLETED" },
            ],
        },
        {
            id: id(211),
            bookingNumber: "BK-2026-011",
            customerName: "Deepika & Arun Reddy",
            customerPhone: "+91-90123-45670",
            customerEmail: "deepika.r@outlook.com",
            eventType: "Wedding",
            eventDate: d(3, 5),
            startDate: d(3, 5),
            endDate: d(3, 5),
            startTime: "9:00 AM",
            endTime: "2:00 PM",
            guestCount: 400,
            status: "TENTATIVE",
            totalAmount: 1500000,
            advanceAmount: 400000,
            paidAmount: 400000,
            balanceAmount: 1100000,
            hallId: id(16),
            hall: hallById(id(16)),
            leadId: id(105),
            notes: "Grand South Indian wedding. Need separate muhurtham mandap area.",
            createdAt: d(2, 18),
            payments: [
                { amount: 400000, paymentMethod: "Cheque", createdAt: d(2, 18), status: "COMPLETED" },
            ],
        },
        {
            id: id(212),
            bookingNumber: "BK-2026-012",
            customerName: "Verma Sangeet Night",
            customerPhone: "+91-88765-43210",
            eventType: "Reception",
            eventDate: d(3, 15),
            startDate: d(3, 15),
            endDate: d(3, 15),
            startTime: "7:00 PM",
            endTime: "12:00 AM",
            guestCount: 200,
            status: "CONFIRMED",
            totalAmount: 550000,
            advanceAmount: 200000,
            paidAmount: 350000,
            balanceAmount: 200000,
            hallId: id(11),
            hall: hallById(id(11)),
            leadId: id(108),
            notes: "Sangeet + cocktail night. Bollywood theme with choreography.",
            createdAt: d(2, 5),
            payments: [
                { amount: 200000, paymentMethod: "Bank Transfer", createdAt: d(2, 5), status: "COMPLETED" },
                { amount: 150000, paymentMethod: "UPI", createdAt: d(2, 25), status: "COMPLETED" },
            ],
        },
        // Completed booking
        {
            id: id(213),
            bookingNumber: "BK-2026-013",
            customerName: "Jain Housewarming",
            customerPhone: "+91-77654-32100",
            eventType: "Other",
            eventDate: d(2, 15),
            startDate: d(2, 15),
            endDate: d(2, 15),
            startTime: "11:00 AM",
            endTime: "3:00 PM",
            guestCount: 80,
            status: "COMPLETED",
            totalAmount: 120000,
            advanceAmount: 50000,
            paidAmount: 120000,
            balanceAmount: 0,
            hallId: id(13),
            hall: hallById(id(13)),
            leadId: id(112),
            createdAt: d(1, 10),
            payments: [
                { amount: 50000, paymentMethod: "UPI", createdAt: d(1, 10), status: "COMPLETED" },
                { amount: 70000, paymentMethod: "Cash", createdAt: d(2, 15), status: "COMPLETED" },
            ],
        },
        // Cancelled
        {
            id: id(214),
            bookingNumber: "BK-2026-014",
            customerName: "Shah Engagement",
            customerPhone: "+91-66543-21098",
            eventType: "Reception",
            eventDate: d(3, 12),
            startDate: d(3, 12),
            endDate: d(3, 12),
            startTime: "5:00 PM",
            endTime: "10:00 PM",
            guestCount: 150,
            status: "CANCELLED",
            totalAmount: 350000,
            advanceAmount: 100000,
            paidAmount: 100000,
            balanceAmount: 250000,
            hallId: id(14),
            hall: hallById(id(14)),
            leadId: id(113),
            notes: "Cancelled — family postponed the event.",
            createdAt: d(1, 18),
            payments: [
                { amount: 100000, paymentMethod: "Bank Transfer", createdAt: d(1, 18), status: "COMPLETED" },
            ],
        },
    ];

// ─── INVENTORY ────────────────────────────────────────────────
export interface DemoInventoryItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    unit: string;
    costPerUnit: number;
    lastRestocked?: string;
}

export const DEMO_INVENTORY: DemoInventoryItem[] = [
    { id: id(301), name: "Dinner Plates (Bone China)", category: "Crockery", currentStock: 480, minimumStock: 200, unit: "pcs", costPerUnit: 180, lastRestocked: d(2, 10) },
    { id: id(302), name: "Wine Glasses", category: "Glassware", currentStock: 75, minimumStock: 100, unit: "pcs", costPerUnit: 280, lastRestocked: d(1, 15) },
    { id: id(303), name: "Table Cloths (White Satin)", category: "Linen", currentStock: 32, minimumStock: 50, unit: "pcs", costPerUnit: 950, lastRestocked: d(1, 20) },
    { id: id(304), name: "Silver Serving Spoons", category: "Cutlery", currentStock: 220, minimumStock: 100, unit: "pcs", costPerUnit: 200, lastRestocked: d(2, 5) },
    { id: id(305), name: "Round Tables (6ft)", category: "Furniture", currentStock: 28, minimumStock: 20, unit: "pcs", costPerUnit: 5500, lastRestocked: d(1, 1) },
    { id: id(306), name: "Chafing Dishes (Steel)", category: "Equipment", currentStock: 10, minimumStock: 15, unit: "pcs", costPerUnit: 4200, lastRestocked: d(2, 1) },
    { id: id(307), name: "Fairy Lights (100m)", category: "Decoration", currentStock: 6, minimumStock: 10, unit: "rolls", costPerUnit: 1400, lastRestocked: d(1, 25) },
    { id: id(308), name: "Cloth Napkins (Gold)", category: "Linen", currentStock: 520, minimumStock: 300, unit: "pcs", costPerUnit: 95, lastRestocked: d(2, 12) },
    { id: id(309), name: "Champagne Flutes", category: "Glassware", currentStock: 45, minimumStock: 60, unit: "pcs", costPerUnit: 350, lastRestocked: d(1, 18) },
    { id: id(310), name: "Banquet Chairs (Tiffany)", category: "Furniture", currentStock: 350, minimumStock: 200, unit: "pcs", costPerUnit: 2800, lastRestocked: d(2, 8) },
    { id: id(311), name: "LED Centerpieces", category: "Decoration", currentStock: 18, minimumStock: 25, unit: "pcs", costPerUnit: 1800, lastRestocked: d(1, 28) },
    { id: id(312), name: "Stainless Steel Cutlery Set", category: "Cutlery", currentStock: 400, minimumStock: 250, unit: "sets", costPerUnit: 320, lastRestocked: d(2, 15) },
];

// ─── DASHBOARD ────────────────────────────────────────────────
const confirmedBookings = DEMO_BOOKINGS.filter((b) => b.status === "CONFIRMED");
const thisMonthLeads = DEMO_LEADS.filter(
    (l) => new Date(l.createdAt).getMonth() === today.getMonth()
);

export const DEMO_DASHBOARD_SUMMARY: DashboardSummary = {
    monthlyRevenue: confirmedBookings.reduce((s, b) => s + b.totalAmount, 0),
    totalOutstanding: DEMO_BOOKINGS.reduce((s, b) => s + b.balanceAmount, 0),
    totalLeadsThisMonth: thisMonthLeads.length,
    activeBookings: confirmedBookings.length,
    upcomingEvents: DEMO_BOOKINGS.filter(
        (b) => b.status !== "CANCELLED" && b.status !== "COMPLETED"
    ).length,
};

export interface BranchPerformance {
    branchId: string;
    branchName: string;
    totalRevenue: number;
    invoiceCount: number;
    trend: string;
}

export const DEMO_BRANCH_PERFORMANCE: BranchPerformance[] = [
    { branchId: id(1), branchName: "Grand Palace, Mumbai", totalRevenue: 3580000, invoiceCount: 45, trend: "+12%" },
    { branchId: id(2), branchName: "Royal Gardens, Pune", totalRevenue: 1860000, invoiceCount: 28, trend: "+8%" },
    { branchId: id(3), branchName: "Crystal Heights, Delhi", totalRevenue: 2430000, invoiceCount: 36, trend: "+15%" },
    { branchId: id(4), branchName: "Lake View, Udaipur", totalRevenue: 980000, invoiceCount: 14, trend: "+5%" },
];

// Today's events — derived from bookings on today's date
export const DEMO_TODAY_EVENTS = DEMO_BOOKINGS.filter((b) => {
    if (!b.eventDate) return false;
    const bd = new Date(b.eventDate);
    return (
        bd.getDate() === today.getDate() &&
        bd.getMonth() === today.getMonth() &&
        bd.getFullYear() === today.getFullYear() &&
        b.status !== "CANCELLED"
    );
}).map((b) => ({
    time: `${b.startTime} - ${b.endTime}`,
    name: b.customerName,
    guests: b.guestCount,
    type: b.eventType,
    hall: b.hall?.name || "TBD",
}));

// ─── REPORTS ──────────────────────────────────────────────────
export const DEMO_REVENUE_DATA = [
    { month: "Jan", revenue: 850000, bookings: 12 },
    { month: "Feb", revenue: 1120000, bookings: 16 },
    { month: "Mar", revenue: 1480000, bookings: 19 },
    { month: "Apr", revenue: 1100000, bookings: 14 },
    { month: "May", revenue: 1350000, bookings: 18 },
    { month: "Jun", revenue: 1200000, bookings: 17 },
    { month: "Jul", revenue: 980000, bookings: 13 },
    { month: "Aug", revenue: 1450000, bookings: 21 },
    { month: "Sep", revenue: 1300000, bookings: 18 },
    { month: "Oct", revenue: 1680000, bookings: 24 },
    { month: "Nov", revenue: 2100000, bookings: 28 },
    { month: "Dec", revenue: 1900000, bookings: 25 },
];

export const DEMO_EVENT_TYPE_DATA = [
    { name: "Wedding", value: 42, color: "#D4AF37" },
    { name: "Corporate", value: 22, color: "#8B6914" },
    { name: "Birthday", value: 14, color: "#FFD700" },
    { name: "Reception", value: 12, color: "#C5A028" },
    { name: "Anniversary", value: 6, color: "#E8C547" },
    { name: "Other", value: 4, color: "#B8962E" },
];

export const DEMO_BRANCH_CHART_DATA = DEMO_BRANCH_PERFORMANCE.map((b) => ({
    branch: b.branchName.split(",")[0],
    revenue: b.totalRevenue,
    bookings: b.invoiceCount,
}));

export const DEMO_OCCUPANCY_DATA = [
    { month: "Jan", rate: 72 },
    { month: "Feb", rate: 81 },
    { month: "Mar", rate: 88 },
    { month: "Apr", rate: 76 },
    { month: "May", rate: 85 },
    { month: "Jun", rate: 82 },
    { month: "Jul", rate: 68 },
    { month: "Aug", rate: 91 },
    { month: "Sep", rate: 86 },
    { month: "Oct", rate: 94 },
    { month: "Nov", rate: 97 },
    { month: "Dec", rate: 92 },
];
