// Haptic feedback utility using navigator.vibrate

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'warning' | 'success') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'heavy':
        navigator.vibrate(60);
        break;
      case 'warning':
        navigator.vibrate([40, 50, 40]);
        break;
      case 'success':
        navigator.vibrate([25, 40, 60]);
        break;
    }
  } catch (e) {
    // Vibration may be restricted by permissions or unsupported
  }
};
