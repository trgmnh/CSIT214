"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BookingData = {
    bookingId: string;
    pnr: string;
    flightDetails: {
        flightNumber: string;
        airline: string;
        departure: {
            time: string;
            date: string;
            airport: string;
            city: string;
        };
        arrival: {
            time: string;
            date: string;
            airport: string;
            city: string;
        };
        duration: string;
        stops: number;
        cabin: string;
    };
    passenger: {
        fullName: string;
        email: string;
        phone: string;
        passportNumber: string;
    };
    bookingExtras: {
        seats: string[];
        meal: string;
        baggage: string;
        travelInsurance: boolean;
    };
    priceSummary: {
        baseFare: number;
        taxes: number;
        mealCost: number;
        baggageCost: number;
        insuranceCost: number;
        total: number;
    };
};

export default function BookingConfirmPage() {
    const searchParams = useSearchParams();
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);

    useEffect(() => {
        const fetchBookingData = async () => {
            const bookingId = searchParams.get('bookingId');
            
            if (bookingId) {
                try {
                    const response = await fetch(`/api/booking/${bookingId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setBookingData(data);
                        setShowSuccessNotification(true);
                    } else {
                        console.error('Failed to fetch booking data');
                    }
                } catch (error) {
                    console.error('Error fetching booking data:', error);
                }
            }
            
            setLoading(false);
        };

        fetchBookingData();
    }, [searchParams]);

    const handleDownloadTicket = () => {
        // Implement ticket download functionality
        console.log("Downloading ticket...");
    };

    const handleModifyBooking = () => {
        // Implement modify booking functionality
        console.log("Modifying booking...");
    };

    const handleChangeDates = () => {
        // Implement change dates functionality
        console.log("Changing dates...");
    };

    const handleAddBaggage = () => {
        // Implement add baggage functionality
        console.log("Adding baggage...");
    };

    const handleCancelBooking = () => {
        // Implement cancel booking functionality
        console.log("Canceling booking...");
    };

    const handleContactSupport = () => {
        // Implement contact support functionality
        console.log("Contacting support...");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
                <div>Loading booking confirmation...</div>
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
                <div>No booking data found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success Notification */}
            {showSuccessNotification && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-semibold">Booking Confirmed!</div>
                        <div className="text-sm opacity-90">Your flight has been successfully booked</div>
                    </div>
                    <button 
                        onClick={() => setShowSuccessNotification(false)}
                        className="ml-4 text-white hover:text-gray-200"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Booking Confirmed Header */}
                <div className="bg-green-500 text-white px-6 py-4 rounded-lg mb-8 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Booking Confirmed</h1>
                        <p className="text-green-100">Reference: {bookingData.pnr}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Flight Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                    <h2 className="text-xl font-bold">Flight Details</h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-semibold">
                                                {bookingData.flightDetails.airline} • {bookingData.flightDetails.flightNumber}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {bookingData.flightDetails.departure.date}
                                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                    {bookingData.flightDetails.cabin}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{bookingData.flightDetails.departure.time}</div>
                                            <div className="text-sm text-gray-600">{bookingData.flightDetails.departure.airport}</div>
                                            <div className="text-xs text-gray-500">{bookingData.flightDetails.departure.city}</div>
                                        </div>

                                        <div className="flex-1 text-center">
                                            <div className="text-sm text-gray-600">{bookingData.flightDetails.duration}</div>
                                            <div className="border-t border-gray-300 my-2 relative">
                                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {bookingData.flightDetails.stops === 0 ? "Direct" : `${bookingData.flightDetails.stops} stop${bookingData.flightDetails.stops > 1 ? 's' : ''}`}
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{bookingData.flightDetails.arrival.time}</div>
                                            <div className="text-sm text-gray-600">{bookingData.flightDetails.arrival.airport}</div>
                                            <div className="text-xs text-gray-500">{bookingData.flightDetails.arrival.city}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Passenger Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <h2 className="text-xl font-bold">Passenger Information</h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <p className="text-gray-900">{bookingData.passenger.fullName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <p className="text-gray-900">{bookingData.passenger.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                                        <p className="text-gray-900">{bookingData.passenger.passportNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <p className="text-gray-900">{bookingData.passenger.phone}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Booking Extras */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold">Booking Extras</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Seat */}
                                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                            </svg>
                                        </div>
                                        <div className="font-medium">Seat</div>
                                        <div className="text-sm text-gray-600">{bookingData.bookingExtras.seats.join(', ')}</div>
                                    </div>

                                    {/* Meal */}
                                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                            </svg>
                                        </div>
                                        <div className="font-medium">Meal</div>
                                        <div className="text-sm text-gray-600">{bookingData.bookingExtras.meal}</div>
                                    </div>

                                    {/* Baggage */}
                                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="font-medium">Baggage</div>
                                        <div className="text-sm text-gray-600">{bookingData.bookingExtras.baggage}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Price Summary & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Price Summary */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-bold">Price Summary</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Fare</span>
                                        <span className="font-medium">AUD {bookingData.priceSummary.baseFare}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Taxes & Fees</span>
                                        <span className="font-medium">AUD {bookingData.priceSummary.taxes}</span>
                                    </div>
                                    
                                    {bookingData.priceSummary.mealCost > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Meal Selection</span>
                                            <span className="font-medium">AUD {bookingData.priceSummary.mealCost}</span>
                                        </div>
                                    )}
                                    {bookingData.priceSummary.baggageCost > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Baggage Upgrade</span>
                                            <span className="font-medium">AUD {bookingData.priceSummary.baggageCost}</span>
                                        </div>
                                    )}
                                    {bookingData.priceSummary.insuranceCost > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Travel Insurance</span>
                                            <span className="font-medium">AUD {bookingData.priceSummary.insuranceCost}</span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Paid</span>
                                            <span>AUD {bookingData.priceSummary.total}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleDownloadTicket}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span>Download Ticket</span>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-bold">Quick Actions</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={handleModifyBooking}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Modify Booking
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={handleChangeDates}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    Change Dates
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={handleAddBaggage}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                                    </svg>
                                    Add Baggage
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={handleCancelBooking}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Cancel Booking
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Support */}
                        <Card className="bg-blue-900 text-white">
                            <CardHeader>
                                <h3 className="text-lg font-bold">Need Help?</h3>
                            </CardHeader>
                            <CardContent>
                                <p className="text-blue-100 mb-4">
                                    Our support team is available 24/7
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="w-full bg-white text-blue-900 hover:bg-gray-100"
                                    onClick={handleContactSupport}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}