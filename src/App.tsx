import React, { useState, useEffect } from 'react';
import { User, Ticket, Client, DashboardStats } from './types';
// import { mockUsers, mockTickets, mockClients } from './data/mockData';
import { mockClients } from './data/mockData';
import { LoginForm } from './components/Login/LoginForm';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardStats as DashboardStatsComponent } from './components/Dashboard/DashboardStats';
import { ExecutiveDashboard } from './components/Dashboard/ExecutiveDashboard';
import { TicketList } from './components/Tickets/TicketList';
import { CreateTicketModal } from './components/Tickets/CreateTicketModal';
import { TicketEditModal } from './components/Tickets/TicketEditModal';
import { ClientOnboardingModal } from './components/Clients/ClientOnboardingModal';
import { ClientEditModal } from './components/Clients/ClientEditModal';
import { UserManagementModal } from './components/Admin/UserManagementModal';
import { Plus, Users, FileText, BarChart3, UserPlus, Edit, Settings } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

type AssignedUser = {
  id: string;
  name: string;
};

function App() {
  const fetchData = async () => {
    // 1. Get all tickets
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .order('createdAt', { ascending: false });
    // if(ticketData)console.log(ticketData);
    if (ticketError) console.error(ticketError);

    // 2. Get all users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name');
    // if(userData) console.log(userData);
    if (userError) console.error(userError);

    // 3. Get all ticket assignments
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('ticket_assignments')
      .select('ticket_id, user_id');

    if (assignmentError) console.error(assignmentError);

    // 4. Map ticket_id → [user objects]
    // const userMap = new Map(userData.map(u => [u.id, u.name]));
    const userMap = new Map(
      (userData ?? []).map(u => [u.id, u.name])
    );

    const assignmentMap: Record<string, AssignedUser[]> = {};
    assignmentData?.forEach(({ ticket_id, user_id }) => {
      if (!assignmentMap[ticket_id]) assignmentMap[ticket_id] = [];
      // assignmentMap[ticket_id].push({ id: user_id, name: userMap.get(user_id) });
      assignmentMap[ticket_id].push({
        id: user_id,
        name: userMap.get(user_id) ?? 'Unknown'
      });

    });

    setTickets(ticketData || []);
    // setUsers(userData || []);
    setAssignments(assignmentMap);
  };
  // State to store the current user
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // State to store the tickets
  // const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // const [assignments, setAssignments] = useState<Record<string, User[]>>({});

  // State to store the clients
  const [clients, setClients] = useState<Client[]>(mockClients);
  // State to store the users
  // const [users, setUsers] = useState<User[]>(mockUsers);
  // State to store the active view
  const [activeView, setActiveView] = useState('dashboard');
  // State to store whether the create ticket modal is open
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  // State to store whether the client onboarding modal is open
  const [isClientOnboardingModalOpen, setIsClientOnboardingModalOpen] = useState(false);
  // State to store whether the user management modal is open
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  // State to store the selected ticket
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  // State to store the selected client
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  // State to store whether the ticket edit modal is open
  const [isTicketEditModalOpen, setIsTicketEditModalOpen] = useState(false);
  // State to store whether the client edit modal is open
  const [isClientEditModalOpen, setIsClientEditModalOpen] = useState(false);

  const [assignments, setAssignments] = useState<Record<string, AssignedUser[]>>({});


  useEffect(() => {
    fetchData();
  }, []);
  // assignments: Record<string, { id: string; name: string; role: string }[]>

  // Function to handle user login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // console.log('Logged in user:', user.name, 'with role:', user.role);
  };
  // console.log('Logged in user:', currentUser?.name, currentUser?.role);

  // Function to handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // Function to handle the creation of a new ticket
  // const handleCreateTicket = (ticketData: any) => {
  //   // Create a new ticket object with the given ticket data
  //   const newTicket: Ticket = {
  //     id: `t${tickets.length + 1}`, // Generate a unique id for the new ticket
  //     ...ticketData,
  //     createdBy: currentUser!.id, // Set the creator of the ticket to the current user
  //     assignedTo: getAutoAssignment(ticketData.type),
  //     status: 'open' as const, // Set the status of the ticket to 'open'
  //     escalationLevel: 0, // Set the escalation level of the ticket to 0
  //     createdAt: new Date(), // Set the creation date of the ticket to the current date
  //     updatedAt: new Date(), // Set the update date of the ticket to the current date
  //     comments: [], // Set the comments of the ticket to an empty array
  //   };

  //   // Update the tickets state with the new ticket and the existing tickets
  //   setTickets([newTicket, ...tickets]);
  // };
  const handleCreateTicket = async (ticketData: any) => {
    const newTicket = {
      ...ticketData,
      created_by: currentUser!.id,
      status: 'open',
      escalation_level: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: JSON.stringify([]),
      metadata: JSON.stringify(ticketData.metadata || {}),
    };

    const { error } = await supabase.from('tickets').insert(newTicket);

    if (error) {
      console.error('Failed to create ticket:', error);
      alert('Could not create ticket.');
    }
    else {
      await fetchData();
      setIsCreateTicketModalOpen(false);
    }
  };


  // Function to update a ticket
  const handleUpdateTicket = (ticketId: string, updateData: any) => {
    // Map through the tickets array and update the ticket with the matching id
    setTickets(tickets.map(ticket =>
      // If the ticket id matches the ticketId parameter, update the ticket with the new data
      ticket.id === ticketId
        ? { ...ticket, ...updateData, updatedAt: new Date() }
        // Otherwise, return the original ticket
        : ticket
    ));
  };

  // Function to handle the onboard of a new client
  const handleOnboardClient = (clientData: any) => {
    // Create a new client object with an id and the client data
    const newClient: Client = {
      id: `c${clients.length + 1}`,
      ...clientData,
    };

    // Update the clients state with the new client
    setClients([newClient, ...clients]);
  };

  // Function to update a client
  const handleUpdateClient = (updatedClient: Client) => {
    // Map through the clients array and update the client with the matching id
    setClients(clients.map(client =>
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  // Function to handle creating a new user
  const handleCreateUser = (userData: any) => {
    // Create a new user object with an id and the user data
    const newUser: User = {
      id: `u${users.length + 1}`,
      ...userData,
    };

    setUsers([newUser, ...users]);
  };

  // This function takes in a userId and userData and updates the user with the given userId in the users array
  
  const handleUpdateUser = (userId: string, userData: any) => {
    // Map through the users array and return a new array with the user with the given userId updated with the new userData
    setUsers(users.map(user =>
      user.id === userId ? { ...user, ...userData } : user
    ));``
  };
  // const createdByUser = users.find(u => u.id === ticket.createdBy);
  // Function to handle deleting a user
  const handleDeleteUser = (userId: string) => {
    // Confirm with the user if they want to delete the user
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Filter out the user with the given userId from the users array
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Function to get auto-assignment based on ticket type
  // const getAutoAssignment = (ticketType: string): string[] => {
  //   // Auto-assign tickets based on type
  //   const assignments: Record<string, string[]> = {
  //     volume_shortfall: ['4'], // CA Manager
  //     credential_issue: ['2'], // Account Manager
  //     job_feed_empty: ['6'], // Scraping Team
  //     resume_update: ['5'], // Resume Team
  //     profile_data_issue: ['4'], // CA Manager
  //     am_not_responding: ['7'], // CRO
  //     // Add more assignments as needed
  //   };
  //   return assignments[ticketType] || ['2']; // Default to Account Manager
  // };

  // Function to handle ticket click
  const handleTicketClick = (ticket: Ticket) => {

    console.log(ticket);
    // Set the selected ticket to the clicked ticket
    setSelectedTicket(ticket);
    // Set the isTicketEditModalOpen state to true
    setIsTicketEditModalOpen(true);
  };

  // Function to handle client edit
  const handleClientEdit = (client: Client) => {
    // Set the selected client to the client passed in as a parameter
    setSelectedClient(client);
    // Set the isClientEditModalOpen state to true
    setIsClientEditModalOpen(true);
  };

  // Function to get dashboard statistics
  const getDashboardStats = (): DashboardStats => {
    // Filter tickets by status and get the length of each array
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const escalatedTickets = tickets.filter(t => t.status === 'escalated').length;
    const criticalTickets = tickets.filter(t => t.priority === 'critical').length;
    // Filter tickets by due date and status and get the length of the array
    const slaBreaches = tickets.filter(t =>
      new Date(t.dueDate) < new Date() && t.status !== 'resolved'
    ).length;

    // Return an object containing the dashboard statistics
    return {
      totalTickets: tickets.length,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      escalatedTickets,
      criticalTickets,
      slaBreaches,
      avgResolutionTime: 18.5,
    };
  };

  const renderMainContent = () => {
    const stats = getDashboardStats();

    switch (activeView) {
      case 'dashboard':
        const isExecutive = currentUser && ['ceo', 'coo', 'cro'].includes(currentUser.role);

        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex space-x-3">
                {currentUser?.role === 'sales' && (
                  <button
                    onClick={() => setIsClientOnboardingModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Onboard Client</span>
                  </button>
                )}
                {currentUser && (
                  <button
                    onClick={() => setIsCreateTicketModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create Ticket</span>
                  </button>
                )}
              </div>
            </div>

            <DashboardStatsComponent stats={stats} userRole={currentUser?.role || ''} />

            {isExecutive ? (
              <ExecutiveDashboard user={currentUser!} tickets={tickets} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h2>
                  <div className="space-y-4">
                    {tickets.slice(0, 5).map(ticket => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                          <p className="text-sm text-gray-600">{ticket.type.replace('_', ' ')}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {ticket.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveView('tickets')}
                      className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">View All Tickets</span>
                    </button>

                    <button
                      onClick={() => setActiveView('clients')}
                      className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Manage Clients</span>
                    </button>

                    <button
                      onClick={() => setActiveView('reports')}
                      className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">View Reports</span>
                    </button>

                    {currentUser?.role === 'system_admin' && (
                      <button
                        onClick={() => setIsUserManagementModalOpen(true)}
                        className="w-full flex items-center space-x-3 p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <Settings className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-orange-900">User Management</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'tickets':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
              <button
                onClick={() => setIsCreateTicketModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Ticket</span>
              </button>
            </div>

            <TicketList
              tickets={tickets}
              user={currentUser!}
              assignments={assignments}
              onTicketClick={handleTicketClick}
            />

          </div>
        );

      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
              {currentUser?.role === 'sales' && (
                <button
                  onClick={() => setIsClientOnboardingModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Onboard Client</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Client Directory</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferences</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onboarded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map(client => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{client.fullName}</div>
                            <div className="text-sm text-gray-500">{client.personalEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.whatsappNumber}</div>
                          <div className="text-sm text-gray-500">{client.callablePhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{client.jobRolePreferences.join(', ')}</div>
                          <div className="text-sm text-gray-500">{client.salaryRange}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.createdAt.toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleClientEdit(client)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'user-management':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <button
                onClick={() => setIsUserManagementModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">System Users</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setIsUserManagementModalOpen(true)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">SLA Performance</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">On-time Resolution Rate</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Volume Trends</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold">{tickets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Week</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Growth</span>
                    <span className="font-semibold text-green-600">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Feature Coming Soon</h2>
            <p className="text-gray-600 mt-2">This feature is under development.</p>
          </div>
        );
    }
  };
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser} onLogout={handleLogout} />

      <div className="flex">
        <Sidebar
          user={currentUser}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        <main className="flex-1 p-8">
          {renderMainContent()}
        </main>
      </div>

      <CreateTicketModal
        user={currentUser}
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
        onTicketCreated={fetchData}
      />

      <TicketEditModal
        ticket={selectedTicket}
        user={currentUser}
        isOpen={isTicketEditModalOpen}
        assignments={assignments}
        onClose={() => {
          setIsTicketEditModalOpen(false);
          setSelectedTicket(null);
        }}
        onSubmit={(updateData) => {
          if (selectedTicket) {
            handleUpdateTicket(selectedTicket.id, updateData);
          }
        }}
      />

      <ClientOnboardingModal
        user={currentUser}
        isOpen={isClientOnboardingModalOpen}
        onClose={() => setIsClientOnboardingModalOpen(false)}
        onSubmit={handleOnboardClient}
      />

      <ClientEditModal
        client={selectedClient}
        isOpen={isClientEditModalOpen}
        onClose={() => {
          setIsClientEditModalOpen(false);
          setSelectedClient(null);
        }}
        onSubmit={handleUpdateClient}
      />

      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        users={users}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

export default App;