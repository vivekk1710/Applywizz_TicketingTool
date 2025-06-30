import React, { useState } from 'react';
import { Ticket, User, TicketType, TicketStatus } from '../../../types';
import { TicketCard } from '../Shared/TicketCard';
import { Search, Filter, SortAsc } from 'lucide-react';
import { ticketTypeLabels } from '../../../data/mockData';

interface AssignedUser {
  id: string;
  name: string;
}

interface TicketListProps {
  tickets: Ticket[];
  user: User;
  assignments: Record<string, AssignedUser[]>;
  onTicketClick: (ticket: Ticket) => void;
}


// export const TicketList: React.FC<TicketListProps> = ({ tickets, user, onTicketClick }) => {
export const TicketList: React.FC<TicketListProps> = ({ tickets, user, assignments, onTicketClick }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TicketType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'due'>('created');

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || ticket.type === filterType;
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'created') {
        return new Date(b.createdat).getTime() - new Date(a.createdat).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'due') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TicketType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {Object.entries(ticketTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="forwarded">Forwarded</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'created' | 'priority' | 'due')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created">Sort by Created</option>
            <option value="priority">Sort by Priority</option>
            <option value="due">Sort by Due Date</option>
          </select>
        </div>
      </div>

      {/* Ticket Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.map(ticket => (
          <div key={ticket.id}>
            <TicketCard ticket={ticket} onClick={onTicketClick} />

            <div className="mt-1 ml-2 text-sm text-blue-700">
              Assigned To :{' '}
              {assignments[ticket.id]?.length
                ? assignments[ticket.id].map((u, i) => (
                  <span key={u.id}>
                    {u.name}
                    {i < assignments[ticket.id].length - 1 && ', '}
                  </span>
                ))
                : 'Unassigned'}
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

