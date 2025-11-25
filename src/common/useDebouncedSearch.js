import { useState, useEffect } from 'react';

function useDebouncedSearch(initialValue, delay) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return { searchTerm, setSearchTerm, debouncedSearchTerm };
}

export default useDebouncedSearch;