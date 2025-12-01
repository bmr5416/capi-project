import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FunModeContext = createContext(null);

const FUN_MODE_KEY = 'capi-fun-mode';

export function FunModeProvider({ children }) {
  const [funMode, setFunMode] = useState(() => {
    const stored = localStorage.getItem(FUN_MODE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Apply fun mode to document
    document.documentElement.setAttribute('data-fun-mode', funMode);
    localStorage.setItem(FUN_MODE_KEY, funMode);
  }, [funMode]);

  const toggleFunMode = () => {
    setFunMode((prev) => !prev);
  };

  return (
    <FunModeContext.Provider value={{ funMode, toggleFunMode }}>
      {children}
    </FunModeContext.Provider>
  );
}

FunModeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useFunMode() {
  const context = useContext(FunModeContext);
  if (!context) {
    throw new Error('useFunMode must be used within a FunModeProvider');
  }
  return context;
}
