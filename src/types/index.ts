// User Types
export type UserRole = 'client' | 'lawyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  availability?: string;
  paymentInfo?: string;
  privacy?: {
    showProfile: boolean;
    shareData: boolean;
  };
}

export interface ClientUser extends User {
  role: 'client';
}

export interface LawyerUser extends User {
  role: 'lawyer';
  specialization?: string;
  license?: string;
  firm?: string;
  approved?: boolean;
}

// Case Types
export type CaseStatus = 'open' | 'in_review' | 'closed';

export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  clientId: string;
  lawyerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseUpdate {
  id: string;
  caseId: string;
  message: string;
  createdAt: string;
  createdBy: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  caseId?: string;
  clientId: string;
  lawyerId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

// Document Types
export interface Document {
  id: string;
  name: string;
  caseId?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileType: string;
  fileSize: number;
  url: string;
  isShared: boolean;
}

// Message Types
export interface Message {
  id: string;
  caseId: string;
  senderId: string;
  content: string;
  createdAt: string;
  attachments?: Document[];
  isRead: boolean;
}

// Invoice Types
export interface Invoice {
  id: string;
  caseId: string;
  clientId: string;
  lawyerId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
  description?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'appointment' | 'document' | 'case' | 'invoice';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}