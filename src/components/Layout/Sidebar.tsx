import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  Users,
  FileText,
  BarChart3,
  Settings,
  UserPlus,
  Search,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { User } from '../../types';
import { rolePermissions } from '../../data/mockData';

interface SidebarProps {
  user: User;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeView, onViewChange }) => {
  const permissions = rolePermissions[user.role];
  // console.log(permissions)
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket,
      show: permissions.canViewTickets,
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      show: permissions.canViewClients,
    },
    {
      id: "pending_onboarding",
      label: "Pending Onboarding",
      icon: UserPlus,
      show: ["cro", "ceo", "coo"].includes(user.role),
    },


    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      show: permissions.canViewReports,
    },
    {
      id: 'sla-monitor',
      label: 'SLA Monitor',
      icon: Clock,
      show: ['cro', 'coo', 'ceo', 'cro_manager'].includes(user.role),
    },
    {
      id: 'escalations',
      label: 'Escalations',
      icon: AlertTriangle,
      show: ['cro', 'coo', 'ceo'].includes(user.role),
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: UserPlus,
      show: permissions.canManageUsers,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      show: user.role === 'system_admin',
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6">
        <div className="space-y-1">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 mt-auto">
        <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
        <div className="space-y-2">
          {permissions.canCreateTickets.length > 0 && (
            <button
              onClick={() => onViewChange('create-ticket')}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Ticket className="h-4 w-4" />
              <span>Create Ticket</span>
            </button>
          )}

          {permissions.canViewReports && (
            <button
              onClick={() => onViewChange('analytics')}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};