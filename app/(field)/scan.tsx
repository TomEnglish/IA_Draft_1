import { ScanScreenContent } from '@/components/screens/ScanScreen';

export default function ScanScreen() {
  return (
    <ScanScreenContent
      materialDetailRoute="/(field)/material-detail"
      receivingRoute="/(field)/receiving"
    />
  );
}
