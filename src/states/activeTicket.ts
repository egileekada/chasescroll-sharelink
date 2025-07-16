import { IEventTicket, IEventType, IProductTypeData } from '@/models/Event';
import { ITicketCreatedModel } from '@/models/TicketCreatedModel';
import { atom } from 'jotai';

export const activeTicketAtom = atom<IProductTypeData | null>(null);
export const activeEventAtom = atom<IEventType | null>(null);
export const ticketurchaseStepAtom = atom(1);
export const ticketCountAtom = atom(1);
export const currentUrlAtom = atom<string | null>(null);
export const createdTicketAtom = atom<ITicketCreatedModel | null>(null);
export const canPayAtom = atom<boolean>(false);
export const paystackDetailsAtom = atom<{ email: string, reference: string, amount: number } | null>(null);