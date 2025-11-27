import React, { useState } from 'react';
import { DriveFile, ClaimAssessmentResult, User } from '../types';

interface ClaimAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DriveFile[];
  user: User | null;
}

const ClaimAssessmentModal: React.FC<ClaimAssessmentModalProps> = ({ isOpen, onClose, files, user }) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  
  const [result, setResult] = useState<ClaimAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const policyFiles = files.filter(f => f.folder === 'insurance');
  const reportFiles = files.filter(f => f.folder === 'reports');

  const handleAssess = async () => {
    if (!selectedPolicyId || !selectedBillId || !user) return;

    setIsLoading(true);
    setResult(null);

    const payload = { 
        policyFileId: selectedPolicyId,
        billFileId: selectedBillId,
        email: user.email
    };

    try {
        const response = await fetch('/api/assess-claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setResult(data);
    } catch (e) {
        console.error(e);
        alert("Assessment failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 50) return 'text-yellow-600';
      return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-4xl h-auto max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Claim Pre-Assessor
                </h3>
                <button onClick={onClose} className="hover:bg-indigo-700 p-2 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Input: Policy */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">1. Select Policy</label>
                        <select 
                            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            value={selectedPolicyId}
                            onChange={(e) => setSelectedPolicyId(e.target.value)}
                        >
                            <option value="">Choose from Locker...</option>
                            {policyFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                         {policyFiles.length === 0 && <p className="text-xs text-red-500 mt-1">No policies found. Upload to Locker first.</p>}
                    </div>

                    {/* Input: Bill */}
                    <div>
                         <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-semibold text-gray-700">2. Select Bill / Report</label>
                        </div>
                        
                        <select 
                            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            value={selectedBillId}
                            onChange={(e) => setSelectedBillId(e.target.value)}
                        >
                            <option value="">Choose Report from Locker...</option>
                            {reportFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        {reportFiles.length === 0 && <p className="text-xs text-red-500 mt-1">No reports found. Upload to Locker first.</p>}
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <button 
                        onClick={handleAssess}
                        disabled={isLoading || !selectedPolicyId || !selectedBillId}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-3"
                    >
                        {isLoading ? 'Assessing Risk...' : 'Run Risk Analysis'}
                    </button>
                </div>

                {isLoading && (
                    <div className="bg-indigo-50 p-6 rounded-2xl text-center animate-pulse">
                        <p className="text-indigo-800 font-medium">Checking Policy Exclusions & Sub-limits...</p>
                    </div>
                )}

                {result && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Assessment Result</h4>
                                <p className="text-sm text-gray-500">Based on standard medical protocols and policy text</p>
                            </div>
                            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 ${getScoreColor(result.score)} ${getScoreBg(result.score)}`}>
                                <span className="text-xl font-extrabold">{result.score}%</span>
                                <span className="text-[10px] font-bold uppercase">{result.probability}</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 leading-relaxed mb-4">{result.reasoning}</p>
                            
                            {result.flaggedItems.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-xl">
                                    <h5 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                        Flagged Risks (Exclusions/Caps)
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1">
                                        {result.flaggedItems.map((item, idx) => (
                                            <li key={idx} className="text-sm text-red-700">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ClaimAssessmentModal;