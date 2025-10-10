import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: false
  });
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { user } = useAuth();

  // Verificar suporte a notificações
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);
      
      if (supported) {
        setPermission({
          granted: Notification.permission === 'granted',
          denied: Notification.permission === 'denied',
          default: Notification.permission === 'default'
        });
      }
    };

    checkSupport();
  }, []);

  // Registrar service worker
  useEffect(() => {
    if (isSupported && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrado:', reg);
          setRegistration(reg);
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, [isSupported]);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      setPermission({
        granted,
        denied: permission === 'denied',
        default: permission === 'default'
      });

      if (granted) {
        console.log('Permissão para notificações concedida');
        // Registrar para push notifications se disponível
        await subscribeToPush();
      } else {
        console.log('Permissão para notificações negada');
      }

      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }, [isSupported]);

  // Inscrever para push notifications
  const subscribeToPush = useCallback(async () => {
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
      });

      console.log('Push subscription:', subscription);
      
      // Enviar subscription para o backend
      if (user) {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            subscription: subscription,
            userId: user.id
          })
        });
      }
    } catch (error) {
      console.error('Erro ao inscrever para push:', error);
    }
  }, [registration, user]);

  // Enviar notificação local
  const sendNotification = useCallback((data: NotificationData) => {
    if (!permission.granted) {
      console.warn('Permissão para notificações não concedida');
      return;
    }

    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/Group 140.png',
      badge: '/Group 140.png',
      tag: data.tag || 'lumio-notification',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      data: data.data || {}
    };

    new Notification(data.title, options);
  }, [permission.granted]);

  // Enviar notificação via service worker
  const sendPushNotification = useCallback((data: NotificationData) => {
    if (!registration) {
      console.warn('Service Worker não registrado');
      return;
    }

    registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/Group 140.png',
      badge: '/Group 140.png',
      tag: data.tag || 'lumio-notification',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      data: data.data || {}
    });
  }, [registration]);

  // Testar notificação
  const testNotification = useCallback(() => {
    if (permission.granted) {
      sendNotification({
        title: 'Lumio - Teste',
        body: 'Esta é uma notificação de teste!',
        tag: 'test-notification'
      });
    } else {
      requestPermission();
    }
  }, [permission.granted, sendNotification, requestPermission]);

  return {
    isSupported,
    permission,
    registration,
    requestPermission,
    sendNotification,
    sendPushNotification,
    testNotification,
    subscribeToPush
  };
};
