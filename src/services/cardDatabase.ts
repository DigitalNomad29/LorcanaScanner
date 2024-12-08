import { openDB, IDBPDatabase } from 'idb';
import type { CardData } from '../types/card';

export class CardDatabase {
  private static instance: CardDatabase;
  private db: IDBPDatabase | null = null;

  private constructor() {}

  static getInstance(): CardDatabase {
    if (!CardDatabase.instance) {
      CardDatabase.instance = new CardDatabase();
    }
    return CardDatabase.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB('lorcana-cards', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cards')) {
          const store = db.createObjectStore('cards', { keyPath: 'id' });
          store.createIndex('features', 'features', { multiEntry: true });
        }
      },
    });
  }

  async addCard(card: CardData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('cards', card);
  }

  async getCard(id: number): Promise<CardData | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('cards', id);
  }

  async findSimilarCards(features: number[]): Promise<CardData[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const allCards = await this.db.getAll('cards');
    
    // Calculate similarity scores using cosine similarity
    const scores = allCards.map(card => ({
      card,
      similarity: this.cosineSimilarity(features, card.features),
    }));
    
    // Sort by similarity and return top matches
    return scores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(score => score.card);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}