export type CountryCode = "SA" | "EG" | "AE" | "KW" | "QA" | "BH";
export type Currency = "SAR" | "EGP" | "AED" | "KWD" | "QAR" | "BHD";

export interface Entity {
  id: string;
  name: string;
  legalName: string;
  country: CountryCode;
  countryName: string;
  currency: Currency;
  fiscalYearStart: string;
  taxId: string;
  status: "active" | "onboarding" | "planned";
  openedAt: string;
}

export interface FxRate {
  currency: Currency;
  toSAR: number;
  effectiveDate: string;
  source: string;
  locked: boolean;
}

export type Health = "green" | "amber" | "red" | "critical";
export type RAG = "green" | "amber" | "red";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  department: string;
  entityId: string;
  scope: "group" | "entity";
  status: "active" | "suspended" | "offboarding";
  lastLogin: string;
}

export type RoleName =
  | "Group Admin"
  | "Executive Management"
  | "Group Finance"
  | "Branch Accountant"
  | "Sales Manager"
  | "Account Manager"
  | "Community Manager"
  | "Community Specialist"
  | "Operations Manager"
  | "Queue Manager"
  | "Operations Specialist"
  | "Quality"
  | "IT Admin"
  | "Viewer";

export interface RoleDef {
  name: RoleName;
  description: string;
  scope: "Group" | "Entity" | "Team";
  permissions: string[];
  canEditCOA: boolean;
  members: number;
}

export type LeadStage =
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Discovery"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

export interface Deal {
  id: string;
  name: string;
  clientId: string;
  entityId: string;
  industry: string;
  source: string;
  ownerId: string;
  value: number;
  currency: Currency;
  stage: LeadStage;
  probability: number;
  expectedClose: string;
  lastActivity: string;
  nextAction: string;
  nextActionDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  competitor?: string;
  lossReason?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  entityId: string;
  industry: string;
  accountManagerId: string;
  escalationOwnerId: string;
  status: "Prospect" | "Active" | "At Risk" | "Churned";
  since: string;
  lifetimeRevenue: number;
  currency: Currency;
  satisfaction: number;
  lastInteraction: string;
  nextAction: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  primary: boolean;
}

export type InfluencerStage =
  | "Target"
  | "Prospected"
  | "Contacted"
  | "Interested"
  | "Confirmation Requested"
  | "Confirmed"
  | "Submitted to Client"
  | "Approved"
  | "Rejected"
  | "Replacement Required"
  | "Scheduled"
  | "Visited"
  | "Posting Coverage Received"
  | "Posting Coverage Verified"
  | "Completed"
  | "No Response"
  | "Missed Visit"
  | "Missing Posting Coverage"
  | "Cancelled";

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: "Instagram" | "TikTok" | "Snapchat" | "YouTube" | "X";
  followers: number;
  country: CountryCode;
  tier: "Nano" | "Micro" | "Mid" | "Macro" | "Mega";
  category: string;
  rating: number;
  blacklisted: boolean;
}

export interface CampaignInfluencer {
  id: string;
  campaignId: string;
  influencerId: string;
  stage: InfluencerStage;
  visitDate?: string;
  coverageDue?: string;
  fee: number;
  currency: Currency;
  note?: string;
  history: { at: string; stage: InfluencerStage; by: string }[];
}

export interface Campaign {
  id: string;
  name: string;
  clientId: string;
  entityId: string;
  city: string;
  dealId?: string;
  ownerId: string;
  opsOwnerId: string;
  backupOwnerId: string;
  targetInfluencers: number;
  startDate: string;
  endDate: string;
  budget: number;
  currency: Currency;
  brief: string;
  postingRequirements: string;
  status: "Planning" | "Active" | "Delivery" | "Closing" | "Completed" | "On Hold";
  clientApproval: "Pending" | "Partial" | "Approved";
  nextAction: string;
  slaHours: number;
}

export type TaskStatus =
  | "Backlog"
  | "To Do"
  | "In Progress"
  | "Blocked"
  | "Pending Approval"
  | "Done"
  | "Cancelled"
  | "Postponed";

export interface Task {
  id: string;
  title: string;
  description: string;
  department: string;
  ownerId: string;
  backupId?: string;
  entityId: string;
  clientId?: string;
  campaignId?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  percent: number;
  slaHours: number;
  rag: RAG;
  deliverable: string;
}

export interface QueueItem {
  id: string;
  queue: "Onboarding" | "Coordination" | "WhatsApp" | "Visits" | "Posting Coverage" | "QA";
  title: string;
  entityId: string;
  clientId?: string;
  campaignId?: string;
  influencerId?: string;
  ownerId: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  createdAt: string;
  slaDeadline: string;
  status: "Open" | "In Progress" | "Blocked" | "Escalated" | "Done";
  nextAction: string;
}

export interface Account {
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  parent?: string;
  category: string;
  entities: string[] | "all";
  currencyBehaviour: "Local" | "Multi" | "Group";
  active: boolean;
  createdBy: string;
  approvedBy: string;
  effectiveDate: string;
}

export interface CoaRequest {
  id: string;
  code: string;
  name: string;
  type: Account["type"];
  entityId: string;
  requestedBy: string;
  requestedAt: string;
  justification: string;
  status: "Pending Review" | "Approved" | "Rejected";
  decidedBy?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  campaignId?: string;
  dealId?: string;
  entityId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paid: number;
  currency: Currency;
  status: "Draft" | "Pending Approval" | "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
  lines: { description: string; qty: number; unitPrice: number }[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  entityId: string;
  date: string;
  amount: number;
  currency: Currency;
  method: "Bank Transfer" | "Cheque" | "Cash" | "Card";
  reference: string;
}

export interface Expense {
  id: string;
  description: string;
  entityId: string;
  campaignId?: string;
  accountCode: string;
  date: string;
  amount: number;
  currency: Currency;
  status: "Draft" | "Pending Approval" | "Approved" | "Paid" | "Rejected";
  vendor: string;
}

export interface Approval {
  id: string;
  type:
    | "COA Creation"
    | "Invoice Approval"
    | "Payment Approval"
    | "Expense Approval"
    | "Proposal Approval"
    | "Campaign Change"
    | "Influencer Approval"
    | "Access Request"
    | "Finance Adjustment";
  title: string;
  requesterId: string;
  approverId: string;
  entityId: string;
  value?: number;
  currency?: Currency;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected" | "Returned";
  linkTo?: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  module: string;
  recordId: string;
  recordLabel: string;
  entityId: string;
  from?: string;
  to?: string;
}

export interface Notification {
  id: string;
  category: "CRM" | "Campaign" | "Client" | "Finance" | "Task" | "Approval" | "System";
  title: string;
  detail: string;
  at: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  read: boolean;
  link?: string;
}

export interface CorporateFile {
  id: string;
  name: string;
  kind: "folder" | "pdf" | "sheet" | "doc" | "image";
  path: string;
  entityId: string;
  clientId?: string;
  campaignId?: string;
  size: string;
  updatedAt: string;
  owner: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: "Connected" | "Not Connected" | "Needs Configuration" | "Error" | "Pending Support" | "Disabled";
  owner: string;
  lastSync?: string;
  lastError?: string;
  webhook: "Active" | "Inactive" | "Failing";
  auth: "Valid" | "Expired" | "Missing";
}

export interface SaasSeat {
  id: string;
  app: string;
  userId: string;
  corporateEmail: string;
  license: string;
  status: "Active" | "Suspended" | "Revoked" | "Pending";
  assignedAt: string;
  lastReview: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  when: string;
  ifCriteria: string;
  then: string;
  enabled: boolean;
  runs: number;
  failures: number;
  lastRun: string;
}
