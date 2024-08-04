import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme';
import PantryList from '@/components/PantryList';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ padding: '20px' }}>
        <PantryList />
      </div>
    </ThemeProvider>
  );
};

export default App;
