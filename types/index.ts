export type RegisterType = 'RFI' | 'APR' | 'SUB' | 'VAR' | 'EOT' | 'DEF' | 'SI' | 'ACT'

export type ItemStatus =
  | 'Open' | 'Waiting Response' | 'Responded' | 'Closed'
  | 'Pending' | 'Submitted' | 'Approved' | 'Rejected'
  | 'Accepted' | 'Reviewed' | 'In Progress' | 'Done'
  | 'Issued' | 'Acknowledged' | 'Actioned' | 'Rectified'
  | 'Paid' | 'Assessed' | 'Placeholder'

export type Priority = 'High' | 'Medium' | 'Low'

export interface RegisterItem {
  id: string
  number: string
  type: RegisterType
  projectId: string
  title: string
  summary?: string
  actionRequired?: string
  responsible: string
  company?: string
  discipline: string
  issued: string
  dueDate: string
  status: ItemStatus
  priority?: Priority
  notes: string
  emailText: string
  followUp: string
  createdAt: string
  suggestedFollowUp?: string
}

export interface Project {
  id: string
  name: string
  code: string
  color: string
  createdAt: string
}

export interface ExtractedAction {
  title: string
  summary: string
  action_required: string
  responsible_party: string
  company: string
  discipline: string
  due_date: string
  register_type: RegisterType
  priority: Priority
  status: ItemStatus
  suggested_follow_up_email: string
}

export const REGISTER_TYPES: { id: RegisterType; label: string; color: string }[] = [
  { id: 'RFI', label: 'RFIs',              color: '#2a4fa8' },
  { id: 'APR', label: 'Approvals',          color: '#2e6645' },
  { id: 'SUB', label: 'Submittals',         color: '#61706b' },
  { id: 'VAR', label: 'Variations',         color: '#8a5e00' },
  { id: 'EOT', label: 'EOTs',              color: '#9e7a5e' },
  { id: 'DEF', label: 'Defects',           color: '#a83232' },
  { id: 'SI',  label: 'Site Instructions', color: '#5c3e8a' },
  { id: 'ACT', label: 'Actions',           color: '#29343a' },
]

export const STATUSES: Record<RegisterType, ItemStatus[]> = {
  RFI: ['Open', 'Waiting Response', 'Responded', 'Closed'],
  APR: ['Pending', 'Submitted', 'Approved', 'Rejected', 'Closed'],
  SUB: ['Pending', 'Submitted', 'Reviewed', 'Responded', 'Approved', 'Rejected', 'Closed'],
  VAR: ['Pending', 'Submitted', 'Approved', 'Rejected', 'Closed'],
  EOT: ['Pending', 'Submitted', 'Accepted', 'Rejected', 'Closed'],
  DEF: ['Open', 'In Progress', 'Rectified', 'Closed'],
  SI:  ['Issued', 'Acknowledged', 'Actioned', 'Closed'],
  ACT: ['Open', 'In Progress', 'Done', 'Closed'],
}

export const DISCIPLINES = [
  'Architecture', 'Structure', 'Services', 'Civil', 'Facade',
  'Fire', 'Acoustic', 'ESD', 'Contractor', 'Client',
  'Project Management', 'Cost Management', 'Other',
]

export const CLOSED_STATUSES: ItemStatus[] = [
  'Closed', 'Accepted', 'Paid', 'Approved', 'Done', 'Actioned', 'Rectified',
]

export const PROJECT_COLORS = [
  '#2a4fa8', '#2e6645', '#61706b', '#8a5e00', '#a83232', '#5c3e8a', '#9e7a5e',
]
