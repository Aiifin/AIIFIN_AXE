import React, { useState } from 'react';
import { Asset, Liability, Transaction, AssetType, LiabilityType, BusinessData, Invoice, Bill, Account, InvoiceItem } from '../types';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, FileText, List, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, Settings, CheckCircle } from 'lucide-react';

interface AccountingProps {
  data: BusinessData;
  setData: React.Dispatch<React.SetStateAction<BusinessData>>;
}

export const Accounting: React.FC<AccountingProps> = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'receivables' | 'payables' | 'assets' | 'liabilities' | 'reports' | 'coa'>('overview');
  
  // -- FORMS STATE --

  // Transaction Form
  const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
  const [transDesc, setTransDesc] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transCategory, setTransCategory] = useState('');
  const [transType, setTransType] = useState<'Income' | 'Expense'>('Expense');

  // Invoice Form
  const [invClient, setInvClient] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDue, setInvDue] = useState('');
  const [invItems, setInvItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);

  // Bill Form
  const [billVendor, setBillVendor] = useState('');
  const [billInvNum, setBillInvNum] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [billDue, setBillDue] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState('');

  // Asset/Liability Forms
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetType, setNewAssetType] = useState<AssetType>(AssetType.CURRENT);
  const [newLiabName, setNewLiabName] = useState('');
  const [newLiabAmount, setNewLiabAmount] = useState('');
  const [newLiabType, setNewLiabType] = useState<LiabilityType>(LiabilityType.CURRENT);

  // -- ACTIONS --

  const addTransaction = (override?: Transaction) => {
    if (!override && (!transDesc || !transAmount || !transCategory)) return;
    
    const trans: Transaction = override || {
      id: Date.now().toString(),
      date: transDate,
      description: transDesc,
      amount: parseFloat(transAmount),
      category: transCategory,
      type: transType
    };
    
    setData(prev => ({ ...prev, transactions: [trans, ...prev.transactions] }));
    if(!override) {
      setTransDesc('');
      setTransAmount('');
      setTransCategory('');
    }
  };

  const createInvoice = () => {
    if (!invClient || !invDue) return;
    const total = invItems.reduce((sum, item) => sum + item.total, 0);
    const newInv: Invoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      clientName: invClient,
      date: invDate,
      dueDate: invDue,
      items: invItems,
      totalAmount: total,
      status: 'Sent'
    };
    setData(prev => ({ ...prev, invoices: [newInv, ...prev.invoices] }));
    setInvClient('');
    setInvItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const markInvoicePaid = (inv: Invoice) => {
    if (inv.status === 'Paid') return;
    
    // 1. Update Invoice Status
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => i.id === inv.id ? { ...i, status: 'Paid' } : i)
    }));

    // 2. Create Ledger Transaction (Revenue)
    addTransaction({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: `Invoice Payment: ${inv.id} - ${inv.clientName}`,
      amount: inv.totalAmount,
      category: 'Sales Revenue', // Default to sales
      type: 'Income',
      referenceId: inv.id
    });
  };

  const createBill = () => {
    if (!billVendor || !billAmount || !billCategory) return;
    const newBill: Bill = {
      id: `BILL-${Date.now().toString().slice(-6)}`,
      vendorName: billVendor,
      invoiceNumber: billInvNum,
      date: billDate,
      dueDate: billDue,
      amount: parseFloat(billAmount),
      category: billCategory,
      status: 'Received'
    };
    setData(prev => ({ ...prev, bills: [newBill, ...prev.bills] }));
    setBillVendor('');
    setBillAmount('');
    setBillInvNum('');
  };

  const payBill = (bill: Bill) => {
    if (bill.status === 'Paid') return;

    // 1. Update Bill Status
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === bill.id ? { ...b, status: 'Paid' } : b)
    }));

    // 2. Create Ledger Transaction (Expense)
    addTransaction({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: `Bill Payment: ${bill.vendorName} (${bill.invoiceNumber})`,
      amount: bill.amount,
      category: bill.category,
      type: 'Expense',
      referenceId: bill.id
    });
  };

  const addAsset = () => {
    if (!newAssetName || !newAssetValue) return;
    const asset: Asset = {
      id: Date.now().toString(),
      name: newAssetName,
      value: parseFloat(newAssetValue),
      type: newAssetType,
      dateAcquired: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({ ...prev, assets: [...prev.assets, asset] }));
    setNewAssetName('');
    setNewAssetValue('');
  };

  const addLiability = () => {
    if (!newLiabName || !newLiabAmount) return;
    const liab: Liability = {
      id: Date.now().toString(),
      name: newLiabName,
      amount: parseFloat(newLiabAmount),
      type: newLiabType,
      dueDate: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({ ...prev, liabilities: [...prev.liabilities, liab] }));
    setNewLiabName('');
    setNewLiabAmount('');
  };

  // Helper for invoice items
  const updateInvItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invItems];
    newItems[index] = { ...newItems[index], [field]: value };
    // Recalculate total
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setInvItems(newItems);
  };

  // Stats for Overview
  const totalReceivables = data.invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPayables = data.bills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="px-6 py-4 flex flex-wrap gap-4 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Overview</button>
          <button onClick={() => setActiveTab('receivables')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'receivables' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Invoices (AR)</button>
          <button onClick={() => setActiveTab('payables')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'payables' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Bills (AP)</button>
          <button onClick={() => setActiveTab('ledger')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'ledger' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Gen. Ledger</button>
          <div className="w-px h-6 bg-slate-300 mx-2 self-center hidden md:block"></div>
          <button onClick={() => setActiveTab('assets')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'assets' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Assets</button>
          <button onClick={() => setActiveTab('liabilities')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'liabilities' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Liabilities</button>
          <div className="w-px h-6 bg-slate-300 mx-2 self-center hidden md:block"></div>
          <button onClick={() => setActiveTab('reports')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Reports</button>
          <button onClick={() => setActiveTab('coa')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'coa' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>CoA</button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600"><ArrowDownLeft size={24} /></div>
                    <h3 className="text-emerald-900 font-bold text-lg">Accounts Receivable</h3>
                  </div>
                  <p className="text-3xl font-bold text-emerald-800">${totalReceivables.toLocaleString()}</p>
                  <p className="text-emerald-600 text-sm mt-1">{data.invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').length} invoices waiting for payment</p>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-full text-amber-600"><ArrowUpRight size={24} /></div>
                    <h3 className="text-amber-900 font-bold text-lg">Accounts Payable</h3>
                  </div>
                  <p className="text-3xl font-bold text-amber-800">${totalPayables.toLocaleString()}</p>
                  <p className="text-amber-600 text-sm mt-1">{data.bills.filter(b => b.status !== 'Paid').length} bills to be paid</p>
                </div>
             </div>

             <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                  <button onClick={() => setActiveTab('receivables')} className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded shadow-sm hover:bg-slate-50 text-sm font-medium">Create Invoice</button>
                  <button onClick={() => setActiveTab('payables')} className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded shadow-sm hover:bg-slate-50 text-sm font-medium">Enter Bill</button>
                  <button onClick={() => setActiveTab('ledger')} className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded shadow-sm hover:bg-slate-50 text-sm font-medium">Record Expense</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'receivables' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-sm font-bold text-indigo-700 uppercase mb-4">Create New Invoice</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Client Name</label>
                   <input type="text" value={invClient} onChange={e => setInvClient(e.target.value)} className="w-full px-3 py-2 border rounded text-sm" placeholder="e.g. Acme Corp"/>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                   <input type="date" value={invDate} onChange={e => setInvDate(e.target.value)} className="w-full px-3 py-2 border rounded text-sm"/>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label>
                   <input type="date" value={invDue} onChange={e => setInvDue(e.target.value)} className="w-full px-3 py-2 border rounded text-sm"/>
                 </div>
              </div>
              
              <div className="space-y-2 mb-4">
                 <label className="block text-xs font-medium text-slate-500">Line Items</label>
                 {invItems.map((item, idx) => (
                   <div key={idx} className="flex gap-2">
                     <input type="text" placeholder="Description" value={item.description} onChange={e => updateInvItem(idx, 'description', e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm"/>
                     <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateInvItem(idx, 'quantity', parseFloat(e.target.value))} className="w-20 px-3 py-2 border rounded text-sm"/>
                     <input type="number" placeholder="Price" value={item.unitPrice} onChange={e => updateInvItem(idx, 'unitPrice', parseFloat(e.target.value))} className="w-28 px-3 py-2 border rounded text-sm"/>
                     <div className="w-24 px-3 py-2 bg-slate-50 border rounded text-sm text-right font-medium text-slate-600">${item.total.toLocaleString()}</div>
                   </div>
                 ))}
                 <button onClick={() => setInvItems([...invItems, {description: '', quantity: 1, unitPrice: 0, total: 0}])} className="text-xs text-indigo-600 font-medium hover:underline">+ Add Line Item</button>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-lg font-bold text-slate-800">Total: ${invItems.reduce((s, i) => s + i.total, 0).toLocaleString()}</div>
                <button onClick={createInvoice} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium text-sm">Create & Send Invoice</button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
               <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                    {data.invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inv.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{inv.clientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{inv.dueDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-800">${inv.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                            inv.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}>{inv.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {inv.status !== 'Paid' && (
                             <button onClick={() => markInvoicePaid(inv)} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Mark Paid</button>
                          )}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'payables' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-sm font-bold text-rose-700 uppercase mb-4">Enter Vendor Bill</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Vendor Name</label>
                   <input type="text" value={billVendor} onChange={e => setBillVendor(e.target.value)} className="w-full px-3 py-2 border rounded text-sm"/>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Invoice #</label>
                   <input type="text" value={billInvNum} onChange={e => setBillInvNum(e.target.value)} className="w-full px-3 py-2 border rounded text-sm"/>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                   <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} className="w-full px-3 py-2 border rounded text-sm"/>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label>
                   <input type="date" value={billDue} onChange={e => setBillDue(e.target.value)} className="w-full px-3 py-2 border rounded text-sm"/>
                 </div>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                   <label className="block text-xs font-medium text-slate-500 mb-1">Expense Category (Account)</label>
                   <select value={billCategory} onChange={e => setBillCategory(e.target.value)} className="w-full px-3 py-2 border rounded text-sm">
                     <option value="">Select Account</option>
                     {data.chartOfAccounts.filter(a => a.type === 'Expense').map(acc => (
                       <option key={acc.code} value={acc.name}>{acc.code} - {acc.name}</option>
                     ))}
                   </select>
                </div>
                <button onClick={createBill} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded font-medium text-sm">Save Bill</button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
               <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bill ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                    {data.bills.map(bill => (
                      <tr key={bill.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{bill.invoiceNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{bill.vendorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{bill.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-800">${bill.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{bill.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {bill.status !== 'Paid' && (
                             <button onClick={() => payBill(bill)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Pay Now</button>
                          )}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Record Manual Journal Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                  <input type="date" value={transDate} onChange={e => setTransDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                  <input type="text" value={transDesc} onChange={e => setTransDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" placeholder="e.g. Bank Fees" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Account</label>
                  <select value={transCategory} onChange={e => setTransCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none bg-white">
                     <option value="">Select Account</option>
                     {data.chartOfAccounts.map(acc => (
                       <option key={acc.code} value={acc.name}>{acc.code} - {acc.name}</option>
                     ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                  <input type="number" value={transAmount} onChange={e => setTransAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" placeholder="0.00" />
                </div>
                <div className="flex gap-2">
                  <select value={transType} onChange={e => setTransType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none bg-white">
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                  <button onClick={() => addTransaction()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md"><PlusCircle size={20} /></button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {t.description}
                        {t.referenceId && <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-1 rounded">REF: {t.referenceId}</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{t.category}</span></td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Existing Assets Logic */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Asset Name</label>
                <input type="text" value={newAssetName} onChange={e => setNewAssetName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Value ($)</label>
                <input type="number" value={newAssetValue} onChange={e => setNewAssetValue(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                <select value={newAssetType} onChange={e => setNewAssetType(e.target.value as AssetType)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none">
                  {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={addAsset} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2">
                <PlusCircle size={16} /> Add Asset
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Depreciation %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{asset.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">${asset.value.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{asset.depreciationRate ? asset.depreciationRate + '%' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Existing Liabilities Logic */}
        {activeTab === 'liabilities' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Liability Name</label>
                <input type="text" value={newLiabName} onChange={e => setNewLiabName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Amount ($)</label>
                <input type="number" value={newLiabAmount} onChange={e => setNewLiabAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                <select value={newLiabType} onChange={e => setNewLiabType(e.target.value as LiabilityType)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none">
                  {Object.values(LiabilityType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={addLiability} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2">
                <PlusCircle size={16} /> Add Liability
              </button>
            </div>
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Interest %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.liabilities.map((liab) => (
                    <tr key={liab.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{liab.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{liab.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">${liab.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{liab.interestRate ? liab.interestRate + '%' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports with Aging */}
        {activeTab === 'reports' && (
           <div className="space-y-8">
             <div className="flex flex-col lg:flex-row gap-8">
               <div className="flex-1 bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
                 <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide mb-6 border-b pb-2">Balance Sheet</h2>
                 {/* ... Simplified BS rendering ... */}
                 <div className="flex justify-between font-bold mb-2"><span>Total Assets</span><span>${data.assets.reduce((sum, a) => sum + a.value, 0).toLocaleString()}</span></div>
                 <div className="flex justify-between font-bold"><span>Total Liabilities</span><span>${data.liabilities.reduce((sum, a) => sum + a.amount, 0).toLocaleString()}</span></div>
               </div>
               <div className="flex-1 bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
                 <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide mb-6 border-b pb-2">Income Statement</h2>
                 {/* ... Simplified PL rendering ... */}
                 <div className="flex justify-between font-bold mb-2 text-emerald-600"><span>Total Revenue</span><span>${data.transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span></div>
                 <div className="flex justify-between font-bold text-rose-600"><span>Total Expenses</span><span>${data.transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span></div>
               </div>
             </div>

             {/* New Aging Reports */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white border border-slate-200 p-6 rounded-lg">
                 <h3 className="font-bold text-slate-800 mb-4">Aged Receivables (Who owes you)</h3>
                 <div className="space-y-2">
                   {data.invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').length === 0 ? <p className="text-sm text-slate-400">No outstanding invoices.</p> :
                     data.invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').map(inv => (
                       <div key={inv.id} className="flex justify-between text-sm border-b border-slate-100 pb-1">
                         <span className={inv.status === 'Overdue' ? 'text-rose-500 font-medium' : 'text-slate-600'}>{inv.clientName} ({inv.dueDate})</span>
                         <span className="font-medium">${inv.totalAmount.toLocaleString()}</span>
                       </div>
                     ))
                   }
                 </div>
               </div>
               <div className="bg-white border border-slate-200 p-6 rounded-lg">
                 <h3 className="font-bold text-slate-800 mb-4">Aged Payables (Who you owe)</h3>
                 <div className="space-y-2">
                   {data.bills.filter(b => b.status !== 'Paid').length === 0 ? <p className="text-sm text-slate-400">No unpaid bills.</p> :
                     data.bills.filter(b => b.status !== 'Paid').map(bill => (
                       <div key={bill.id} className="flex justify-between text-sm border-b border-slate-100 pb-1">
                         <span className="text-slate-600">{bill.vendorName} (Due: {bill.dueDate})</span>
                         <span className="font-medium text-rose-600">${bill.amount.toLocaleString()}</span>
                       </div>
                     ))
                   }
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* Chart of Accounts */}
        {activeTab === 'coa' && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
               <h3 className="font-bold text-slate-700">Chart of Accounts</h3>
               <p className="text-xs text-slate-500">Standardized list of all financial accounts.</p>
             </div>
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-white">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                 {data.chartOfAccounts.sort((a,b) => a.code.localeCompare(b.code)).map(acc => (
                   <tr key={acc.code} className="hover:bg-slate-50">
                     <td className="px-6 py-3 text-sm font-mono text-slate-500">{acc.code}</td>
                     <td className="px-6 py-3 text-sm font-medium text-slate-900">{acc.name}</td>
                     <td className="px-6 py-3 text-sm text-slate-500">
                       <span className={`px-2 py-0.5 rounded text-xs ${
                         acc.type === 'Asset' ? 'bg-emerald-100 text-emerald-800' :
                         acc.type === 'Liability' ? 'bg-amber-100 text-amber-800' :
                         acc.type === 'Equity' ? 'bg-blue-100 text-blue-800' :
                         acc.type === 'Revenue' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                       }`}>{acc.type}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};