"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Flight = {
  id: string;
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
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");

  // Extract search parameters
  const tripType = searchParams.get("tripType") || "return";
  const from = searchParams.get("seg1From") || "";
  const to = searchParams.get("seg1To") || "";
  const departureDate = searchParams.get("seg1Date") || "";
  const returnDate = searchParams.get("seg2Date") || "";
  const adults = searchParams.get("adults") || "1";
  const children = searchParams.get("children") || "0";
  const infants = searchParams.get("infants") || "0";
  const cabin = searchParams.get("cabin") || "Economy";

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const queryParams = new URLSearchParams({
          tripType,
          seg1From: from,
          seg1To: to,
          seg1Date: departureDate,
          cabin,
        });
        
        if (returnDate) {
          queryParams.set("seg2Date", returnDate);
        }

        const response = await fetch(`/api/search-flights?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setFlights(data.flights || []);
        setReturnFlights(data.returnFlights || []);
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch flights");
        setFlights([]);
        setReturnFlights([]);
      } finally {
        setLoading(false);
      }
    };

    if (from && to && departureDate) {
      fetchFlights();
    } else {
      setLoading(false);
    }
  }, [from, to, departureDate, returnDate, tripType, cabin]);

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "duration":
        return a.duration.localeCompare(b.duration);
      case "departure":
        return a.departure.time.localeCompare(b.departure.time);
      default:
        return 0;
    }
  });

  const totalPassengers = parseInt(adults) + parseInt(children) + parseInt(infants);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Flight Search Results</h1>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <span className="font-medium">
              {from.toUpperCase()} → {to.toUpperCase()}
            </span>
            <span>•</span>
            <span>{departureDate}</span>
            {tripType === "return" && returnDate && (
              <>
                <span>•</span>
                <span>Return: {returnDate}</span>
              </>
            )}
            <span>•</span>
            <span>{totalPassengers} passenger{totalPassengers > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{cabin}</span>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-gray-600">Sort by:</span>
        <div className="flex gap-2">
          {[
            { key: "price", label: "Price" },
            { key: "departure", label: "Departure Time" },
            { key: "duration", label: "Duration" }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as typeof sortBy)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                sortBy === option.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Results */}
      <div className="space-y-6">
        {/* Outbound Flights */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Outbound Flights ({from.toUpperCase()} → {to.toUpperCase()})
          </h2>
          <div className="space-y-4">
            {sortedFlights.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">No outbound flights found for your search criteria.</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search parameters.</p>
                </CardContent>
              </Card>
            ) : (
              sortedFlights.map((flight) => (
                <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Flight Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{flight.departure.time}</div>
                            <div className="text-sm text-gray-600">{flight.departure.airport}</div>
                            <div className="text-xs text-gray-500">{flight.departure.city}</div>
                          </div>
                          
                          <div className="flex-1 text-center">
                            <div className="text-sm text-gray-600">{flight.duration}</div>
                            <div className="border-t border-gray-300 my-2 relative">
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold">{flight.arrival.time}</div>
                            <div className="text-sm text-gray-600">{flight.arrival.airport}</div>
                            <div className="text-xs text-gray-500">{flight.arrival.city}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{flight.airline}</span>
                          <span>•</span>
                          <span>{flight.flightNumber}</span>
                          <span>•</span>
                          <span>{flight.cabin}</span>
                          <span>•</span>
                          <span>{flight.availableSeats} seats available</span>
                        </div>
                      </div>

                      {/* Price and Book Button */}
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          ${flight.price}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">per person</div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                          Select
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Return Flights - only show for return trips */}
        {tripType === "return" && returnFlights.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Return Flights ({to.toUpperCase()} → {from.toUpperCase()})
            </h2>
            <div className="space-y-4">
              {returnFlights.map((flight) => (
                <Card key={`return-${flight.id}`} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Flight Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{flight.departure.time}</div>
                            <div className="text-sm text-gray-600">{flight.departure.airport}</div>
                            <div className="text-xs text-gray-500">{flight.departure.city}</div>
                          </div>
                          
                          <div className="flex-1 text-center">
                            <div className="text-sm text-gray-600">{flight.duration}</div>
                            <div className="border-t border-gray-300 my-2 relative">
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold">{flight.arrival.time}</div>
                            <div className="text-sm text-gray-600">{flight.arrival.airport}</div>
                            <div className="text-xs text-gray-500">{flight.arrival.city}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{flight.airline}</span>
                          <span>•</span>
                          <span>{flight.flightNumber}</span>
                          <span>•</span>
                          <span>{flight.cabin}</span>
                          <span>•</span>
                          <span>{flight.availableSeats} seats available</span>
                        </div>
                      </div>

                      {/* Price and Book Button */}
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          ${flight.price}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">per person</div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                          Select
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back to Search */}
      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="px-6 py-2"
        >
          ← Back to Search
        </Button>
      </div>
    </div>
  );
}
