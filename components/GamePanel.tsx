'use client';

import { Aircraft } from '@/types';
import { detectFlightPhase, getGamePrompt } from '@/lib/flightDirection';
import { calculateFlightClues } from '@/lib/flightClues';
import ClueSelector from './ClueSelector';

export default function GamePanel({
  aircraft,
  onNewRound
}: {
  aircraft: Aircraft;
  onNewRound: () => void;
}) {
  const phase = detectFlightPhase(aircraft);
  const prompt = getGamePrompt(phase);
  const clues = calculateFlightClues(aircraft);

  return (
    <div className="space-y-6">
      {/* Flight info header */}
      <div className="text-center">
        <div className="text-4xl mb-2">✈️</div>
        <h2 className="text-2xl font-bold mb-1">
          {aircraft.callsign || 'Unknown Flight'}
        </h2>
        <p className="text-gray-500">
          Altitude: {aircraft.altitude ? Math.round(aircraft.altitude) : 'N/A'}m
        </p>
      </div>

      {/* Game prompt */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-xl font-semibold text-blue-900 text-center">
          🎯 {prompt}
        </p>
      </div>

      {/* Clues */}
      <ClueSelector
        routeType={clues.routeType}
        duration={clues.duration}
        durationThreshold={clues.durationThreshold}
      />

      {/* Actions */}
      <div className="flex gap-4">
        <button
          className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg"
          onClick={onNewRound}
        >
          New Round
        </button>
        <button className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg">
          Look Up Flight
        </button>
      </div>
    </div>
  );
}