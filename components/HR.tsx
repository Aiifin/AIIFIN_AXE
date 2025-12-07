import React, { useState } from 'react';
import { Employee, JobProforma, Candidate, BusinessData } from '../types';
import { Users, Briefcase, UserPlus, Sparkles, CheckCircle, Plus } from 'lucide-react';
import { generateJobDescription } from '../services/gemini';

interface HRProps {
  data: BusinessData;
  setData: React.Dispatch<React.SetStateAction<BusinessData>>;
}

export const HR: React.FC<HRProps> = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'proforma' | 'hiring'>('employees');
  const [loadingAi, setLoadingAi] = useState(false);

  // Hiring Form
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateRole, setCandidateRole] = useState('');

  // Credential Form
  const [credentialInput, setCredentialInput] = useState<{empId: string, text: string} | null>(null);

  const generateProforma = async () => {
    if (!jobTitle || !jobDept) return;
    setLoadingAi(true);
    const { description, requirements } = await generateJobDescription(jobTitle, jobDept);
    
    const newProforma: JobProforma = {
      id: Date.now().toString(),
      title: jobTitle,
      department: jobDept,
      description,
      requirements,
      salaryRange: '$50,000 - $80,000' // Placeholder default
    };

    setData(prev => ({ ...prev, jobProformas: [...prev.jobProformas, newProforma] }));
    setLoadingAi(false);
    setJobTitle('');
    setJobDept('');
  };

  const addCandidate = () => {
    if (!candidateName || !candidateRole) return;
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: candidateName,
      applyingFor: candidateRole,
      stage: 'Applied'
    };
    setData(prev => ({ ...prev, candidates: [...prev.candidates, newCandidate] }));
    setCandidateName('');
    setCandidateRole('');
  };

  const hireCandidate = (candidateId: string) => {
    const candidate = data.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Convert Candidate to Employee
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: candidate.name,
      role: candidate.applyingFor,
      department: "General", // Default
      email: `${candidate.name.toLowerCase().replace(' ', '.')}@company.com`,
      startDate: new Date().toISOString().split('T')[0],
      credentials: [],
      status: 'Active'
    };

    setData(prev => ({
      ...prev,
      employees: [...prev.employees, newEmployee],
      candidates: prev.candidates.map(c => c.id === candidateId ? { ...c, stage: 'Hired' } : c)
    }));
  };

  const addCredential = (empId: string) => {
    if (!credentialInput || credentialInput.empId !== empId || !credentialInput.text) return;
    
    setData(prev => ({
      ...prev,
      employees: prev.employees.map(e => {
        if (e.id === empId) {
          return { ...e, credentials: [...e.credentials, credentialInput.text] };
        }
        return e;
      })
    }));
    setCredentialInput(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('employees')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'employees' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={16} /> Directory
          </button>
          <button
            onClick={() => setActiveTab('proforma')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'proforma' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase size={16} /> Job Proformas (AI)
          </button>
          <button
            onClick={() => setActiveTab('hiring')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'hiring' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus size={16} /> Hiring Pipeline
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'employees' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {data.employees.map(emp => (
               <div key={emp.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                     {emp.name.charAt(0)}
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                     <p className="text-xs text-slate-500">{emp.role}</p>
                   </div>
                 </div>
                 <div className="space-y-2 text-xs text-slate-600 flex-1">
                    <p><strong>Dept:</strong> {emp.department}</p>
                    <p><strong>Email:</strong> {emp.email}</p>
                    <p><strong>Status:</strong> <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{emp.status}</span></p>
                    <div>
                      <div className="flex justify-between items-center mt-2 mb-1">
                        <strong>Credentials:</strong>
                        <button 
                          onClick={() => setCredentialInput({ empId: emp.id, text: '' })}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Add Credential"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      {credentialInput?.empId === emp.id && (
                        <div className="flex gap-1 mb-2">
                          <input 
                            type="text"
                            value={credentialInput.text}
                            onChange={(e) => setCredentialInput({ ...credentialInput, text: e.target.value })}
                            className="w-full px-2 py-1 text-xs border rounded"
                            placeholder="e.g. PhD"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addCredential(emp.id);
                              if (e.key === 'Escape') setCredentialInput(null);
                            }}
                          />
                          <button onClick={() => addCredential(emp.id)} className="text-xs bg-indigo-600 text-white px-2 rounded">OK</button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-1">
                        {emp.credentials.length > 0 ? emp.credentials.map((cred, idx) => (
                          <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 border border-slate-200">{cred}</span>
                        )) : <span className="text-slate-400 italic">None listed</span>}
                      </div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'proforma' && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
               <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                 <Sparkles size={16} /> AI Job Description Generator
               </h3>
               <div className="flex gap-4 items-end">
                 <div className="flex-1">
                   <label className="block text-xs font-medium text-purple-800 mb-1">Job Title</label>
                   <input 
                     type="text" 
                     value={jobTitle}
                     onChange={e => setJobTitle(e.target.value)}
                     className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                     placeholder="e.g. Senior Frontend Engineer"
                   />
                 </div>
                 <div className="flex-1">
                   <label className="block text-xs font-medium text-purple-800 mb-1">Department</label>
                   <input 
                     type="text" 
                     value={jobDept}
                     onChange={e => setJobDept(e.target.value)}
                     className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                     placeholder="e.g. Engineering"
                   />
                 </div>
                 <button 
                   onClick={generateProforma}
                   disabled={loadingAi}
                   className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                 >
                   {loadingAi ? 'Generating...' : 'Create Proforma'}
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {data.jobProformas.map(job => (
                <div key={job.id} className="border border-slate-200 rounded-lg p-6 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                       <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
                       <p className="text-sm text-slate-500">{job.department} • {job.salaryRange}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">Open Position</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Description</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {job.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hiring' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
               <div className="flex-1">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Candidate Name</label>
                 <input 
                   type="text" 
                   value={candidateName}
                   onChange={e => setCandidateName(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Applying For</label>
                 <select 
                   value={candidateRole}
                   onChange={e => setCandidateRole(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 >
                    <option value="">Select Role</option>
                    {data.jobProformas.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                 </select>
               </div>
               <button 
                 onClick={addCandidate}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
               >
                 Add Candidate
               </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Candidate</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stage</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.candidates.filter(c => c.stage !== 'Hired').map(candidate => (
                    <tr key={candidate.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{candidate.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{candidate.applyingFor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {candidate.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => hireCandidate(candidate.id)}
                          className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1 justify-end w-full"
                        >
                          <CheckCircle size={16} /> Hire
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.candidates.filter(c => c.stage !== 'Hired').length === 0 && (
                     <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No active candidates.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};