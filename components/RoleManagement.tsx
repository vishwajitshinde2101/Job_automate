import React from 'react';
import { Shield } from 'lucide-react';

const RoleManagement: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-6">
            <Shield className="w-16 h-16 text-blue-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Coming Soon</h2>
            <p className="text-gray-500">Role &amp; Permission management will be available soon.</p>
        </div>
    );
};

export default RoleManagement;
