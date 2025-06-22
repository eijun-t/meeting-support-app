import { useState, useEffect, useCallback, useRef } from 'react';

// 型安全性のため明示的な型アサーション
interface ExtendedElectronAPI {
  setAudioOutputDevice?: (deviceId: string) => Promise<{ success: boolean; deviceId?: string; error?: string }>;
}

interface AudioOutputDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface UseAudioOutputReturn {
  devices: AudioOutputDevice[];
  selectedDevice: string;
  isLoading: boolean;
  error: string | null;
  setOutputDevice: (deviceId: string) => Promise<void>;
  refreshDevices: () => void;
  setSinkId: (element: HTMLAudioElement, deviceId?: string) => Promise<boolean>;
}

export const useAudioOutput = (): UseAudioOutputReturn => {
  const [devices, setDevices] = useState<AudioOutputDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioElementsRef = useRef<Set<HTMLAudioElement>>(new Set());

  const loadDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error('MediaDevices API is not supported');
      }

      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const outputDevices = mediaDevices.filter(device => 
        device.kind === 'audiooutput' && 
        device.deviceId && 
        device.deviceId !== 'default' && 
        device.deviceId !== ''
      );
      
      const deviceList: AudioOutputDevice[] = [
        {
          deviceId: 'default',
          label: 'システムデフォルト',
          kind: 'audiooutput'
        },
        ...outputDevices.map(device => ({
          deviceId: device.deviceId,
          label: device.label || `音声出力 ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }))
      ];

      setDevices(deviceList);

      const stored = localStorage.getItem('selectedAudioOutputDevice');
      if (stored && deviceList.some(d => d.deviceId === stored)) {
        setSelectedDevice(stored);
      }

    } catch (err) {
      console.error('[AUDIO OUTPUT] Error loading devices:', err);
      setError(err instanceof Error ? err.message : 'デバイス取得エラー');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSinkId = useCallback(async (element: HTMLAudioElement, deviceId?: string): Promise<boolean> => {
    try {
      const targetDeviceId = deviceId || selectedDevice;
      
      if (targetDeviceId === 'default') {
        return true;
      }

      if (typeof (element as HTMLMediaElement & { setSinkId?: (deviceId: string) => Promise<void> }).setSinkId === 'function') {
        await (element as HTMLMediaElement & { setSinkId: (deviceId: string) => Promise<void> }).setSinkId(targetDeviceId);
        console.log(`[AUDIO OUTPUT] setSinkId successful for device: ${targetDeviceId}`);
        return true;
      } else {
        console.warn('[AUDIO OUTPUT] setSinkId not supported in this browser');
        return false;
      }
    } catch (err) {
      console.error('[AUDIO OUTPUT] setSinkId failed:', err);
      return false;
    }
  }, [selectedDevice]);

  const setOutputDevice = useCallback(async (deviceId: string) => {
    try {
      setSelectedDevice(deviceId);
      localStorage.setItem('selectedAudioOutputDevice', deviceId);

      const electronAPI = window.electronAPI as ExtendedElectronAPI;
      if (electronAPI?.setAudioOutputDevice) {
        await electronAPI.setAudioOutputDevice(deviceId);
      }

      for (const element of audioElementsRef.current) {
        await setSinkId(element, deviceId);
      }

      console.log(`[AUDIO OUTPUT] Device changed to: ${deviceId}`);
    } catch (err) {
      console.error('[AUDIO OUTPUT] Error setting device:', err);
      setError(err instanceof Error ? err.message : 'デバイス設定エラー');
      throw err;
    }
  }, [setSinkId]);

  const refreshDevices = useCallback(() => {
    loadDevices();
  }, [loadDevices]);

  const registerAudioElement = useCallback((element: HTMLAudioElement) => {
    audioElementsRef.current.add(element);
    setSinkId(element);
    
    return () => {
      audioElementsRef.current.delete(element);
    };
  }, [setSinkId]);

  useEffect(() => {
    loadDevices();

    const handleDeviceChange = () => {
      console.log('[AUDIO OUTPUT] Device change detected, refreshing...');
      loadDevices();
    };

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [loadDevices]);

  return {
    devices,
    selectedDevice,
    isLoading,
    error,
    setOutputDevice,
    refreshDevices,
    setSinkId: setSinkId
  };
};