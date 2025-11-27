import React, { useState, useRef } from 'react';
import { DriveFile, ClaimAssessmentResult } from '../types';

interface ClaimAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DriveFile[];
}

const ClaimAssessmentModal: React.FC<ClaimAssessmentModalProps> = ({ isOpen, onClose, files }) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [uploadedBill, setUploadedBill] = useState<File | null>(null);
  const [result, setResult] = useState<ClaimAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const policyFiles = files.filter(f => f.folder === 'insurance');

  const handleBillSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setUploadedBill(e.target.files[0]);
      }
  };

  const handleAssess = async () => {
    if (!selectedPolicyId || !uploadedBill) return;
    setIsLoading(true);
    setResult(null);

    // Convert Bill to Base64
    const reader = new FileReader();
    reader.readAsDataURL(uploadedBill);
    reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        try {
            const response = await fetch('/api/assess-claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    policyFileId: selectedPolicyId, 
                    billData: base64Data,
                    billMimeType: uploadedBill.type
                })
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
                    </div>

                    {/* Input: Bill */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">2. Upload Bill Image</label>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleBillSelect}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-indigo-400 transition-colors flex items-center justify-center gap-2"
                        >
                            {uploadedBill ? (
                                <span className="text-indigo-600 font-medium">{uploadedBill.name}</span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    Snap/Upload Bill
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <button 
                        onClick={handleAssess}
                        disabled={isLoading || !selectedPolicyId || !uploadedBill}
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