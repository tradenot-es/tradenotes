import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CHF: "CHF",
    AUD: "A$",
    CAD: "C$",
    CNY: "¥",
    INR: "₹",
    BRL: "R$",
    RUB: "₽",
    KRW: "₩",
    MXN: "$",
    ZAR: "R",
  };
  return symbols[currency] || currency;
}
