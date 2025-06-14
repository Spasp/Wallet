import { Children, createContext, useCallback, useMemo, useState } from "react";

interface BalanceContextType{
    balance:number;
    setBalance: React.Dispatch<React.SetStateAction<number>>
    deductFromBalance:(amount:number)=>void
}
export const BalanceContext  = createContext<BalanceContextType | undefined>(undefined)
export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [balance, setBalance] = useState(1500.75);
  const deductFromBalance = useCallback((amount: number) => {
    setBalance(prevBalance => prevBalance - amount);
  }, [setBalance]);
 const value = useMemo(()=>({balance,setBalance,deductFromBalance}),[balance])

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
}
