import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateLoanPayment, formatCurrency } from "@/lib/utils";

interface FinancingCalculatorProps {
  vehiclePrice?: number;
  className?: string;
}

export function FinancingCalculator({
  vehiclePrice = 0,
  className = "",
}: FinancingCalculatorProps) {
  const [price, setPrice] = useState(vehiclePrice);
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.2)); // Default 20% down
  const [interestRate, setInterestRate] = useState(4.5);
  const [termYears, setTermYears] = useState(5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setPrice(newPrice);
    
    // Keep the same down payment percentage
    const newDownPayment = Math.round(newPrice * (downPaymentPercent / 100));
    setDownPayment(newDownPayment);
  };

  // Handle down payment input change
  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDownPayment = parseFloat(e.target.value) || 0;
    setDownPayment(newDownPayment);
    
    // Update down payment percentage
    const newPercent = price > 0 ? Math.round((newDownPayment / price) * 100) : 0;
    setDownPaymentPercent(newPercent);
  };

  // Handle down payment percentage change via slider
  const handleDownPaymentPercentChange = (values: number[]) => {
    const newPercent = values[0];
    setDownPaymentPercent(newPercent);
    
    // Update down payment amount
    const newDownPayment = Math.round(price * (newPercent / 100));
    setDownPayment(newDownPayment);
  };

  // Handle interest rate change via slider
  const handleInterestRateChange = (values: number[]) => {
    setInterestRate(values[0]);
  };

  // Handle term years change via slider
  const handleTermYearsChange = (values: number[]) => {
    setTermYears(values[0]);
  };

  // Calculate monthly payment whenever inputs change
  useEffect(() => {
    const loanAmount = price - downPayment;
    if (loanAmount <= 0 || termYears <= 0) {
      setMonthlyPayment(0);
      return;
    }
    
    const payment = calculateLoanPayment(loanAmount, interestRate, termYears);
    setMonthlyPayment(payment);
  }, [price, downPayment, interestRate, termYears]);

  // Initial calculation when component mounts or vehiclePrice changes
  useEffect(() => {
    if (vehiclePrice !== price) {
      setPrice(vehiclePrice);
      const newDownPayment = Math.round(vehiclePrice * 0.2);
      setDownPayment(newDownPayment);
    }
  }, [vehiclePrice]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-['Poppins'] font-semibold mb-4">
        Financing Calculator
      </h3>
      
      <div className="space-y-6">
        {/* Vehicle Price */}
        <div className="space-y-2">
          <Label htmlFor="vehicle-price">Vehicle Price</Label>
          <Input
            id="vehicle-price"
            type="number"
            min="0"
            step="100"
            value={price}
            onChange={handlePriceChange}
          />
        </div>
        
        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="down-payment">Down Payment</Label>
            <span className="text-sm text-gray-500">{downPaymentPercent}%</span>
          </div>
          <Input
            id="down-payment"
            type="number"
            min="0"
            step="100"
            value={downPayment}
            onChange={handleDownPaymentChange}
          />
          <Slider
            defaultValue={[20]}
            max={50}
            step={1}
            value={[downPaymentPercent]}
            onValueChange={handleDownPaymentPercentChange}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>
        
        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="interest-rate">Interest Rate</Label>
            <span className="text-sm text-gray-500">{interestRate.toFixed(1)}%</span>
          </div>
          <Slider
            id="interest-rate"
            defaultValue={[4.5]}
            min={0.5}
            max={15}
            step={0.1}
            value={[interestRate]}
            onValueChange={handleInterestRateChange}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.5%</span>
            <span>15%</span>
          </div>
        </div>
        
        {/* Loan Term */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="loan-term">Loan Term</Label>
            <span className="text-sm text-gray-500">{termYears} years</span>
          </div>
          <Slider
            id="loan-term"
            defaultValue={[5]}
            min={1}
            max={10}
            step={1}
            value={[termYears]}
            onValueChange={handleTermYearsChange}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 year</span>
            <span>10 years</span>
          </div>
        </div>
        
        {/* Results */}
        <div className="bg-gray-50 p-4 rounded-md mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Monthly Payment</div>
              <div className="text-2xl font-['Poppins'] font-bold text-[#E31837]">
                {formatCurrency(monthlyPayment)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Loan Amount</div>
              <div className="text-lg font-['Poppins'] font-semibold">
                {formatCurrency(price - downPayment)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Interest</div>
              <div className="text-lg font-['Poppins'] font-semibold">
                {formatCurrency(monthlyPayment * termYears * 12 - (price - downPayment))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Cost</div>
              <div className="text-lg font-['Poppins'] font-semibold">
                {formatCurrency(downPayment + monthlyPayment * termYears * 12)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          This calculator provides an estimate. Contact us for personalized financing options.
        </p>
      </div>
    </div>
  );
}