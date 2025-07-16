import { IAddress, IProduct } from '@/models/product';
import { atom } from 'jotai'

export const activeProductAtom = atom<IProduct | null>(null);
export const activeProductQuantityAtom = atom<number>(0);
export const activeAddressAtom = atom<IAddress | null>(null);