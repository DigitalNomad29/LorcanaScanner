import cv from '@techstark/opencv-js';

export class OpenCVLoader {
  private static instance: OpenCVLoader;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): OpenCVLoader {
    if (!OpenCVLoader.instance) {
      OpenCVLoader.instance = new OpenCVLoader();
    }
    return OpenCVLoader.instance;
  }

  async load(): Promise<void> {
    if (this.isLoaded) return;
    
    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve) => {
        if (cv.getBuildInformation) {
          // OpenCV.js is already loaded
          this.isLoaded = true;
          resolve();
        } else {
          // Wait for OpenCV.js to be loaded
          // @ts-ignore
          if (typeof cv !== 'undefined' && cv.onRuntimeInitialized) {
            // @ts-ignore
            cv.onRuntimeInitialized = () => {
              this.isLoaded = true;
              resolve();
            };
          } else {
            // In case OpenCV.js is not properly loaded
            throw new Error('OpenCV.js not found');
          }
        }
      });
    }

    return this.loadPromise;
  }

  getCV(): typeof cv {
    if (!this.isLoaded) {
      throw new Error('OpenCV.js not loaded. Call load() first');
    }
    return cv;
  }
}