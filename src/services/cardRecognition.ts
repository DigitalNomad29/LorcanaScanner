import { createWorker, createScheduler } from 'tesseract.js';
import { OpenCVLoader } from './opencvLoader';
import { CardDatabase } from './cardDatabase';
import type { Card, CardData } from '../types/card';

export class CardRecognitionService {
  private static instance: CardRecognitionService;
  private scheduler: Tesseract.Scheduler;
  private cardDb: CardDatabase;
  private isInitialized = false;
  private opencvLoader: OpenCVLoader;

  private constructor() {
    this.scheduler = createScheduler();
    this.cardDb = CardDatabase.getInstance();
    this.opencvLoader = OpenCVLoader.getInstance();
  }

  static getInstance(): CardRecognitionService {
    if (!CardRecognitionService.instance) {
      CardRecognitionService.instance = new CardRecognitionService();
    }
    return CardRecognitionService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize OpenCV.js
    await this.opencvLoader.load();

    const worker1 = await createWorker('eng');
    const worker2 = await createWorker('eng');
    
    await this.scheduler.addWorker(worker1);
    await this.scheduler.addWorker(worker2);
    
    await this.cardDb.initialize();
    
    this.isInitialized = true;
  }

  private async extractImageFeatures(imageSrc: string): Promise<number[]> {
    const cv = this.opencvLoader.getCV();
    
    // Convert base64 to image data
    const img = await createImageBitmap(await fetch(imageSrc));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 300;
    canvas.height = 400;
    ctx.drawImage(img, 0, 0, 300, 400);
    
    const imageData = ctx.getImageData(0, 0, 300, 400);
    
    // Convert to OpenCV matrix
    const mat = cv.matFromImageData(imageData);
    
    // Extract SIFT features
    const sift = new cv.SIFT();
    const keypoints = new cv.KeyPoints();
    const descriptors = new cv.Mat();
    sift.detect(mat, keypoints);
    sift.compute(mat, keypoints, descriptors);
    
    const features = Array.from(descriptors.data32F);

    // Clean up OpenCV objects
    mat.delete();
    keypoints.delete();
    descriptors.delete();
    sift.delete();
    
    return features;
  }

  async recognizeCard(imageSrc: string): Promise<Card | null> {
    try {
      await this.initialize();
      
      // Extract features from the scanned image
      const features = await this.extractImageFeatures(imageSrc);
      
      // Find similar cards in the database
      const matches = await this.cardDb.findSimilarCards(features);
      
      if (matches.length === 0) return null;
      
      // Use the best match
      const bestMatch = matches[0];
      
      return {
        id: crypto.randomUUID(),
        name: bestMatch.name,
        setName: 'Unknown Set', // This could be derived from the card number
        number: bestMatch.id.toString(),
        price: {
          market: bestMatch.prices.market,
          low: bestMatch.prices.low,
          mid: bestMatch.prices.market,
          high: bestMatch.prices.foilMarket,
        },
        scannedAt: new Date(),
      };
    } catch (error) {
      console.error('Card recognition failed:', error);
      return null;
    }
  }

  async cleanup(): Promise<void> {
    if (this.isInitialized) {
      await this.scheduler.terminate();
      this.isInitialized = false;
    }
  }
}