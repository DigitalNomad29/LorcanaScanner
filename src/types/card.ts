export interface CardData {
  id: number;
  name: string;
  type: string;
  rulesText: string;
  imageUrl: string;
  prices: {
    market: number;
    low: number;
    foilMarket: number;
    foilLow: number;
  };
  features: number[]; // Image features for matching
}

export interface Card {
  id: string;
  name: string;
  setName: string;
  number: string;
  price?: {
    market: number;
    low: number;
    mid: number;
    high: number;
  };
  scannedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}