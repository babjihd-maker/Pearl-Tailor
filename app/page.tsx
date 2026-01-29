'use client'; // This tells Next.js this is a Client Component (interactive)

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [status, setStatus] = useState('Checking connection...');
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to fetch the dummy customer we just created
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .limit(1)
          .single();

        if (error) throw error;

        setStatus('✅ Connection Successful!');
        setCustomer(data);
      } catch (err: any) {
        setStatus('❌ Connection Failed: ' + err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-blue-900 mb-6">TAILOR MASTER AI</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">System Check</h2>
        
        <p className={`font-medium mb-4 ${status.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>

        {customer && (
          <div className="bg-gray-100 p-4 rounded text-sm text-gray-800">
            <p><strong>Database Data Found:</strong></p>
            <p>Name: {customer.name}</p>
            <p>Mobile: {customer.mobile}</p>
            <p>Gender: {customer.gender}</p>
          </div>
        )}
      </div>
    </div>
  );
}
