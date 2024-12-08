import React from 'react';
import { Plus, Trash } from 'lucide-react';
import { useStore } from '../store/useStore';

const ScannedList: React.FC = () => {
  const { scannedCards, collections, removeScannedCard, addToCollection } = useStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Scanned Cards</h2>
      <div className="space-y-2">
        {scannedCards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{card.name}</h3>
                <p className="text-sm text-gray-600">
                  {card.setName} - #{card.number}
                </p>
                {card.price && (
                  <div className="mt-1 text-sm">
                    <p className="text-green-600">Market: ${card.price.market}</p>
                    <p className="text-gray-600">
                      Range: ${card.price.low} - ${card.price.high}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  onChange={(e) => addToCollection(e.target.value, card.id)}
                  className="text-sm border rounded-md px-2 py-1"
                  defaultValue=""
                >
                  <option value="" disabled>Add to collection...</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeScannedCard(card.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {scannedCards.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No cards scanned yet. Use the scanner above to add cards.
          </p>
        )}
      </div>
    </div>
  );
};

export default ScannedList;