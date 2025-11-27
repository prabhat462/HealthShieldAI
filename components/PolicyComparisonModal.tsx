import React, { useState } from 'react';
import { DriveFile, ComparisonResult } from '../types';

interface PolicyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DriveFile[];
}

const PolicyComparisonModal: React.FC<PolicyComparisonModalProps> = ({ isOpen, onClose, files }) => {
  const [selectedFile1, setSelectedFile1] = useState<string>('');
  const [selectedFile2, setSelectedFile2] = useState<string>('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const policyFiles = files.filter(f => f.folder === 'insurance');

  const handleCompare = async () => {
    if (!selectedFile1 || !selectedFile2) return;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId1: selectedFile1, fileId2: selectedFile2 })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to compare policies. Please ensure both are valid PDFs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Smart Policy Comparison
                </h3>
                <button onClick={onClose} className="hover:bg-indigo-700 p-2 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy A</label>
                        <select 
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            value={selectedFile1}
                            onChange={(e) => setSelectedFile1(e.target.value)}
                        >
                            <option value="">Select a policy...</option>
                            {policyFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center justify-center pb-3">
                         <div className="bg-white p-2 rounded-full border border-gray-300 text-gray-400 font-bold">VS</div>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy B</label>
                        <select 
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            value={selectedFile2}
                            onChange={(e) => setSelectedFile2(e.target.value)}
                        >
                            <option value="">Select a policy...</option>
                            {policyFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleCompare}
                        disabled={isLoading || !selectedFile1 || !selectedFile2}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2.5 px-6 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Analyzing...' : 'Compare Plans'}
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
                {!result && !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p>Select two policies above to see AI comparison</p>
                    </div>
                )}

                {isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-indigo-600">
                        <svg className="animate-spin w-12 h-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="animate-pulse">Reading documents & extracting features...</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2">AI Summary</h4>
                            <p className="text-indigo-800 text-sm leading-relaxed">{result.summary}</p>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy A</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy B</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {result.features.map((item, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.feature}</td>
                                            <td className={`px-6 py-4 text-sm ${item.winner === 'policy1' ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-500'}`}>
                                                {item.policy1}
                                                {item.winner === 'policy1' && <span className="ml-2">✅</span>}
                                            </td>
                                            <td className={`px-6 py-4 text-sm ${item.winner === 'policy2' ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-500'}`}>
                                                {item.policy2}
                                                {item.winner === 'policy2' && <span className="ml-2">✅</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default PolicyComparisonModal;