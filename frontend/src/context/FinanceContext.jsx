import { createContext, useContext, useState, useCallback } from 'react';
import {
  transactionService,
  categoryService,
  budgetService,
  dashboardService,
} from '../services';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async filters => {
    setLoading(true);
    try {
      const data = await transactionService.getAll(filters);
      setTransactions(data.data);
      return data;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data.data);
      return data;
    } catch (err) {
      console.error('Error fetching categories:', err);
      throw err;
    }
  }, []);

  const fetchBudgets = useCallback(async filters => {
    try {
      const data = await budgetService.getAll(filters);
      setBudgets(data.data);
      return data;
    } catch (err) {
      console.error('Error fetching budgets:', err);
      throw err;
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await dashboardService.getSummary();
      setDashboard(data.data);
      return data;
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      throw err;
    }
  }, []);

  const addTransaction = async transactionData => {
    const data = await transactionService.create(transactionData);
    setTransactions(prev => [data.data, ...prev]);
    return data;
  };

  const updateTransaction = async (id, transactionData) => {
    const data = await transactionService.update(id, transactionData);
    setTransactions(prev => prev.map(t => (t._id === id ? data.data : t)));
    return data;
  };

  const deleteTransaction = async id => {
    await transactionService.delete(id);
    setTransactions(prev => prev.filter(t => t._id !== id));
  };

  const updateBudget = async (id, budgetData) => {
    const data = await budgetService.update(id, budgetData);
    setBudgets(prev => prev.map(b => (b._id === id ? data.data : b)));
    return data;
  };

  const value = {
    transactions,
    categories,
    budgets,
    dashboard,
    loading,
    fetchTransactions,
    fetchCategories,
    fetchBudgets,
    fetchDashboard,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};
