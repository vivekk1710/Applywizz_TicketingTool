export type UserRole = 
  | 'client'
  | 'sales'
  | 'account_manager'
  | 'career_associate'
  | 'ca_manager'
  | 'resume_team'
  | 'scraping_team'
  | 'credential_resolution'
  | 'cro'
  | 'cro_manager'
  | 'coo'
  | 'ceo'
  | 'system_admin';

export type TicketType = 
  | 'volume_shortfall'
  | 'high_rejections'
  | 'no_interviews'
  | 'profile_data_issue'
  | 'credential_issue'
  | 'bulk_complaints'
  | 'early_application_request'
  | 'resume_update'
  | 'job_feed_empty'
  | 'system_technical_failure'
  | 'am_not_responding';

export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'escalated' | 'closed'|'forwarded';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  fullName: string;
  personalEmail: string;
  whatsappNumber: string;
  callablePhone: string;
  companyEmail: string;
  jobRolePreferences: string[];
  salaryRange: string;
  locationPreferences: string[];
  workAuthDetails: string;
  accountManagerId: string;
  onboardedBy: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  type: TicketType;
  title: string;
  description: string;
  clientId: string;
  createdBy: string;
  assignedTo: string[];
  priority: TicketPriority;
  status: TicketStatus;
  slaHours: number;
  createdAt: Date;
  updatedAt: Date; 
  dueDate: Date;
  escalationLevel: number;
  metadata: Record<string, any>;
  comments: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface SLAConfig {
  [key in TicketType]: {
    priority: TicketPriority;
    hours: number;
  };
}

export interface RolePermissions {
  canCreateTickets: TicketType[];
  canViewTickets: boolean;
  canEditTickets: boolean;
  canResolveTickets: boolean;
  canEscalateTickets: boolean;
  canViewClients: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canOnboardClients: boolean;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  slaBreaches: number;
  avgResolutionTime: number;
  criticalTickets: number;
}