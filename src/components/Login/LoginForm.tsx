import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // adjust path if needed
import { User } from '../../types';
import { roleLabels } from '../../data/mockData'; // you can keep labels

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  // ✅ State to store users
  const [users, setUsers] = useState<User[]>([]);
  // ✅ State to store selected user id
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // ✅ Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true);
      // console.log('Fetched users:', data);
      if (error) {
        console.error('Error fetching users:', error.message);
      } else {
        setUsers(data || []);
        if (data && data.length > 0) {
          setSelectedUserId(data[1].id); // default to first user
        }
      }
    };

    fetchUsers();
  }, []);

  // ✅ Login function
  const handleLogin = () => {
    const selectedUser = users.find((u) => u.id === selectedUserId);
    if (selectedUser) {
      onLogin(selectedUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">AW</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ApplyWizz</h1>
          <p className="text-gray-600">Ticketing & Operations Platform</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User Role
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {roleLabels[user.role] || user.role}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login to Dashboard
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Instructions:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Select any user role to explore the system</li>
            <li>• Each role has different permissions and views</li>
            <li>• Career Associates can only create 2 ticket types</li>
            <li>• Account Managers have full ticket access</li>
            <li>• Executives see SLA dashboards and escalations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};


// import React, { useState } from 'react';
// import { User } from '../../types';
// import { mockUsers, roleLabels } from '../../data/mockData';

// interface LoginFormProps {
//   onLogin: (user: User) => void;
// }

// // Export a functional component called LoginForm with props of type LoginFormProps
// export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
//   const [selectedUserId, setSelectedUserId] = useState<string>('2'); // Default to Account Manager

//   const handleLogin = () => {
//     const user = mockUsers.find(u => u.id === selectedUserId);
//     if (user) {
//       onLogin(user);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
//             <span className="text-white font-bold text-xl">AW</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">ApplyWizz</h1>
//           <p className="text-gray-600">Ticketing & Operations Platform</p>
//         </div>

//         <div className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select User Role
//             </label>
//             <select
//               value={selectedUserId}
//               onChange={(e) => setSelectedUserId(e.target.value)}
//               className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               {mockUsers.map(user => (
//                 <option key={user.id} value={user.id}>
//                   {user.name} - {roleLabels[user.role]}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button
//             onClick={handleLogin}
//             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
//           >
//             Login to Dashboard
//           </button>
//         </div>

//         <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//           <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Instructions:</h3>
//           <ul className="text-xs text-gray-600 space-y-1">
//             <li>• Select any user role to explore the system</li>
//             <li>• Each role has different permissions and views</li>
//             <li>• Career Associates can only create 2 ticket types</li>
//             <li>• Account Managers have full ticket access</li>
//             <li>• Executives see SLA dashboards and escalations</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };