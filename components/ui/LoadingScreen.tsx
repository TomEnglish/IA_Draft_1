import { View, ActivityIndicator, Text, StyleSheet, type TextStyle } from 'react-native';
import { colors, fontSize, fontWeight, space } from '@/lib/design/tokens';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: Props) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.brandPrimary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
  text: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium as TextStyle['fontWeight'],
    color: colors.textMuted,
    marginTop: space[3],
  },
});
