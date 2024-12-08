import React, { useState } from 'react';
import { FolderPlus, Trash } from 'lucide-react';
import { useStore } from '../store/useStore';

const Collections: React.FC = () => {
  const { collections, createCollection, removeFromCollection } = useStore();
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName('');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Collections</h2>
      
      <form onSubmit={handleCreateCollection} className="flex gap-2">
        <input
          type="text"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          placeholder="New collection name..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FolderPlus className="w-4 h-4" />
          Create
        </button>
      </form>

      <div className="space-y-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{collection.name}</h3>
              <span className="text-sm text-gray-500">
                {collection.cards.length} cards
              </span>
            </div>
            
            <div className="space-y-2">
              {collection.cards.map((card) => (
                <div
                  key={card.id}
                  className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{card.name}</p>
                    <p className="text-sm text-gray-600">
                      {card.setName} - #{card.number}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCollection(collection.id, card.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collections;