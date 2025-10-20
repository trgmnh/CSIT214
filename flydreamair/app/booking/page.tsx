
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import SeatSelection from "@/components/SeatSelection";
import ProgressIndicator from "@/components/ProgressIndicator";
import PriceSummary from "@/components/PriceSummary";

type BookingData = {
  tripType: string;
  totalPassengers: number;
  adults: string;
  children: string;
  infants: string;
  cabin: string;
  departureDate: string;
  returnDate: string | null;
  from: string;
  to: string;
  selectedFlight: {
    flightId: string;
    airline: string;
    flightNumber: string;
    departure: {
      airport: string;
      city: string;
      time: string;
      date: string;
    };
    arrival: {
      airport: string;
      city: string;
      time: string;
      date: string;
    };
    duration: string;
    price: number;
    cabin: string;
    stops: number;
    availableSeats: number;
    isReturn: boolean;
  };
};

export default function BookingPage() {
    const searchParams = useSearchParams();
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(dataParam));
                setBookingData(decodedData);
            } catch (error) {
                console.error('Error parsing booking data:', error);
            }
        }
        setLoading(false);
    }, [searchParams]);

    const handleSeatSelect = (seatId: string) => {
        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            } else {
                return [...prev, seatId];
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
                <div>Loading...</div>
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
            <div>
                    No booking data found. Please select a flight first.
                </div>
            </div>
        );
    }

    return ( 
        <div className="min-h-screen bg-white">
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={2} />
            
            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Flight Summary */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold">Flight Summary</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-semibold">
                                                {bookingData.selectedFlight.airline} • {bookingData.selectedFlight.flightNumber}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {bookingData.departureDate} • {bookingData.cabin} Class
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{bookingData.selectedFlight.departure.time}</div>
                                            <div className="text-sm text-gray-600">{bookingData.selectedFlight.departure.airport}</div>
                                        </div>
                                        
                                        <div className="flex-1 text-center">
                                            <div className="text-sm text-gray-600">{bookingData.selectedFlight.duration}</div>
                                            <div className="border-t border-gray-300 my-2 relative">
                                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {bookingData.selectedFlight.stops === 0 ? "Direct" : `${bookingData.selectedFlight.stops} stop${bookingData.selectedFlight.stops > 1 ? 's' : ''}`}
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{bookingData.selectedFlight.arrival.time}</div>
                                            <div className="text-sm text-gray-600">{bookingData.selectedFlight.arrival.airport}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Passenger Information */}
        <Card>
            <CardHeader>
                                <h2 className="text-lg font-bold">Passenger Information</h2>
            </CardHeader>
            <CardContent>
                                <form className="space-y-6" action="/api/create-booking" method="POST">
                                    {/* Hidden fields for flight data */}
                                    <input type="hidden" name="trip_type" value={bookingData.tripType} />
                                    <input type="hidden" name="total_passengers" value={bookingData.totalPassengers} />
                                    <input type="hidden" name="adults" value={bookingData.adults} />
                                    <input type="hidden" name="children" value={bookingData.children} />
                                    <input type="hidden" name="infants" value={bookingData.infants} />
                                    <input type="hidden" name="cabin" value={bookingData.cabin} />
                                    <input type="hidden" name="departure_date" value={bookingData.departureDate} />
                                    <input type="hidden" name="return_date" value={bookingData.returnDate || ''} />
                                    <input type="hidden" name="from" value={bookingData.from} />
                                    <input type="hidden" name="to" value={bookingData.to} />
                                    <input type="hidden" name="flight_id" value={bookingData.selectedFlight.flightId} />
                                    <input type="hidden" name="airline" value={bookingData.selectedFlight.airline} />
                                    <input type="hidden" name="flight_number" value={bookingData.selectedFlight.flightNumber} />
                                    <input type="hidden" name="price" value={bookingData.selectedFlight.price} />
                                    <input type="hidden" name="selected_seats" value={selectedSeats.join(',')} />
                                    
                                    {/* Two column form layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name *
                        </label>
                        <input 
                            type="text" 
                            name="first_name" 
                                                placeholder="Enter first name" 
                            className={cn(
                                "w-full border border-gray-300 px-3 py-2",
                                "rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            )}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name *
                        </label>
                                            <input 
                                                type="text" 
                                                name="last_name" 
                                                placeholder="Enter last name" 
                                                className={cn(
                            "w-full border border-gray-300 px-3 py-2",
                            "rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                )}
                                                required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date of Birth *
                        </label>
                                            <input 
                                                type="date" 
                                                name="date_of_birth" 
                                                className={cn(
                            "w-full border border-gray-300 px-3 py-2",
                            "rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                )}
                                                required
                                            />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Gender *
                        </label>
                                            <select 
                                                name="gender" 
                                                className={cn(
                            "w-full border border-gray-300 px-3 py-2",
                            "rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                )}
                                                required
                                            >
                                                <option value="">Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Passport Number *
                        </label>
                                            <input 
                                                type="text" 
                                                name="passport_number" 
                                                placeholder="Enter passport number" 
                                                className={cn(
                            "w-full border border-gray-300 px-3 py-2",
                            "rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                )}
                                                required
                                            />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address *
                        </label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                placeholder="Enter email" 
                                                className={cn(
                            "w-full border border-gray-300 px-3 py-2",
                            "rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                )}
                                                required
                                            />
                    </div>
                                        <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                        </label>
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                placeholder="Enter phone number" 
                                                className={cn(
                            "w-full border border-gray-300 px-3 py-2",
                            "rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                )}
                                                required
                                            />
                                        </div>
                    </div>            
                </form>
            </CardContent>
        </Card>

                        {/* Seat Selection */}
                        <SeatSelection 
                            cabin={bookingData.cabin}
                            onSeatSelect={handleSeatSelect}
                            selectedSeats={selectedSeats}
                        />
                    </div>

                    {/* Right Column - Price Summary */}
                    <div className="lg:col-span-1">
                        <PriceSummary 
                            basePrice={bookingData.selectedFlight.price}
                            taxes={120}
                            total={bookingData.selectedFlight.price + 120}
                            selectedSeats={selectedSeats}
                            onContinue={() => {
                                // Handle form submission
                                const form = document.querySelector('form');
                                if (form) form.submit();
                            }}
                        />
                    </div>
                </div>
            </div>
    </div>
    );
}


