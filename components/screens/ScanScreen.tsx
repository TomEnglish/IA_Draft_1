import { useState } from 'react';
import { router } from 'expo-router';
import { QRScanner } from '@/components/scanning/QRScanner';
import { useReceivingStore } from '@/stores/receivingStore';
import { lookupMaterialByQR } from '@/lib/api/qrcodes';

interface ScanScreenProps {
  materialDetailRoute: string;
  receivingRoute: string;
}

export function ScanScreenContent({ materialDetailRoute, receivingRoute }: ScanScreenProps) {
  const { setQRCode, reset } = useReceivingStore();
  const [checking, setChecking] = useState(false);

  const handleScan = async (code: string) => {
    if (checking) return;
    setChecking(true);

    try {
      const result = await lookupMaterialByQR(code);

      if (result) {
        router.push({ pathname: materialDetailRoute as any, params: { id: result.materialId } });
      } else {
        reset();
        setQRCode(code, null);
        router.push(receivingRoute as any);
      }
    } catch {
      reset();
      setQRCode(code, null);
      router.push(receivingRoute as any);
    } finally {
      setChecking(false);
    }
  };

  return <QRScanner onScan={handleScan} />;
}
