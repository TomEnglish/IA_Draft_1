import { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, type TextStyle } from 'react-native';
import { Button } from './Button';
import { colors, space, fontSize, fontWeight } from '@/lib/design/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} accessibilityRole="alert">
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <Button title="Try Again" onPress={this.handleReset} style={styles.button} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[6],
    backgroundColor: colors.canvas,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as TextStyle['fontWeight'],
    color: colors.textPrimary,
    marginBottom: space[2],
  },
  message: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: space[6],
  },
  button: {
    paddingHorizontal: space[8],
  },
});
