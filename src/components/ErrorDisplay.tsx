import { StyleSheet, Text } from 'react-native';

const ErrorDisplay = ({ message }: { message?: string }) => {
  return (
    <Text style={[styles.errorText, { opacity: message ? 1 : 0 }]}>
      {message || ' '}
    </Text>
  );
};
const styles = StyleSheet.create({
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 2,
  },
});
export default ErrorDisplay;
