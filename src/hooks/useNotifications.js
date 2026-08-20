import { useCallback, useState } from 'react';

export function useNotifications() {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState(() => (supported ? Notification.permission : 'unsupported'));

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [supported]);

  const notify = useCallback(
    (title, options) => {
      if (!supported || permission !== 'granted') return;
      try {
        new Notification(title, options);
      } catch {
        /* some browsers restrict direct construction; safe to ignore */
      }
    },
    [supported, permission]
  );

  return { supported, permission, requestPermission, notify };
}
