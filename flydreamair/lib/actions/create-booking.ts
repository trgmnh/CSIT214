import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function createBooking(formData: FormData) {

    const session = await auth();
    if (!session || !session.user?.id) {
        return { error: "You need to be logged in to create a booking" };
    }
    
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const passportNumber = formData.get("passport_number") as string;
    const gender = formData.get("gender") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const bookingTypeId = parseInt(formData.get("booking_type_id") as string);

    if (!firstName || !lastName || !gender || !dateOfBirth || !passportNumber || !email || !phone) {
        return { error: "All fields are required" };
    }

    const fullName = `${firstName} ${lastName}`;
    const dob = new Date(dateOfBirth);

    const booking = await prisma.booking.create({
        data: {
            userId: session.user.id,
            bookingTypeId: bookingTypeId, 
            pnr: crypto.randomUUID(),
        },
    });

    await prisma.passenger.create({
        data: {
            fullName,
            dob,
            email,
            phone,
            booking: {
                connect: {
                    id: booking.id,
                },
            },
        },
    });

    return { success: true, bookingId: booking.id };
}