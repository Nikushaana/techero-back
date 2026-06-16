import { Request } from 'express';

export interface RequestInfo extends Request {
  user: {
    id: number;
    role: 'admin' | 'individual_client' | 'company_client' | 'technician' | 'delivery';
  };
}
