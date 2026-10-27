import { useContext } from 'react';
import { ThemeContext, type ThemeContextType, type Theme, type ResolvedTheme } from '../context/theme-context';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { Theme, ResolvedTheme };
