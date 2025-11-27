import React from 'react';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  id: string;
  attachmentNames?: string[];
}

export interface RoadmapItem {
  phase: string;
  title: string;
  description: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface DriveFile {
  id: string;
  name: string;
  type: string; // 'application/pdf', 'image/jpeg', etc.
  folder: 'insurance' | 'reports';
  uploadDate: string;
  size: string;
}
