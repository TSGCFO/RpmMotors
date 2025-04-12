import { useState } from "react";
import { calculateLoanPayment, formatCurrency } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface FinancingCalculatorProps {
  vehiclePrice: number;
}

export function FinancingCalculator({ vehiclePrice }: FinancingCalculatorProps) {
  const [price, setPrice] = useState(vehiclePrice);
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.2));
  const [interestRate, setInterestRate] = useState(4.99);
  const [termYears, setTermYears] = useState(5);
  
  const principal = price - downPayment;
  const monthlyPayment = calculateLoanPayment(principal, interestRate, termYears);
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setPrice(value);
    }
  };
  
  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value < price) {
      setDownPayment(value);
    }
  };
  
  const handleDownPaymentSlider = (value: number[]) => {
    setDownPayment(value[0]);
  };
  
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setInterestRate(value);
    }
  };
  
  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTermYears(value);
    }
  };
  
  const loanTermOptions = [
    { value: 3, label: "3 Years" },
    { value: 4, label: "4 Years" },
    { value: 5, label: "5 Years" },
    { value: 6, label: "6 Years" },
    { value: 7, label: "7 Years" }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-['Poppins'] font-semibold mb-4">Financing Calculator</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="price" className="mb-1 block">Vehicle Price</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={handlePriceChange}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <Label htmlFor="downPayment">Down Payment</Label>
            <span className="text-sm text-gray-500">{formatCurrency(downPayment)}</span>
          </div>
          <Input
            id="downPayment"
            type="number"
            value={downPayment}
            onChange={handleDownPaymentChange}
            className="w-full mb-2"
          />
          <Slider
            defaultValue={[downPayment]}
            max={Math.floor(price * 0.8)}
            min={0}
            step={1000}
            value={[downPayment]}
            onValueChange={handleDownPaymentSlider}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>{formatCurrency(Math.floor(price * 0.8))}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <span className="text-sm text-gray-500">{interestRate.toFixed(2)}%</span>
          </div>
          <Input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={handleInterestRateChange}
            step="0.01"
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="term" className="mb-1 block">Loan Term</Label>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {loanTermOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`py-2 px-3 text-center text-sm rounded-md transition-colors ${
                  termYears === option.value
                    ? "bg-[#E31837] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setTermYears(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-[#F5F5F5] p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Principal:</span>
            <span className="font-semibold">{formatCurrency(principal)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Interest Rate:</span>
            <span className="font-semibold">{interestRate.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Term:</span>
            <span className="font-semibold">{termYears} years</span>
          </div>
          <div className="border-t border-gray-300 my-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Monthly Payment:</span>
              <span className="text-xl font-bold text-[#E31837]">
                {formatCurrency(monthlyPayment)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            className="w-full bg-[#E31837] hover:bg-opacity-90"
            onClick={() => window.location.href = '/financing'}
          >
            Apply for Financing
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            This is an estimate. Contact us for personalized financing options.
          </p>
        </div>
      </div>
    </div>
  );
}
