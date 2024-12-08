import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CardRecognitionService } from '../services/cardRecognition';

const Scanner: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addScannedCard = useStore((state) => state.addScannedCard);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setIsScanning(true);
    setError(null);

    try {
      const cardRecognition = CardRecognitionService.getInstance();
      const card = await cardRecognition.recognizeCard(imageSrc);

      if (card) {
        addScannedCard(card);
      } else {
        setError('Could not recognize card. Please try again with better lighting and alignment.');
      }
    } catch (err) {
      setError('An error occurred while scanning. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, [webcamRef, addScannedCard]);

  return (
    <div className="relative w-full max-w-md mx-auto space-y-4">
      <div className="relative aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Scanning guide overlay */}
        <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 rounded-lg pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/75 text-sm text-center px-4">
              Center the card within the guide and ensure good lighting
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <button
            onClick={capture}
            disabled={isScanning}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Scan Card
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Scanner;