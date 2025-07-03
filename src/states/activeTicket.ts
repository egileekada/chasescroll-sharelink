import { IEventTicket } from '@/models/Event';
import { atom } from 'jotai';

export const activeTicketAtom = atom<IEventTicket | null>(null);