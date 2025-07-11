import React, { createContext, useState, useEffect, useContext } from 'react';
import { createDataServices } from '../services/DataServices';
import { API_ENDPOINTS } from '../services/Configuration';
import { useSnackbar } from './ErrorMessage';

const UserContext = createContext();

const dataServices = createDataServices();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await dataServices.retrieve(
          API_ENDPOINTS.users.base,
          API_ENDPOINTS.users.getAll
        );
        setUsers(response.data || []);
        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch users.';
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
      setUsers(response.data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to refetch users.';
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

export const useUsers = () => useContext(UserContext);
