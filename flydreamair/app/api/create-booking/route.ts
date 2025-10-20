import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/actions/create-booking";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Add booking type based on trip type
    const tripType = formData.get("trip_type") as string;
    let bookingTypeId = 1; // Default to one-way
    
    if (tripType === "return") {
      bookingTypeId = 2; // Return trip
    } else if (tripType === "multi-city") {
      bookingTypeId = 3; // Multi-city trip
    }
    
    formData.set("booking_type_id", bookingTypeId.toString());
    
    const result = await createBooking(formData);
    
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    // Redirect to a success page or trips page
    return NextResponse.redirect(new URL("/trips", request.url));
    
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
