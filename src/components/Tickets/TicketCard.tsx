import React from 'react';
import { Clock, User, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Ticket, TicketPriority } from '../../types';
// import { ticketTypeLabels } from '../../data/mockData';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const priorityColors: Record<TicketPriority, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    escalated: 'bg-red-100 text-red-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  // console.log(ticket.assignedTo);
  // const timeUntilDue = new Date(ticket.dueDate).getTime() - new Date().getTime();
  const due = format(new Date(ticket.dueDate), 'yyyy-MM-dd') ? new Date(ticket.dueDate) : null;
  const now = new Date();
  const timeUntilDue = due ? due.getTime() - now.getTime() : null;

  // const isOverdue = timeUntilDue < 0;
  // const hoursRemaining = Math.abs(Math.floor(timeUntilDue / (1000 * 60 * 60)));
  const isOverdue = timeUntilDue !== null && timeUntilDue < 0;
  const hoursRemaining =
    timeUntilDue !== null ? Math.abs(Math.floor(timeUntilDue / (1000 * 60 * 60))) : null;
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onClick(ticket)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[ticket.priority]}`}>
            {ticket.priority.toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[ticket.status]}`}>
            {ticket.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {ticket.title}
      </h3>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{ticket.type}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(ticket.createdAt), 'yyyy-MM-dd')}</span>
          </div>
        </div>

        {/* <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          {isOverdue ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          <span className="font-medium">
            {isOverdue ? `${hoursRemaining}h overdue` : `${hoursRemaining}h left`}
          </span>
        </div>
      </div> */}
        {timeUntilDue !== null ? (
          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
            {isOverdue ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isOverdue ? `${hoursRemaining}h overdue` : `${hoursRemaining}h left`}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-gray-400">
            <Clock className="h-4 w-4" />
            <span className="font-medium">No due date</span>
          </div>
        )}


        {ticket.escalationLevel > 0 && (
          <div className="mt-3 flex items-center space-x-1 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Escalation Level {ticket.escalationLevel}</span>
          </div>
        )}
      </div>
    </div>
  );
};