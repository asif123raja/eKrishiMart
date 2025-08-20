// src/context/TotalAmountContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const TotalAmountContext = createContext<{
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
} | null>(null);

export const TotalAmountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [totalAmount, setTotalAmount] = useState(0);

  return (
    <TotalAmountContext.Provider value={{ totalAmount, setTotalAmount }}>
      {children}
    </TotalAmountContext.Provider>
  );
};

export const useTotalAmount = () => {
  const context = useContext(TotalAmountContext);
  if (!context) throw new Error("useTotalAmount must be used within a TotalAmountProvider");
  return context;
};
