import React from 'react';

interface AudioSourceStatusProps {
  isRecording: boolean;
  audioSource?: string;
  audioLevel?: number;
}

const AudioSourceStatus: React.FC<AudioSourceStatusProps> = ({ 
  isRecording, 
  audioSource, 
  audioLevel 
}) => {
  if (!isRecording) return null;

  const getSourceIcon = (source?: string) => {
    if (!source) return '❓';
    
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('blackhole') || lowerSource.includes('virtual')) {
      return '🎯';
    }
    if (lowerSource.includes('screen') || lowerSource.includes('display')) {
      return '🖥️';
    }
    if (lowerSource.includes('microphone') || lowerSource.includes('mic')) {
      return '🎤';
    }
    return '🔊';
  };

  const getStatusColor = (source?: string, level?: number) => {
    if (!source) return 'bg-gray-100 border-gray-300 text-gray-700';
    
    const lowerSource = source.toLowerCase();
    const isGoodSource = lowerSource.includes('blackhole') || 
                        lowerSource.includes('virtual') ||
                        lowerSource.includes('screen') ||
                        lowerSource.includes('display');
    
    const hasGoodLevel = (level || 0) > 5;
    
    if (isGoodSource && hasGoodLevel) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (isGoodSource && !hasGoodLevel) {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
    if (!isGoodSource) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    
    return 'bg-gray-100 border-gray-300 text-gray-700';
  };

  const getStatusMessage = (source?: string, level?: number) => {
    if (!source) return '音声ソース不明';
    
    const lowerSource = source.toLowerCase();
    const isVirtual = lowerSource.includes('blackhole') || lowerSource.includes('virtual');
    const isScreen = lowerSource.includes('screen') || lowerSource.includes('display');
    const isMic = lowerSource.includes('microphone') || lowerSource.includes('mic');
    const hasGoodLevel = (level || 0) > 5;
    
    if (isVirtual) {
      return hasGoodLevel ? 'BlackHole - 正常（万能）' : 'BlackHole - 音声レベル低';
    }
    if (isScreen) {
      return hasGoodLevel ? 'システム音声 - 正常（スピーカー向け）' : 'システム音声 - 音声レベル低';
    }
    if (isMic) {
      return 'マイク音声 - システム音声を推奨';
    }
    
    return `不明なソース: ${source.slice(0, 20)}`;
  };

  return (
    <div className={`fixed top-4 right-4 px-3 py-2 rounded-lg border text-sm shadow-sm ${getStatusColor(audioSource, audioLevel)}`}>
      <div className="flex items-center space-x-2">
        <span className="text-base">{getSourceIcon(audioSource)}</span>
        <div>
          <div className="font-medium">{getStatusMessage(audioSource, audioLevel)}</div>
          {audioLevel !== undefined && (
            <div className="text-xs">
              音声レベル: {Math.round(audioLevel)}
            </div>
          )}
        </div>
        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default AudioSourceStatus;