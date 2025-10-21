"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PriceSummaryProps = {
  basePrice: number;
  taxes: number;
  selectedSeats: string[];
  selectedMeal: string;
  selectedBaggage: string;
  travelInsurance: boolean;
  onContinue: () => void;
};

export default function PriceSummary({ basePrice, taxes, selectedSeats, selectedMeal, selectedBaggage, travelInsurance, onContinue }: PriceSummaryProps) {
  // Calculate add-on costs
  const getMealCost = () => {
    switch (selectedMeal) {
      case 'dietary': return 35;
      case 'premium': return 45;
      default: return 0;
    }
  };

  const getBaggageCost = () => {
    switch (selectedBaggage) {
      case 'extra': return 80;
      case 'premium': return 150;
      default: return 0;
    }
  };

  const getInsuranceCost = () => {
    return travelInsurance ? 75 : 0;
  };

  const mealCost = getMealCost();
  const baggageCost = getBaggageCost();
  const insuranceCost = getInsuranceCost();
  const total = basePrice + taxes + mealCost + baggageCost + insuranceCost;
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
          
          {/* Add-ons */}
          {mealCost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Meal Selection</span>
              <span className="font-medium">AUD {mealCost}</span>
            </div>
          )}
          {baggageCost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Baggage Upgrade</span>
              <span className="font-medium">AUD {baggageCost}</span>
            </div>
          )}
          {insuranceCost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Travel Insurance</span>
              <span className="font-medium">AUD {insuranceCost}</span>
            </div>
          )}
          
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
