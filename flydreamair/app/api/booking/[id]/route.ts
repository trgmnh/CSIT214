import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        passengers: {
          include: {
            bookedSeats: {
              include: {
                bookedFlight: {
                  include: {
                    flightSupply: {
                      include: {
                        airline: true,
                        departingAirport: {
                          include: {
                            city: true
                          }
                        },
                        arrivingAirport: {
                          include: {
                            city: true
                          }
                        }
                      }
                    },
                    bookingClass: true
                  }
                }
              }
            }
          }
        },
        bookedFlights: {
          include: {
            flightSupply: {
              include: {
                airline: true,
                departingAirport: {
                  include: {
                    city: true
                  }
                },
                arrivingAirport: {
                  include: {
                    city: true
                  }
                }
              }
            },
            bookingClass: true,
            bookedSeats: true
          }
        },
        payments: true,
        bookingType: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Transform the data for the frontend
    const flightDetails = booking.bookedFlights[0];
    const passenger = booking.passengers[0];
    const seats = passenger?.bookedSeats?.map(seat => seat.seatNo) || [];
    const payment = booking.payments[0];

    // Parse preferences from booking (if stored as JSON)
    // For now, we'll use default values since we don't have a preferences field
    const preferences = {
        meal: "Standard",
        baggage: "Standard (23kg)",
        travelInsurance: false,
        mealCost: 0,
        baggageCost: 0,
        insuranceCost: 0
    };

    const response = {
      bookingId: booking.id.toString(),
      pnr: booking.pnr,
      flightDetails: {
        flightNumber: flightDetails?.flightSupply?.flightNo || "N/A",
        airline: flightDetails?.flightSupply?.airline?.name || "N/A",
        departure: {
          time: flightDetails?.flightSupply?.departureTime ? 
            new Date(flightDetails.flightSupply.departureTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }) : "N/A",
          date: flightDetails?.flightSupply?.departureTime ? 
            new Date(flightDetails.flightSupply.departureTime).toLocaleDateString('en-US', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }) : "N/A",
          airport: flightDetails?.flightSupply?.departingAirport?.code || "N/A",
          city: flightDetails?.flightSupply?.departingAirport?.city?.cityName || "N/A"
        },
        arrival: {
          time: flightDetails?.flightSupply?.departureTime ? 
            new Date(new Date(flightDetails.flightSupply.departureTime).getTime() + 23 * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }) : "N/A",
          date: flightDetails?.flightSupply?.departureTime ? 
            new Date(new Date(flightDetails.flightSupply.departureTime).getTime() + 23 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }) : "N/A",
          airport: flightDetails?.flightSupply?.arrivingAirport?.code || "N/A",
          city: flightDetails?.flightSupply?.arrivingAirport?.city?.cityName || "N/A"
        },
        duration: "23h 15m", // This would be calculated from actual flight data
        stops: 1, // This would come from flight data
        cabin: flightDetails?.bookingClass?.className || "Economy"
      },
      passenger: {
        fullName: passenger?.fullName || "N/A",
        email: passenger?.email || "N/A",
        phone: passenger?.phone || "N/A",
        passportNumber: "N1234567" // This would need to be added to the passenger model
      },
      bookingExtras: {
        seats: seats,
        meal: preferences.meal,
        baggage: preferences.baggage,
        travelInsurance: preferences.travelInsurance
      },
      priceSummary: {
        baseFare: Number(flightDetails?.fareAmount || 0),
        taxes: 120, // This would be calculated
        mealCost: preferences.mealCost,
        baggageCost: preferences.baggageCost,
        insuranceCost: preferences.insuranceCost,
        total: Number(payment?.amount || 0)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking data" },
      { status: 500 }
    );
  }
}
