import React from 'react';
import { createRoot } from 'react-dom/client';
import SignIn from './renderer/pages/SignIn';

const root = createRoot(document.getElementById('root'));
root.render(<SignIn />);
