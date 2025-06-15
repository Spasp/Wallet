import { createContext, useCallback, useMemo, useState } from 'react';

export interface BalanceContextType {
  balance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  title: string;
  type: 'send' | 'receive';
}
export const BalanceContext = createContext<BalanceContextType | undefined>(
  undefined,
);
const initialTranasaction: Transaction = {
  id: 'Init18',
  amount: 1576.65,
  date: new Date().toISOString(),
  title: 'Salary June',
  type: 'receive',
};
export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState([initialTranasaction]);
  const [balance, setBalance] = useState(1500.75);
  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id' | 'date'>) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: Math.random().toString(),
        date: new Date().toISOString(),
      };
      setTransactions((prevTransactions: Transaction[]) => [
        newTransaction,
        ...prevTransactions,
      ]);
      if (newTransaction.type === 'receive')
        setBalance(prevBalance => prevBalance + newTransaction.amount);
      if (newTransaction.type === 'send')
        setBalance(prevBalance => prevBalance - newTransaction.amount);
    },
    [],
  );

  const value = useMemo(
    () => ({ balance, transactions, addTransaction }),
    [balance],
  );

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
};
