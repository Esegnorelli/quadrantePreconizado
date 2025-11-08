import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#333',
                    color: '#fff',
                },
                success: {
                    duration: 3000,
                    // FIX: Replaced invalid 'theme' property with 'iconTheme' for styling toast icons.
                    iconTheme: {
                        primary: 'green',
                        secondary: 'black',
                    },
                },
            }}
        />
    );
};