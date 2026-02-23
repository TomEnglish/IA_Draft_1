import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_queue';
const MAX_RETRIES = 5;

export type QueueAction =
  | { type: 'receiving'; payload: any }
  | { type: 'transfer'; payload: { materialId: string; fromLocationId: string | null; toLocationId: string; movedBy: string; reason: string } }
  | { type: 'issue'; payload: { materialId: string; jobNumber: string; quantity: number; issuedBy: string; workOrder?: string } }
  | { type: 'shipment'; payload: { materialId: string; destination: string; quantity: number; carrier?: string; trackingNumber?: string; shippedBy?: string } };

export interface QueueItem {
  id: string;
  action: QueueAction;
  createdAt: string;
  retryCount?: number;
  lastError?: string;
  deadLetter?: boolean;
}

export async function getQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addToQueue(action: QueueAction): Promise<void> {
  const queue = await getQueue();
  const item: QueueItem = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    action,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    deadLetter: false,
  };
  queue.push(item);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export async function markFailed(id: string, error: string): Promise<void> {
  const queue = await getQueue();
  const item = queue.find((i) => i.id === id);
  if (!item) return;

  const retries = (item.retryCount ?? 0) + 1;
  item.retryCount = retries;
  item.lastError = error;

  if (retries >= MAX_RETRIES) {
    item.deadLetter = true;
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function clearDeadLetters(): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((item) => !item.deadLetter);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export async function getQueueStats(): Promise<{ pending: number; deadLetters: number }> {
  const queue = await getQueue();
  let pending = 0;
  let deadLetters = 0;
  for (const item of queue) {
    if (item.deadLetter) {
      deadLetters++;
    } else {
      pending++;
    }
  }
  return { pending, deadLetters };
}

export async function getQueueLength(): Promise<number> {
  const queue = await getQueue();
  return queue.filter((item) => !item.deadLetter).length;
}
