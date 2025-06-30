import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Clock, User, Calendar } from 'lucide-react';
import { User as UserType, TicketType } from '../../../types';
import { rolePermissions, ticketTypeLabels } from '../../../data/mockData';
import { fetchSLAConfig, SLAConfig } from '../../../services/slaService';
import { supabase } from '../../../lib/supabaseClient'; // your Supabase client instance
import { v4 as uuidv4 } from 'uuid';

interface CreateTicketModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: any) => void;
  onTicketCreated: () => void;
}
interface Client {
  id: any;
  full_name: any;
  job_role_preferences: any;
  careerassociatemanagerid: {
    id: any;
    name: any;
  }[];
}


export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  user,
  isOpen,
  onClose,
  onTicketCreated,
  onSubmit
}) => {
  // console.log(user);
  const [clients, setClients] = useState<any[]>([]);
  const [ticketType, setTicketType] = useState<TicketType | ''>('');
  const [clientId, setClientId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('');
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [slaConfigs, setSlaConfigs] = useState<SLAConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const permissions = rolePermissions[user.role];
  const allowedTicketTypes = permissions.canCreateTickets;

  useEffect(() => {
    const loadData = async () => {
      try {
        const slaConfig = await fetchSLAConfig()
        setSlaConfigs(slaConfig)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, job_role_preferences');
      // console.log(data);
      if (error) {
        console.error('Failed to fetch clients:', error);
      } else {
        setClients(data || []);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const fetchClientsdata = async () => {
      if (!clientId) return;
      const { data, error } = await supabase
        .from('clients')
        .select(`id,
           full_name, 
           job_role_preferences,
          careerassociatemanagerid:careerassociatemanagerid (
    id,
    name
  )`)
        .eq('id', clientId)
        .single(); // Since you're fetching only one row;

      if (error) {
        console.error('Error fetching selected client:', error);
      } else {
        setSelectedClient(data); // You can create a state like const [selectedClient, setSelectedClient] = useState(null)
      }
    };

    fetchClientsdata();
  }, [clientId]);

  if (!isOpen) return null;

  const handleTicketTypeChange = (type: TicketType) => {
    setTicketType(type);
    setTitle(getDefaultTitle(type));
    setMetadata({});
  };

  const getDefaultTitle = (type: TicketType): string => {
    const titles: Record<TicketType, string> = {
      volume_shortfall: 'Volume Shortfall - Applications below expectation',
      high_rejections: 'High Rejection Rate - Client feedback needed',
      no_interviews: 'No Interview Calls - Client concern',
      profile_data_issue: 'Profile Data Correction Required',
      credential_issue: 'Client Credential Access Problem',
      bulk_complaints: 'Multiple Client Complaints',
      early_application_request: 'Client Requests Faster Processing',
      resume_update: 'Client Resume Update Required',
      job_feed_empty: 'No Jobs Available in Feed',
      system_technical_failure: 'System Technical Issue',
      am_not_responding: 'Account Manager Not Responding to New Client',
    };
    return titles[type] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreated(true);
    if (!user) {
      alert('You must be logged in to submit a ticket');
      return;
    }

    console.log("Logged in user:", user);
    console.log("User ID:", user.id);

    // Validate required fields
    if (!ticketType || !title || !description) {
      alert("Please fill in all required fields.");
      return;
    }
    const calculateDueDate = (hours: number) => {
      const now = new Date();
      now.setHours(now.getHours() + hours);
      return now.toISOString();
    };
    const now = new Date();
    const isoNow = now.toISOString();
    // Build the ticket data
    const newTicket = {
      id: uuidv4(), // optional, Supabase can auto-generate if preferred
      type: ticketType,
      title,
      description,
      clientId: clientId || null,//clientId || null,
      createdby: user.id, // assuming `user` is from auth/session/context
      priority: slaConfigs[0].priority,
      status: 'open', // new tickets are usually marked as open
      sla_hours: slaConfigs[0].hours,
      // createdat: isoNow,
      updatedAt: isoNow,
      // due_date: ticketData.due_date || isoNow,
      dueDate: calculateDueDate(slaConfigs[0].hours), // custom function
      escalation_level: 0,
      metadata: JSON.stringify(metadata), // convert JS object to JSON
      comments: JSON.stringify([]),
    };

    // Send to Supabase

    const { error: ticketError } = await supabase
      .from('tickets')
      .insert(newTicket)
      .select('id')
      .single();

    if (ticketError) {
      console.error("Supabase insert error:", ticketError);
      alert("Failed to create ticket.");
      return;
    }
    const ticketId = newTicket.id;
    if (ticketType === 'volume_shortfall') {
      const { error: vsError } = await supabase
        .from('volume_shortfall_tickets')
        .insert([{
          ticket_id: ticketId,
          expected_applications: metadata.expectedApplications,
          actual_applications: metadata.actualApplications,
          time_period: metadata.timePeriod,
          notes: description,
          forwarded_to_ca_scraping: false
        }]);

      if (vsError) {
        console.error("Failed to insert volume shortfall fields", vsError.message);
        alert("Failed to save volume shortfall-specific data.");
        return;
      }
    }
    setIsCreated(false);
    alert("Ticket created successfully!");
    onClose();
    onTicketCreated();


    // Reset form
    setTicketType('');
    setClientId('');
    setTitle('');
    setDescription('');
    setUrgency('');
    setMetadata({});
    onClose();
  };

  const renderTicketSpecificFields = () => {
    switch (ticketType) {
      case 'credential_issue':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential Issue Type
              </label>
              <select
                value={metadata.issueType || ''}
                onChange={(e) => setMetadata({ ...metadata, issueType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select issue type</option>
                <option value="password_changed">Password Changed</option>
                <option value="account_locked">Account Locked</option>
                <option value="2fa_enabled">2FA Enabled</option>
                <option value="email_access_denied">Email Access Denied</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Successful Access
              </label>
              <input
                type="datetime-local"
                value={metadata.lastAccess || ''}
                onChange={(e) => setMetadata({ ...metadata, lastAccess: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'volume_shortfall':
        return (
          <div className="space-y-4">
            <>

              {getCAMInfo()}</>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Applications
                </label>
                <input
                  type="number"
                  value={metadata.expectedApplications || ''}
                  onChange={(e) => setMetadata({ ...metadata, expectedApplications: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Applications
                </label>
                <input
                  type="number"
                  value={metadata.actualApplications || ''}
                  onChange={(e) => setMetadata({ ...metadata, actualApplications: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <input
                type="date"
                value={metadata.timePeriod || ''}
                onChange={(e) => setMetadata({ ...metadata, timePeriod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      case 'job_feed_empty':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Categories Affected
              </label>
              <div className="space-y-2">
                {['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={metadata.jobCategories?.includes(category) || false}
                      onChange={(e) => {
                        const categories = metadata.jobCategories || [];
                        if (e.target.checked) {
                          setMetadata({ ...metadata, jobCategories: [...categories, category] });
                        } else {
                          setMetadata({ ...metadata, jobCategories: categories.filter((c: string) => c !== category) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locations Affected
              </label>
              <input
                type="text"
                value={metadata.locations || ''}
                onChange={(e) => setMetadata({ ...metadata, locations: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="New York, San Francisco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Job Found Date
              </label>
              <input
                type="date"
                value={metadata.lastJobFound || ''}
                onChange={(e) => setMetadata({ ...metadata, lastJobFound: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'profile_data_issue':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incorrect Field
              </label>
              <select
                value={metadata.incorrectField || ''}
                onChange={(e) => setMetadata({ ...metadata, incorrectField: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select field</option>
                <option value="job_role">Job Role</option>
                <option value="salary_range">Salary Range</option>
                <option value="location">Location</option>
                <option value="experience_level">Experience Level</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current (Incorrect) Value
                </label>
                <input
                  type="text"
                  value={metadata.currentValue || ''}
                  onChange={(e) => setMetadata({ ...metadata, currentValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Current incorrect value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Value
                </label>
                <input
                  type="text"
                  value={metadata.correctValue || ''}
                  onChange={(e) => setMetadata({ ...metadata, correctValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Correct value"
                />
              </div>
            </div>
          </div>
        );

      case 'am_not_responding':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onboarding Date
              </label>
              <input
                type="date"
                value={metadata.onboardingDate || ''}
                onChange={(e) => setMetadata({ ...metadata, onboardingDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Account Manager
              </label>
              <input
                type="text"
                value={metadata.assignedAM || 'Naveen'}
                onChange={(e) => setMetadata({ ...metadata, assignedAM: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Account Manager Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Since Onboarding
              </label>
              <input
                type="number"
                value={metadata.daysSinceOnboarding || ''}
                onChange={(e) => setMetadata({ ...metadata, daysSinceOnboarding: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="2"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getSLAInfo = () => {
    if (!ticketType) return null;
    const sla = slaConfigs[0].ticket_type;
    return (
      <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Clock className="h-5 w-5 text-blue-600" />
        <div className="text-sm">
          <span className="font-medium text-blue-900">SLA: {slaConfigs[0].hours} hours</span>
          <span className="text-blue-700 ml-2">Priority: {slaConfigs[0].priority.toUpperCase()}</span>
        </div>
      </div>
    );
  };
  const getCAMInfo = () => {
    if (!selectedClient) return null;
    return (
      <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm">
          <span className="font-medium text-blue-900">Client : {selectedClient.full_name} has </span>
          <span className="text-blue-700 ml-2">CA Team Lead : {selectedClient.careerassociatemanagerid.name || 'Not assigned'}</span>
        </div>
      </div>
    )
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
            <p className="text-sm text-gray-600">Role: {user.name} - {user.role.replace('_', ' ').toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection - for roles that can select clients */}
          {(user.role === 'account_manager' || user.role === 'sales') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a client</option>
                {clients.map(client => (

                  <option key={client.id} value={client.id}>
                    {client.full_name} - {(client.job_role_preferences || []).join(', ')}
                  </option>

                ))}
                { }
              </select>
            </div>
          )}

          {/* Ticket Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Type
            </label>
            <select
              value={ticketType}
              onChange={(e) => handleTicketTypeChange(e.target.value as TicketType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select ticket type</option>
              {allowedTicketTypes.map(type => (
                <option key={type} value={type}>
                  {ticketTypeLabels[type]}
                </option>
              ))}
            </select>

            {/* Role-specific restrictions notice */}
            {user.role === 'career_associate' && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Career Associate ({user.name}):</strong> You can only create Credential Issue and Job Feed Empty tickets.
                </p>
              </div>
            )}

            {user.role === 'sales' && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Sales ({user.name}):</strong> You can only create AM Not Responding tickets during client onboarding.
                </p>
              </div>
            )}
          </div>

          {/* SLA Information */}
          {getSLAInfo()}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the issue..."
              required
            />
          </div>

          {/* Ticket-specific fields */}
          {renderTicketSpecificFields()}

          {/* Urgency for critical issues */}
          {ticketType && slaConfigs[0].priority === 'critical' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Justification
              </label>
              <textarea
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Explain why this issue is critical and requires immediate attention..."
                required
              />
              <div className="flex items-center space-x-2 mt-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Critical issues require immediate escalation</span>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isCreated ? ' Creating Ticket... ' : ' Create Ticket '}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};