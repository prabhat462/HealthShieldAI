import React, { useState, useEffect } from 'react';
import { User, DriveFile } from '../types';

interface DashboardProps {
  user: User;
  files: DriveFile[];
  onOpenChat: () => void;
  onOpenLocker: () => void;
  onOpenCompare: () => void;
  onOpenAssess: () => void;
  onOpenPolicy: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    user, 
    files, 
    onOpenChat, 
    onOpenLocker, 
    onOpenCompare, 
    onOpenAssess,
    onOpenPolicy 
}) => {
    
  const insuranceFiles = files.filter(f => f.folder === 'insurance');
  const recentFiles = [...files].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).slice(0, 3);
  const [claimsAnalyzed, setClaimsAnalyzed] = useState(0);

  useEffect(() => {
    if (user?.email) {
        fetch('/api/user/stats?email=' + user.email)
            .then(res => res.json())
            .then(data => {
                if(data.claimsAnalyzed !== undefined) setClaimsAnalyzed(data.claimsAnalyzed);
            })
            .catch(err => console.log("Failed to load stats", err));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="container mx-auto px-6">
        
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
                <p className="text-gray-500 mt-1">Here's what's happening with your health portfolio.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={onOpenLocker} className="bg-white text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                    Upload Document
                </button>
                <button onClick={onOpenChat} className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    Ask Advocate AI
                </button>
            </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Active Policies</p>
                    <p className="text-2xl font-bold text-gray-900">{insuranceFiles.length}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Claims Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900">{claimsAnalyzed}</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Health Score</p>
                    <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
            </div>
        </div>

        {/* Main Tools Grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            {/* Tool 1: Locker */}
            <div onClick={onOpenLocker} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Health Locker</h3>
                <p className="text-sm text-gray-500 mt-2">Secure storage for all your policies and reports.</p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                    Open Locker <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </div>

            {/* Tool 2: Advocate */}
            <div onClick={onOpenChat} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Advocate AI</h3>
                <p className="text-sm text-gray-500 mt-2">Chat with your policies. Ask about exclusions & coverages.</p>
                <div className="mt-4 flex items-center text-violet-600 text-sm font-medium">
                    Start Chat <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </div>

             {/* Tool 3: Compare */}
             <div onClick={onOpenCompare} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Compare Plans</h3>
                <p className="text-sm text-gray-500 mt-2">AI-driven side-by-side comparison of any two policies.</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    Compare Now <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </div>

            {/* Tool 4: Assess */}
            <div onClick={onOpenAssess} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Claim Assessor</h3>
                <p className="text-sm text-gray-500 mt-2">Predict claim approval probability before submitting.</p>
                <div className="mt-4 flex items-center text-red-600 text-sm font-medium">
                    Analyze Claim <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            </div>
        </div>

        {/* Recent Files Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Recent Documents</h2>
                <button onClick={onOpenLocker} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
            </div>
            {recentFiles.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {recentFiles.map(file => (
                        <div key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.type.includes('pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">{file.name}</h4>
                                    <p className="text-xs text-gray-500">{new Date(file.uploadDate).toLocaleDateString()} • {file.size}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">Synced</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-400">
                    <p>No documents uploaded yet.</p>
                    <button onClick={onOpenLocker} className="mt-2 text-indigo-600 text-sm font-medium hover:underline">Go to Locker to upload</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;