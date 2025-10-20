"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SeatStatus = "available" | "selected" | "occupied";

type Seat = {
  id: string;
  row: number;
  column: string;
  status: SeatStatus;
  price?: number;
};

type SeatSelectionProps = {
  cabin: string;
  onSeatSelect: (seatId: string) => void;
  selectedSeats: string[];
};

const generateSeatMap = (cabin: string): Seat[] => {
  const seats: Seat[] = [];
  const columns = ["A", "B", "C", "D", "E", "F"];
  
  // Define cabin configurations
  const cabinConfig = {
    "Economy": { startRow: 1, endRow: 30, price: 0 },
    "Business": { startRow: 1, endRow: 8, price: 50 },
    "First": { startRow: 1, endRow: 4, price: 100 }
  };
  
  const config = cabinConfig[cabin as keyof typeof cabinConfig] || cabinConfig.Economy;
  
  for (let row = config.startRow; row <= config.endRow; row++) {
    for (const column of columns) {
      const seatId = `${row}${column}`;
      
      // Simulate some occupied seats (random for demo)
      const isOccupied = Math.random() < 0.15; // 15% chance of being occupied
      
      seats.push({
        id: seatId,
        row,
        column,
        status: isOccupied ? "occupied" : "available",
        price: config.price
      });
    }
  }
  
  return seats;
};

export default function SeatSelection({ cabin, onSeatSelect, selectedSeats }: SeatSelectionProps) {
  const [seats] = useState<Seat[]>(() => generateSeatMap(cabin));
  
  const getSeatStatus = (seat: Seat): SeatStatus => {
    if (selectedSeats.includes(seat.id)) {
      return "selected";
    }
    return seat.status;
  };
  
  const getSeatStyle = (seat: Seat) => {
    const status = getSeatStatus(seat);
    
    switch (status) {
      case "available":
        return "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50 cursor-pointer";
      case "selected":
        return "bg-blue-600 border-2 border-blue-600 text-white cursor-pointer";
      case "occupied":
        return "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed";
      default:
        return "bg-white border-2 border-gray-300 text-gray-700";
    }
  };
  
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "occupied") return;
    onSeatSelect(seat.id);
  };
  
  // Group seats by row for display
  const seatRows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);
  
  const maxRow = Math.max(...Object.keys(seatRows).map(Number));
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Select Your Seat</h3>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Front of Aircraft indicator */}
          <div className="text-center">
            <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium">
              Front of Aircraft
            </div>
          </div>
          
          {/* Seat Map */}
          <div className="flex justify-center">
            <div className="space-y-1">
              {/* Column headers */}
              <div className="flex gap-2 mb-2">
                <div className="w-8"></div> {/* Row number space */}
                <div className="flex gap-1">
                  <div className="w-8 text-center text-xs font-medium">A</div>
                  <div className="w-8 text-center text-xs font-medium">B</div>
                  <div className="w-8 text-center text-xs font-medium">C</div>
                </div>
                <div className="w-4"></div> {/* Aisle */}
                <div className="flex gap-1">
                  <div className="w-8 text-center text-xs font-medium">D</div>
                  <div className="w-8 text-center text-xs font-medium">E</div>
                  <div className="w-8 text-center text-xs font-medium">F</div>
                </div>
              </div>
              
              {/* Seat rows */}
              {Array.from({ length: maxRow }, (_, i) => i + 1).map(rowNum => {
                const rowSeats = seatRows[rowNum] || [];
                const leftSeats = rowSeats.filter(seat => ["A", "B", "C"].includes(seat.column));
                const rightSeats = rowSeats.filter(seat => ["D", "E", "F"].includes(seat.column));
                
                return (
                  <div key={rowNum} className="flex items-center gap-2">
                    {/* Row number */}
                    <div className="w-8 text-right text-sm font-medium">{rowNum}</div>
                    
                    {/* Left side seats */}
                    <div className="flex gap-1">
                      {["A", "B", "C"].map(column => {
                        const seat = leftSeats.find(s => s.column === column);
                        return (
                          <button
                            key={`${rowNum}${column}`}
                            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${seat ? getSeatStyle(seat) : 'invisible'}`}
                            onClick={() => seat && handleSeatClick(seat)}
                            disabled={seat?.status === "occupied"}
                          >
                            {seat ? `${rowNum}${column}` : ''}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Aisle */}
                    <div className="w-4"></div>
                    
                    {/* Right side seats */}
                    <div className="flex gap-1">
                      {["D", "E", "F"].map(column => {
                        const seat = rightSeats.find(s => s.column === column);
                        return (
                          <button
                            key={`${rowNum}${column}`}
                            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${seat ? getSeatStyle(seat) : 'invisible'}`}
                            onClick={() => seat && handleSeatClick(seat)}
                            disabled={seat?.status === "occupied"}
                          >
                            {seat ? `${rowNum}${column}` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Back of Aircraft indicator */}
          <div className="text-center mt-4">
            <div className="inline-block bg-gray-600 text-white px-4 py-1 rounded text-sm font-medium">
              Back of Aircraft
            </div>
          </div>
          
          {/* Selected seats summary */}
          {selectedSeats.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Seats:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seatId => (
                  <span key={seatId} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                    {seatId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
