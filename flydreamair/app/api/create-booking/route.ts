import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/actions/create-booking";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Add booking type based on trip type
    const tripType = formData.get("trip_type") as string;
    let bookingTypeId = 2; // Default to one-way
    
    if (tripType === "return") {
      bookingTypeId = 1; // Return trip
    } else if (tripType === "multi-city") {
      bookingTypeId = 3; // Multi-city trip
    }
    
    formData.set("booking_type_id", bookingTypeId.toString());
    
    const result = await createBooking(formData);
    
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    // Redirect to a success page with booking ID
    if (result?.bookingId) {
      const confirmUrl = new URL("/confirm", request.url);
      confirmUrl.searchParams.set("bookingId", result.bookingId.toString());
      return NextResponse.redirect(confirmUrl);
    }
    
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
