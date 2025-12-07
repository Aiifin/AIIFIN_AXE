export enum AssetType {
  CURRENT = 'Current Asset',
  FIXED = 'Fixed Asset',
  INTANGIBLE = 'Intangible Asset'
}

export enum LiabilityType {
  CURRENT = 'Current Liability',
  LONG_TERM = 'Long-Term Liability'
}

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  code: string;
  name: string;
  type: AccountType;
  description?: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  type: AssetType;
  dateAcquired: string;
  depreciationRate?: number; // Annual percentage
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  type: LiabilityType;
  dueDate: string;
  interestRate?: number; // Annual percentage
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string; // Links to Account Name or Code
  amount: number;
  type: 'Income' | 'Expense';
  referenceId?: string; // Links to Invoice ID or Bill ID
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
}

export type BillStatus = 'Received' | 'Pending' | 'Paid' | 'Overdue';

export interface Bill {
  id: string;
  vendorName: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  category: string;
  status: BillStatus;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  startDate: string;
  credentials: string[];
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface Candidate {
  id: string;
  name: string;
  applyingFor: string;
  stage: 'Applied' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  resumeSummary?: string;
  matchScore?: number;
}

export interface JobProforma {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  department: string;
  salaryRange: string;
}

export interface BusinessData {
  chartOfAccounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  transactions: Transaction[];
  invoices: Invoice[]; // Accounts Receivable
  bills: Bill[];       // Accounts Payable
  employees: Employee[];
  candidates: Candidate[];
  jobProformas: JobProforma[];
}