import { create } from 'zustand';
import { Card, Collection } from '../types/card';

interface Store {
  scannedCards: Card[];
  collections: Collection[];
  addScannedCard: (card: Card) => void;
  removeScannedCard: (cardId: string) => void;
  createCollection: (name: string) => void;
  addToCollection: (collectionId: string, cardId: string) => void;
  removeFromCollection: (collectionId: string, cardId: string) => void;
}

export const useStore = create<Store>((set) => ({
  scannedCards: [],
  collections: [],
  
  addScannedCard: (card) =>
    set((state) => ({ scannedCards: [...state.scannedCards, card] })),
    
  removeScannedCard: (cardId) =>
    set((state) => ({
      scannedCards: state.scannedCards.filter((card) => card.id !== cardId),
    })),
    
  createCollection: (name) =>
    set((state) => ({
      collections: [
        ...state.collections,
        {
          id: crypto.randomUUID(),
          name,
          cards: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
    
  addToCollection: (collectionId, cardId) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              cards: [
                ...collection.cards,
                state.scannedCards.find((card) => card.id === cardId)!,
              ],
              updatedAt: new Date(),
            }
          : collection
      ),
    })),
    
  removeFromCollection: (collectionId, cardId) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              cards: collection.cards.filter((card) => card.id !== cardId),
              updatedAt: new Date(),
            }
          : collection
      ),
    })),
}));