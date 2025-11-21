import { useEffect, useRef, useState } from 'react';

interface ShakeDetectionOptions {
  threshold?: number;
  timeout?: number;
  onShake?: () => void;
  enabled?: boolean;
}

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export const useShakeDetection = ({
  threshold = 15, // Minimum acceleration threshold for shake detection
  timeout = 1000, // Minimum time between shake detections
  onShake,
  enabled = true
}: ShakeDetectionOptions = {}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const lastShakeTime = useRef(0);
  const accelerationRef = useRef<AccelerometerData[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let animationFrameId: number;

    // Check if device motion is supported
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const acceleration = event.accelerationIncludingGravity;
      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;

      // Calculate the magnitude of acceleration
      const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

      // Store acceleration data
      accelerationRef.current.push({
        x,
        y,
        z,
        timestamp: Date.now()
      });

      // Keep only recent data (last 100ms)
      const now = Date.now();
      accelerationRef.current = accelerationRef.current.filter(
        data => now - data.timestamp < 100
      );

      // Check for shake pattern
      if (accelerationMagnitude > threshold) {
        const currentTime = Date.now();

        // Prevent rapid fire detection
        if (currentTime - lastShakeTime.current > timeout) {
          lastShakeTime.current = currentTime;
          setIsShaking(true);
          setShakeCount(prev => prev + 1);

          if (onShake) {
            onShake();
          }

          // Reset shaking state after a short delay
          setTimeout(() => setIsShaking(false), 500);
        }
      }
    };

    // Request permission for device motion (iOS 13+)
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion, true);
          } else {
            console.warn('Device motion permission denied');
          }
        } catch (error) {
          console.error('Error requesting device motion permission:', error);
        }
      } else {
        // Non-iOS devices or older iOS versions
        window.addEventListener('devicemotion', handleDeviceMotion, true);
      }
    };

    // Fallback for devices without motion sensors - keyboard shake simulation
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 's' && event.ctrlKey) { // Ctrl+S for shake simulation
        event.preventDefault();
        if (onShake) {
          onShake();
        }
        setIsShaking(true);
        setShakeCount(prev => prev + 1);
        setTimeout(() => setIsShaking(false), 500);
      }
    };

    // Initialize motion detection
    requestPermission();

    // Add keyboard fallback for testing
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
      window.removeEventListener('keydown', handleKeyPress);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [enabled, threshold, timeout, onShake]);

  const requestShakePermission = async (): Promise<boolean> => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting device motion permission:', error);
        return false;
      }
    }
    return true; // Non-iOS devices don't need permission
  };

  const simulateShake = () => {
    if (onShake) {
      onShake();
    }
    setIsShaking(true);
    setShakeCount(prev => prev + 1);
    setTimeout(() => setIsShaking(false), 500);
  };

  return {
    isShaking,
    shakeCount,
    requestShakePermission,
    simulateShake
  };
};