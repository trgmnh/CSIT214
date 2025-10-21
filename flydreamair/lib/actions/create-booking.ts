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
    
    // Flight details
    const flightId = formData.get("flight_id") as string;
    const airline = formData.get("airline") as string;
    const flightNumber = formData.get("flight_number") as string;
    const price = parseFloat(formData.get("price") as string);
    
    // Add-ons
    const selectedSeats = formData.get("selected_seats") as string;
    const selectedMeal = formData.get("selected_meal") as string;
    const selectedBaggage = formData.get("selected_baggage") as string;
    const travelInsurance = formData.get("travel_insurance") === "true";

    if (!firstName || !lastName || !gender || !dateOfBirth || !passportNumber || !email || !phone) {
        return { error: "All fields are required" };
    }

    const fullName = `${firstName} ${lastName}`;
    const dob = new Date(dateOfBirth);

    // Calculate add-on costs
    let mealCost = 0;
    let baggageCost = 0;
    let insuranceCost = 0;

    if (selectedMeal === 'dietary') mealCost = 35;
    else if (selectedMeal === 'premium') mealCost = 45;

    if (selectedBaggage === 'extra') baggageCost = 80;
    else if (selectedBaggage === 'premium') baggageCost = 150;

    if (travelInsurance) insuranceCost = 75;

    // Generate PNR
    const pnr = `FLYDA${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Store booking preferences as JSON string in a comment field
    const preferences = {
        meal: selectedMeal,
        baggage: selectedBaggage,
        travelInsurance: travelInsurance,
        mealCost: mealCost,
        baggageCost: baggageCost,
        insuranceCost: insuranceCost
    };

    const booking = await prisma.booking.create({
        data: {
            userId: session.user.id,
            bookingTypeId: bookingTypeId, 
            pnr: pnr,
        },
    });

    // Create passenger
    const passenger = await prisma.passenger.create({
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

    // Create booked flight (assuming flightSupplyId 1 and bookingClassId 1 for now)
    const bookedFlight = await prisma.bookedFlight.create({
        data: {
            bookingId: booking.id,
            flightSupplyId: 1, // This should be mapped from the actual flight data
            bookingClassId: 1, // This should be mapped from the cabin class
            fareAmount: price,
            fareCurrency: "AUD",
        },
    });

    // Create booked seats
    if (selectedSeats) {
        const seats = selectedSeats.split(',').filter(seat => seat.trim());
        for (const seat of seats) {
            await prisma.bookedSeat.create({
                data: {
                    bookedFlightId: bookedFlight.id,
                    passengerId: passenger.id,
                    seatNo: seat.trim(),
                },
            });
        }
    }

    // Calculate total price including add-ons
    const totalPrice = price + mealCost + baggageCost + insuranceCost;

    // Create payment record
    await prisma.payment.create({
        data: {
            bookingId: booking.id,
            amount: totalPrice,
            currency: "AUD",
            method: "CARD-MOCK",
            status: "SUCCESS",
            txRef: `TXN_${Date.now()}`,
        },
    });

    return { success: true, bookingId: booking.id, pnr: pnr };
}