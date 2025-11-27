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