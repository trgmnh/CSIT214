"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PriceSummaryProps = {
  basePrice: number;
  taxes: number;
  total: number;
  selectedSeats: string[];
  onContinue: () => void;
};

export default function PriceSummary({ basePrice, taxes, total, selectedSeats, onContinue }: PriceSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <h3 className="text-lg font-bold">Price Summary</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Fare</span>
            <span className="font-medium">AUD {basePrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & Fees</span>
            <span className="font-medium">AUD {taxes}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>AUD {total}</span>
            </div>
          </div>
        </div>

        {/* Selected Seats Info */}
        {selectedSeats.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Selected Seats</h4>
            <div className="flex flex-wrap gap-1">
              {selectedSeats.map(seat => (
                <span key={seat} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  {seat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
        >
          Continue to Payment
        </Button>

        {/* Terms & Conditions */}
        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to our Terms & Conditions
        </p>
      </CardContent>
    </Card>
  );
}
