import api from './api';
import { ITicket, ITicketProposal, IAutoGenerateParams } from '@/types/ticket.types';

export const ticketService = {
  getMyTickets: (filters?: {
    status?: string;
    sort?: 'newest' | 'oldest';
    minLegs?: number;
    maxLegs?: number;
    minAvg?: number;
    maxAvg?: number;
  }) =>
    api.get<ITicket[]>('/tickets', { params: filters }),

  getById: (id: string) =>
    api.get<ITicket>(`/tickets/${id}`),

  resolveTicket: (id: string) =>
    api.post<ITicket>(`/tickets/${id}/resolve`),

  create: (data: Partial<ITicket>) =>
    api.post<ITicket>('/tickets', data),

  delete: (id: string) =>
    api.delete(`/tickets/${id}`),

  autoGenerate: (params: IAutoGenerateParams) =>
    api.post<ITicketProposal[]>('/tickets/auto-generate', params),

  confirmTickets: (proposals: ITicketProposal[]) =>
    api.post<ITicket[]>('/tickets/auto-generate/confirm', { proposals }),

  // Backend returns { proposals, parsedParams } after unwrap
  ask: (query: string) =>
    api.post<{ proposals: ITicketProposal[]; parsedParams: IAutoGenerateParams }>('/tickets/ask', { query }),
};
