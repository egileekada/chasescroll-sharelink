import { IEventTicket, IEventType, IProductTypeData } from '@/models/Event';
import { atom } from 'jotai';

export const activeTicketAtom = atom<IProductTypeData | null>(null);
export const activeEventAtom = atom<IEventType | null>(null);