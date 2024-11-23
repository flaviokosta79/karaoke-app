import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import UserSetup from './pages/UserSetup';
import Session from './pages/Session';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<UserSetup />} />
          <Route path="/setup/:sessionId" element={<UserSetup />} />
          <Route path="/session/:sessionId" element={<Session />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
