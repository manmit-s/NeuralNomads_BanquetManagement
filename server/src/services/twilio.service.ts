import twilio from "twilio";
import { config } from "../config/index.js";

export class TwilioService {
    private static client: any = null;

    private static getClient() {
        if (!this.client && config.twilio.accountSid && config.twilio.authToken && config.twilio.accountSid.startsWith("AC")) {
            this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
        }
        return this.client;
    }

    /**
     * Send an SMS message.
     */
    static async sendSMS(to: string, body: string) {
        const client = this.getClient();
        if (!client) {
            console.warn("[Twilio] Credentials missing or invalid. Skipping SMS message.");
            return;
        }

        try {
            // Ensure phone number starts with + and has no spaces/dashes
            // For India, ensure +91 prefix if not already present
            let formattedTo = to.replace(/\s+/g, "");
            if (!formattedTo.startsWith("+")) {
                formattedTo = formattedTo.startsWith("91") ? `+${formattedTo}` : `+91${formattedTo}`;
            }

            const message = await client.messages.create({
                from: config.twilio.phoneNumber, // This is now loaded from TWILIO_PHONE_NUMBER
                to: formattedTo,
                body: body,
            });

            console.log(`[Twilio] SMS sent: ${message.sid}`);
            return message;
        } catch (error: any) {
            console.error("[Twilio] Failed to send SMS:", error.message);
            // We don't throw here to avoid breaking the main business flow
        }
    }

    /**
     * Send notification for a new lead/enquiry.
     */
    static async sendLeadNotification(lead: any) {
        const body = `New Enquiry!\n` +
            `Customer: ${lead.customerName}\n` +
            `Event: ${lead.eventType}\n` +
            `Date: ${lead.eventDate ? new Date(lead.eventDate).toLocaleDateString() : "TBD"}\n` +
            `Guests: ${lead.guestCount || "TBD"}\n` +
            `Phone: ${lead.customerPhone}`;

        return this.sendSMS(lead.customerPhone, body);
    }

    /**
     * Send notification for a new booking confirmation.
     */
    static async sendBookingNotification(booking: any, lead: any) {
        const body = `Booking Confirmed!\n` +
            `Booking #: ${booking.bookingNumber}\n` +
            `Customer: ${lead.customerName}\n` +
            `Dates: ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}\n` +
            `Venue: ${booking.hall?.name || "Assigned Hall"}\n` +
            `Total: ₹${booking.totalAmount}\n` +
            `Balance: ₹${booking.balanceAmount}\n` +
            `Thank you!`;

        return this.sendSMS(lead.customerPhone, body);
    }
}
