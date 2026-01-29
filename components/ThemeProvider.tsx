'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  primaryColor: string;
  changeColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#E91E63');

  // Load saved settings on startup
  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    const savedColor = localStorage.getItem('primaryColor') || '#E91E63';
    
    setIsDarkMode(savedDark);
    setPrimaryColor(savedColor);
    
    // Apply initial settings
    if (savedDark) document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--primary', savedColor);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const changeColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    document.documentElement.style.setProperty('--primary', color);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, primaryColor, changeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};