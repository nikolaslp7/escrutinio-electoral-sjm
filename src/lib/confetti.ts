import confetti from 'canvas-confetti';

export const triggerConfettiCelebration = () => {
  if (typeof window === 'undefined') return;

  try {
    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.8 },
      colors: ['#003399', '#E51C24', '#F59E0B', '#10B981'],
    });

    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.8 },
      colors: ['#003399', '#E51C24', '#F59E0B', '#10B981'],
    });
  } catch {
    // Ignore in case canvas is unsupported
  }
};
