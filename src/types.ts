export interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  unit: string;
  target: number;
  weightage: number;
  achievements?: Record<string, { actual: string | number, status: string, timestamp: any }>;
}

export interface SharedTask {
  id: string;
  title: string;
  description: string;
  department: string;
  createdBy: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  designation?: string;
  phoneNumber?: string;
  salary?: string | number;
  createdAt: any;
}
