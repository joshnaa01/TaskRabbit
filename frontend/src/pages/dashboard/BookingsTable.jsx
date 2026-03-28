import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ClientBookings from './client/ClientBookings';
import ProviderBookings from './provider/ProviderBookings';
import AdminBookings from './admin/AdminBookings';

const BookingsTable = () => {
    const { user } = useAuth();
    // Context-Aware Dispatcher
    switch (user?.role) {
        case 'client':
            return <ClientBookings />;
        case 'provider':
            return <ProviderBookings />;
        case 'admin':
            return <AdminBookings />;
        default:
            return (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2 font-black tracking-tight leading-none mb-2">Unauthorized Protocol Attempt</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your identity context does not permit access to this operation matrix.</p>
                </div>
            );
    }
};

export default BookingsTable;
