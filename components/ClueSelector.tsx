'use client';

import { useState } from 'react';

type RouteType = 'domestic' | 'international' | 'unknown';
type Duration = 'short' | 'long' | 'unknown';

interface ClueSelectorProps {
  routeType: RouteType;
  duration: Duration;
  durationThreshold: string;
}

export default function ClueSelector({
  routeType,
  duration,
  durationThreshold
}: ClueSelectorProps) {
  const [guesses, setGuesses] = useState('');

  return (
    <div className="space-y-6">
      {/* Route Type - Display Only */}
      <div>
        <label className="block text-lg font-semibold mb-3">🗺️ Route Type (Clue)</label>
        <div className="flex gap-4">
          <div
            className={`flex-1 py-4 rounded-xl font-medium text-center ${
              routeType === 'domestic'
                ? 'bg-blue-500 text-white'
                : routeType === 'international'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {routeType === 'domestic' && '🏠 Domestic'}
            {routeType === 'international' && '🌍 International'}
            {routeType === 'unknown' && '❓ Calculating...'}
          </div>
        </div>
      </div>

      {/* Duration - Display Only */}
      <div>
        <label className="block text-lg font-semibold mb-3">
          ⏱️ Flight Duration (Clue)
          <span className="text-sm text-gray-500 ml-2">
            (threshold: {durationThreshold})
          </span>
        </label>
        <div className="flex gap-4">
          <div
            className={`flex-1 py-4 rounded-xl font-medium text-center ${
              duration === 'short'
                ? 'bg-green-500 text-white'
                : duration === 'long'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {duration === 'short' && '⚡ Short'}
            {duration === 'long' && '🕐 Long'}
            {duration === 'unknown' && '❓ Calculating...'}
          </div>
        </div>
      </div>

      {/* Guesses - User Input */}
      <div>
        <label className="block text-lg font-semibold mb-3">✍️ Your Guess</label>
        <textarea
          value={guesses}
          onChange={(e) => setGuesses(e.target.value)}
          placeholder="Type your guess for where this plane is going/coming from..."
          className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:outline-none text-base"
        />
      </div>
    </div>
  );
}