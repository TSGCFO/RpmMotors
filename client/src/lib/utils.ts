import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateLoanPayment(
  principal: number,
  interestRate: number,
  termYears: number
): number {
  // Convert annual interest rate to monthly and decimal form
  const monthlyRate = interestRate / 100 / 12;
  // Convert term from years to months
  const termMonths = termYears * 12;
  
  // Calculate monthly payment using the loan payment formula
  if (monthlyRate === 0) {
    return principal / termMonths;
  }
  
  const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  return payment;
}
