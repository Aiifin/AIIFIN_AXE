import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Database } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Accounting } from './components/Accounting';
import { HR } from './components/HR';
import { BusinessData, AssetType, LiabilityType } from './types';

// Mock Initial Data simulating a complex business structure
const INITIAL_DATA: BusinessData = {
  chartOfAccounts: [
    { code: '1000', name: 'Cash on Hand', type: 'Asset' },
    { code: '1100', name: 'Accounts Receivable', type: 'Asset' },
    { code: '1200', name: 'Inventory', type: 'Asset' },
    { code: '1500', name: 'Furniture & Fixtures', type: 'Asset' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability' },
    { code: '2100', name: 'Credit Card', type: 'Liability' },
    { code: '2500', name: 'Bank Loan', type: 'Liability' },
    { code: '3000', name: 'Owner Equity', type: 'Equity' },
    { code: '4000', name: 'Sales Revenue', type: 'Revenue' },
    { code: '4100', name: 'Service Revenue', type: 'Revenue' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'Expense' },
    { code: '6000', name: 'Payroll Expense', type: 'Expense' },
    { code: '6100', name: 'Rent Expense', type: 'Expense' },
    { code: '6200', name: 'Utilities', type: 'Expense' },
    { code: '6300', name: 'Software & IT', type: 'Expense' },
  ],
  assets: [
    { id: '1', name: 'Office HQ', value: 1200000, type: AssetType.FIXED, dateAcquired: '2020-01-15', depreciationRate: 2.5 },
    { id: '2', name: 'Company Fleet', value: 150000, type: AssetType.FIXED, dateAcquired: '2021-06-20', depreciationRate: 15 },
    { id: '3', name: 'Cash Reserves', value: 450000, type: AssetType.CURRENT, dateAcquired: '2023-01-01' },
    { id: '4', name: 'Software IP', value: 800000, type: AssetType.INTANGIBLE, dateAcquired: '2019-11-30' },
  ],
  liabilities: [
    { id: '1', name: 'Mortgage', amount: 950000, type: LiabilityType.LONG_TERM, dueDate: '2035-01-15', interestRate: 4.5 },
    { id: '2', name: 'Q4 Taxes', amount: 45000, type: LiabilityType.CURRENT, dueDate: '2023-12-15' },
  ],
  transactions: [
    { id: '101', date: '2023-10-01', description: 'Client Payment - Project Alpha', category: 'Sales Revenue', amount: 15000, type: 'Income' },
    { id: '102', date: '2023-10-05', description: 'Office Rent', category: 'Rent Expense', amount: 4000, type: 'Expense' },
    { id: '103', date: '2023-10-10', description: 'Consulting Services', category: 'Service Revenue', amount: 8500, type: 'Income' },
    { id: '104', date: '2023-10-15', description: 'Server Hosting Costs', category: 'Software & IT', amount: 1200, type: 'Expense' },
    { id: '105', date: '2023-10-28', description: 'Employee Payroll', category: 'Payroll Expense', amount: 12000, type: 'Expense' },
  ],
  invoices: [
    { 
      id: 'INV-2023-001', clientName: 'Acme Corp', date: '2023-11-01', dueDate: '2023-11-30', status: 'Sent', totalAmount: 5000,
      items: [{ description: 'Web Development', quantity: 1, unitPrice: 5000, total: 5000 }] 
    },
    { 
      id: 'INV-2023-002', clientName: 'Globex Inc', date: '2023-10-15', dueDate: '2023-11-15', status: 'Overdue', totalAmount: 2500,
      items: [{ description: 'Maintenance Retainer', quantity: 1, unitPrice: 2500, total: 2500 }] 
    }
  ],
  bills: [
    { id: 'BILL-001', vendorName: 'AWS Services', invoiceNumber: 'AWS-8821', date: '2023-11-01', dueDate: '2023-11-10', amount: 850.00, category: 'Software & IT', status: 'Pending' },
    { id: 'BILL-002', vendorName: 'CleanCo Facilities', invoiceNumber: 'CLN-992', date: '2023-11-05', dueDate: '2023-11-20', amount: 300.00, category: 'Utilities', status: 'Received' }
  ],
  employees: [
    { id: '1', name: 'Sarah Connor', role: 'CEO', department: 'Executive', email: 'sarah@nexus.com', startDate: '2018-05-01', status: 'Active', credentials: ['MBA', 'PMP'] },
    { id: '2', name: 'John Doe', role: 'Lead Accountant', department: 'Finance', email: 'john@nexus.com', startDate: '2020-03-12', status: 'Active', credentials: ['CPA'] },
    { id: '3', name: 'Mike Ross', role: 'General Technician', department: 'IT Support', email: 'mike@nexus.com', startDate: '2022-08-15', status: 'Active', credentials: ['CompTIA A+'] },
  ],
  candidates: [
    { id: '1', name: 'Alice Smith', applyingFor: 'Senior Frontend Engineer', stage: 'Interview' },
    { id: '2', name: 'Bob Johnson', applyingFor: 'Backend Developer', stage: 'Applied' },
    { id: '3', name: 'Charlie Davis', applyingFor: 'On-Site Technician', stage: 'Offer' },
    { id: '4', name: 'Diana Prince', applyingFor: 'Mechanical Engineer', stage: 'Applied' }
  ],
  jobProformas: [
    { 
      id: '1', 
      title: 'Senior Frontend Engineer', 
      department: 'Engineering', 
      salaryRange: '$120k-$150k',
      description: 'Lead our React dashboard team and architect scalable frontend solutions.', 
      requirements: ['5+ years React', 'TypeScript Mastery', 'State Management (Redux/Zustand)'] 
    },
    { 
      id: '2', 
      title: 'Frontend Developer', 
      department: 'Engineering', 
      salaryRange: '$80k-$110k',
      description: 'Develop user-facing features and ensure high performance of web applications.', 
      requirements: ['3+ years Experience', 'React.js', 'CSS/Tailwind', 'Responsive Design'] 
    },
    { 
      id: '3', 
      title: 'Backend Developer', 
      department: 'Engineering', 
      salaryRange: '$90k-$120k',
      description: 'Build robust server-side logic, manage databases, and design APIs.', 
      requirements: ['Node.js or Python', 'SQL & NoSQL Databases', 'REST/GraphQL APIs'] 
    },
    { 
      id: '4', 
      title: 'QA Tester', 
      department: 'Quality Assurance', 
      salaryRange: '$60k-$85k',
      description: 'Execute manual and automated tests to ensure software quality before release.', 
      requirements: ['Attention to Detail', 'Selenium/Cypress', 'JIRA', 'Regression Testing'] 
    },
    { 
      id: '5', 
      title: 'IT Technician', 
      department: 'IT Support', 
      salaryRange: '$50k-$70k',
      description: 'Provide level 1-2 support for internal employees, troubleshooting hardware and software.', 
      requirements: ['Hardware Troubleshooting', 'Networking Basics', 'Windows/MacOS Administration'] 
    },
    { 
      id: '6', 
      title: 'On-Site Technician', 
      department: 'Field Operations', 
      salaryRange: '$55k-$75k',
      description: 'Travel to client sites to install, maintain, and repair company equipment.', 
      requirements: ['Valid Driver License', 'Field Repair Experience', 'Physical Stamina', 'Client Communication'] 
    },
    { 
      id: '7', 
      title: 'Mechanical Engineer', 
      department: 'Mechanical Dept', 
      salaryRange: '$85k-$115k',
      description: 'Design, analyze, and oversee the manufacturing of mechanical systems.', 
      requirements: ['BS in Mechanical Engineering', 'CAD (SolidWorks/AutoCAD)', 'Thermodynamics', 'Prototyping'] 
    }
  ]
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default function App() {
  const [data, setData] = useState<BusinessData>(INITIAL_DATA);

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex flex-shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Database className="text-indigo-500" />
              Nexus <span className="text-slate-500 font-light">Manager</span>
            </h1>
            <p className="text-xs text-slate-500 mt-2">Access Replacement Suite</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavLink to="/accounting" icon={<FileText size={20} />} label="Accounting" />
            <NavLink to="/hr" icon={<Users size={20} />} label="Human Resources" />
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">AD</div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-slate-500">System Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="md:hidden font-bold text-slate-800">Nexus Manager</div>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-xs text-slate-400">Last Sync: Just now</span>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard data={data} />} />
              <Route path="/accounting" element={<Accounting data={data} setData={setData} />} />
              <Route path="/hr" element={<HR data={data} setData={setData} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}