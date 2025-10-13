import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const tripType = searchParams.get("tripType");
    const from = searchParams.get("seg1From");
    const to = searchParams.get("seg1To");
    const departureDate = searchParams.get("seg1Date");
    const returnDate = searchParams.get("seg2Date");
    const cabin = searchParams.get("cabin") || "Economy";
    
    // Validate required parameters
    if (!from || !to || !departureDate) {
      return NextResponse.json(
        { error: "Missing required search parameters" },
        { status: 400 }
      );
    }

    // Parse departure date - fix timezone issue
    const departureDateTime = new Date(departureDate + 'T00:00:00.000Z'); // Force UTC
    const departureDateStart = new Date(departureDateTime);
    const departureDateEnd = new Date(departureDateTime);
    departureDateEnd.setUTCHours(23, 59, 59, 999); // Use UTC methods
    
    console.log("Date parsing debug:", {
      originalDate: departureDate,
      parsedDate: departureDateTime,
      startOfDay: departureDateStart,
      endOfDay: departureDateEnd,
      isValidDate: !isNaN(departureDateTime.getTime())
    });

    // Debug logging
    console.log("Search parameters:", { from, to, departureDate, cabin });
    console.log("Date range:", { departureDateStart, departureDateEnd });
    
    // Test basic database connection
    const totalFlights = await prisma.flightSupply.count();
    console.log("Total flights in database:", totalFlights);
    
    // Test if we can find any flights at all
    const anyFlights = await prisma.flightSupply.findMany({ take: 3 });
    console.log("Sample flights (any):", anyFlights.map(f => ({
      id: f.id,
      flightNo: f.flightNo,
      departureTime: f.departureTime,
      departingAirportId: f.departingAirportId,
      arrivingAirportId: f.arrivingAirportId
    })));
    
    // Let's also check what cities exist in the database
    const allCities = await prisma.city.findMany({
      include: {
        airports: true
      }
    });
    console.log("Available cities in database:", allCities.map(c => ({
      id: c.id,
      cityName: c.cityName,
      airports: c.airports.map(a => ({ code: a.code, name: a.name }))
    })));

    // Let's check if there are any flights at all in the database
    const allFlights = await prisma.flightSupply.findMany({
      take: 5, // Just get first 5 flights
      include: {
        departingAirport: {
          include: { city: true }
        },
        arrivingAirport: {
          include: { city: true }
        }
      }
    });
    console.log("Sample flights in database:", allFlights.map(f => ({
      id: f.id,
      flightNo: f.flightNo,
      departureTime: f.departureTime,
      from: f.departingAirport.city.cityName,
      to: f.arrivingAirport.city.cityName
    })));

    // Let's check seat supplies for all flights
    const flightsWithSeats = await prisma.flightSupply.findMany({
      where: {
        departureTime: {
          gte: departureDateStart,
          lte: departureDateEnd,
        },
        departingAirport: {
          city: {
            cityName: {
              equals: from,
              mode: 'insensitive'
            },
          },
        },
        arrivingAirport: {
          city: {
            cityName: {
              equals: to,
              mode: 'insensitive'
            },
          },
        },
      },
      include: {
        seatSupplies: {
          include: {
            bookingClass: true
          }
        }
      }
    });
    console.log("All flights matching route and date:", flightsWithSeats.length);
    console.log("Seat supply details:", flightsWithSeats.map(f => ({
      flightNo: f.flightNo,
      seatSupplies: f.seatSupplies.map(s => ({
        className: s.bookingClass.className,
        availableSeats: s.noSeats,
        price: s.basePrice
      }))
    })));

    // Let's also check what cabin classes exist in the database
    const allCabinClasses = await prisma.bookingClass.findMany();
    console.log("Available cabin classes in database:", allCabinClasses.map(c => ({
      id: c.id,
      className: c.className
    })));
    console.log("Searching for cabin class:", `"${cabin}"`);

    // Let's test without cabin class filter to see if that's the issue
    const flightsWithoutCabinFilter = await prisma.flightSupply.findMany({
      where: {
        departureTime: {
          gte: departureDateStart,
          lte: departureDateEnd,
        },
        departingAirport: {
          city: {
            cityName: {
              equals: from,
              mode: 'insensitive'
            },
          },
        },
        arrivingAirport: {
          city: {
            cityName: {
              equals: to,
              mode: 'insensitive'
            },
          },
        },
      },
    });
    console.log("Flights found WITHOUT cabin filter:", flightsWithoutCabinFilter.length);

    // Search for flights using prepared statement approach
    const flights = await prisma.flightSupply.findMany({
      where: {
        departureTime: {
          gte: departureDateStart,
          lte: departureDateEnd,
        },
        departingAirport: {
          city: {
            cityName: {
              equals: from,
              mode: 'insensitive'
            },
          },
        },
        arrivingAirport: {
          city: {
            cityName: {
              equals: to,
              mode: 'insensitive'
            },
          },
        },
        seatSupplies: {
          some: {
            bookingClass: {
              className: cabin,
            },
            noSeats: {
              gt: 0, // Only flights with available seats
            },
          },
        },
      },
      include: {
        airline: true,
        departingAirport: {
          include: {
            city: true,
          },
        },
        arrivingAirport: {
          include: {
            city: true,
          },
        },
        seatSupplies: {
          where: {
            bookingClass: {
              className: cabin,
            },
            noSeats: {
              gt: 0,
            },
          },
          include: {
            bookingClass: true,
          },
        },
      },
      orderBy: {
        departureTime: "asc",
      },
    });

    // Debug logging - show database results
    console.log("Database query results - outbound flights:", flights.length, "flights found");
    console.log("Sample flight data:", flights[0] ? {
      id: flights[0].id,
      flightNo: flights[0].flightNo,
      departureTime: flights[0].departureTime,
      departingAirport: flights[0].departingAirport?.code,
      arrivingAirport: flights[0].arrivingAirport?.code,
      seatSupplies: flights[0].seatSupplies?.length
    } : "No flights found");

    // Format the response
    const formattedFlights = flights.map((flight) => {
      const seatSupply = flight.seatSupplies[0]; // Get the first (and likely only) seat supply for the requested cabin
      const arrivalTime = new Date(flight.departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + 2); // Assuming 2-hour flight duration for demo

      return {
        id: flight.id.toString(),
        airline: flight.airline.name,
        flightNumber: flight.flightNo,
        departure: {
          airport: flight.departingAirport.code,
          city: flight.departingAirport.city.cityName,
          time: flight.departureTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          date: flight.departureTime.toISOString().split("T")[0],
        },
        arrival: {
          airport: flight.arrivingAirport.code,
          city: flight.arrivingAirport.city.cityName,
          time: arrivalTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          date: arrivalTime.toISOString().split("T")[0],
        },
        duration: "2h 0m", // This could be calculated from actual flight data
        price: parseFloat(seatSupply?.basePrice.toString() || "0"),
        cabin: seatSupply?.bookingClass.className || cabin,
        stops: 0, // Assuming direct flights for now
        availableSeats: seatSupply?.noSeats || 0,
      };
    });

    // Handle return flights if trip type is "return"
    let returnFlights: any[] = [];
    if (tripType === "return" && returnDate) {
      const returnDateTime = new Date(returnDate + 'T00:00:00.000Z'); // Force UTC
      const returnDateStart = new Date(returnDateTime);
      const returnDateEnd = new Date(returnDateTime);
      returnDateEnd.setUTCHours(23, 59, 59, 999); // Use UTC methods

      const returnFlightsData = await prisma.flightSupply.findMany({
        where: {
          departureTime: {
            gte: returnDateStart,
            lte: returnDateEnd,
          },
          departingAirport: {
            city: {
              cityName: {
                equals: to,
                mode: 'insensitive'
              },
            },
          },
          arrivingAirport: {
            city: {
              cityName: {
                equals: from,
                mode: 'insensitive'
              },
            },
          },
          seatSupplies: {
            some: {
              bookingClass: {
                className: cabin,
              },
              noSeats: {
                gt: 0,
              },
            },
          },
        },
        include: {
          airline: true,
          departingAirport: {
            include: {
              city: true,
            },
          },
          arrivingAirport: {
            include: {
              city: true,
            },
          },
          seatSupplies: {
            where: {
              bookingClass: {
                className: cabin,
              },
              noSeats: {
                gt: 0,
              },
            },
            include: {
              bookingClass: true,
            },
          },
        },
        orderBy: {
          departureTime: "asc",
        },
      });

      // Debug logging - show return flights results
      console.log("Database query results - return flights:", returnFlightsData.length, "flights found");
      console.log("Sample return flight data:", returnFlightsData[0] ? {
        id: returnFlightsData[0].id,
        flightNo: returnFlightsData[0].flightNo,
        departureTime: returnFlightsData[0].departureTime,
        departingAirport: returnFlightsData[0].departingAirport?.code,
        arrivingAirport: returnFlightsData[0].arrivingAirport?.code,
        seatSupplies: returnFlightsData[0].seatSupplies?.length
      } : "No return flights found");

      returnFlights = returnFlightsData.map((flight) => {
        const seatSupply = flight.seatSupplies[0];
        const arrivalTime = new Date(flight.departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + 2);

        return {
          id: flight.id.toString(),
          airline: flight.airline.name,
          flightNumber: flight.flightNo,
          departure: {
            airport: flight.departingAirport.code,
            city: flight.departingAirport.city.cityName,
            time: flight.departureTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            date: flight.departureTime.toISOString().split("T")[0],
          },
          arrival: {
            airport: flight.arrivingAirport.code,
            city: flight.arrivingAirport.city.cityName,
            time: arrivalTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            date: arrivalTime.toISOString().split("T")[0],
          },
          duration: "2h 0m",
          price: parseFloat(seatSupply?.basePrice.toString() || "0"),
          cabin: seatSupply?.bookingClass.className || cabin,
          stops: 0,
          availableSeats: seatSupply?.noSeats || 0,
        };
      });
    }

    return NextResponse.json({
      flights: formattedFlights,
      returnFlights: returnFlights,
      searchParams: {
        tripType,
        from,
        to,
        departureDate,
        returnDate,
        cabin,
      },
    });

  } catch (error) {
    console.error("Error searching flights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
