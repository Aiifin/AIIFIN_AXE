import React, { useMemo, useState } from 'react';
import { BusinessData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, BrainCircuit, Activity } from 'lucide-react';
import { generateFinancialInsight } from '../services/gemini';

interface DashboardProps {
  data: BusinessData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const totalAssets = data.assets.reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = data.liabilities.reduce((acc, curr) => acc + curr.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const employeeCount = data.employees.filter(e => e.status === 'Active').length;
    
    const totalRevenue = data.transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = data.transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalAssets, totalLiabilities, netWorth, employeeCount, totalRevenue, totalExpenses };
  }, [data]);

  const handleAiAnalysis = async () => {
    setLoading(true);
    const result = await generateFinancialInsight(data);
    setInsight(result);
    setLoading(false);
  };

  const cashFlowData = [
    { name: 'Income', amount: stats.totalRevenue, fill: '#10b981' },
    { name: 'Expenses', amount: stats.totalExpenses, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Net Worth</p>
              <h3 className="text-2xl font-bold text-slate-800">${stats.netWorth.toLocaleString()}</h3>
            </div>
            <div className={`p-2 rounded-lg ${stats.netWorth >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <Activity size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800">${stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-800">${stats.totalExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
              <TrendingDown size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Employees</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.employeeCount}</h3>
            </div>
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <Users size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Cash Flow Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip 
                   formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
               <BrainCircuit className="text-purple-600" size={20}/>
               AI Financial Analyst
             </h3>
             <button 
                onClick={handleAiAnalysis}
                disabled={loading}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
             >
               {loading ? 'Analyzing...' : 'Generate Insight'}
             </button>
          </div>
          <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 overflow-y-auto">
            {insight ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic text-center px-4">
                Click "Generate Insight" to have Gemini analyze your balance sheet and P&L statement.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};