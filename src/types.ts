export interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  unit: string;
  target: number;
  weightage: number;
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
  createdAt: any;
}
