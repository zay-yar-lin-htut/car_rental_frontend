import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { createDataServices } from '../services/DataServices';
import { API_ENDPOINTS } from '../services/Configuration';
import { useSnackbar } from './ErrorMessage';
import type { User } from '../types';

interface UserContextValue {
  users: User[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

const dataServices = createDataServices();

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await dataServices.retrieve(
          API_ENDPOINTS.users.base,
          API_ENDPOINTS.users.getAll
        );
        setUsers((response.data as User[]) || []);
        setError(null);
      } catch (err) {
        const errorMessage = (err as Error).message || 'Failed to fetch users.';
        setError(errorMessage);
        showSnackbar(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showSnackbar]);

  const refreshUsers = async () => {
    // Function to manually refresh the user list
    setLoading(true);
    try {
      const response = await dataServices.retrieve(
        API_ENDPOINTS.users.base,
        API_ENDPOINTS.users.getAll
      );
      setUsers((response.data as User[]) || []);
      setError(null);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to refetch users.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{ users, loading, error, refreshUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
