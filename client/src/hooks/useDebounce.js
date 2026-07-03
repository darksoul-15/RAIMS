import { useState, useEffect } from 'react';

// Returns a debounced copy of `value` that only updates after `delay` ms
// of no changes. Used for typeahead search (Module 2).
export const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
