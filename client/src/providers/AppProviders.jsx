import PropTypes from 'prop-types';
import { ThemeProvider } from '../contexts/ThemeContext';
import { FunModeProvider } from '../contexts/FunModeContext';
import { ImpProvider } from '../contexts/ImpContext';

/**
 * Compound provider wrapper that combines all app-level contexts.
 * Reduces provider nesting in App.jsx for cleaner code.
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <FunModeProvider>
        <ImpProvider>
          {children}
        </ImpProvider>
      </FunModeProvider>
    </ThemeProvider>
  );
}

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
