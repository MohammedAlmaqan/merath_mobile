import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastQueue: ToastMessage[] = [];
let listeners: ((messages: ToastMessage[]) => void)[] = [];

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  const id = Date.now().toString();
  const toast: ToastMessage = { id, message, type, duration };
  
  toastQueue.push(toast);
  notifyListeners();
  
  if (duration > 0) {
    setTimeout(() => {
      toastQueue = toastQueue.filter(t => t.id !== id);
      notifyListeners();
    }, duration);
  }
};

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toastQueue]));
};

export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (msgs: ToastMessage[]) => setMessages(msgs);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return messages;
};

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ message, onRemove }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (message.duration && message.duration > 0) {
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onRemove(message.id));
      }, message.duration);

      return () => clearTimeout(timer);
    }
  }, [message.duration, message.id, slideAnim, onRemove]);

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{message.message}</Text>
      </View>
    </Animated.View>
  );
};

export const ToastContainer: React.FC = () => {
  const messages = useToast();
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const handleRemove = (id: string) => {
    setRemovedIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setRemovedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const visibleMessages = messages.filter(m => !removedIds.has(m.id));

  if (visibleMessages.length === 0) return null;

  return (
    <View style={styles.toastContainer}>
      {visibleMessages.map(message => (
        <ToastItem
          key={message.id}
          message={message}
          onRemove={handleRemove}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  container: {
    marginBottom: 12,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
