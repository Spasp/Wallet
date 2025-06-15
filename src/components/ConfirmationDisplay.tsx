import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TransferPayload } from '../schemas/validation';
import { Text } from 'react-native-gesture-handler';
import { formatCurrency } from '../utils/formatCurrency';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetInfo } from '@react-native-community/netinfo';
interface ConfirmationDisplayProps extends TransferPayload {
  isProcessing: boolean;
  onConfirm: () => void;
  onGoBack: () => void;
}
const ConfirmationDisplay: React.FC<ConfirmationDisplayProps> = ({
  recipientAccount,
  recipientName,
  amount,
  description,
  onConfirm,
  onGoBack,
  isProcessing,
}) => {
  const insets = useSafeAreaInsets();
  const netInfo = useNetInfo();
  const disabled = isProcessing || !netInfo?.isConnected;
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Icon name="checkmark-circle-outline" size={28} color="#007AFF" />
        <Text style={styles.title}>Confirm Your Transfer</Text>
      </View>

      <View style={styles.confirmationDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sending to</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {recipientName}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone Number</Text>
          <Text style={styles.detailValue}>{recipientAccount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {description || 'Not provided'}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.confirmAmount}>{formatCurrency(amount)}</Text>
        </View>
      </View>

      <View style={styles.confirmationButtons}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={onGoBack}
          disabled={isProcessing}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.confirmButton,
            disabled && styles.transferButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={disabled}
        >
          <Text style={styles.transferButtonText}>
            {isProcessing ? 'Sending...' : 'Confirm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: { fontSize: 20, fontWeight: '600', marginLeft: 10, color: '#000' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#000',
  },
  inputError: { borderColor: '#FF3B30' },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
    fontSize: 16,
    color: '#000',
  },
  descriptionInput: { height: 80, textAlignVertical: 'top' },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4, minHeight: 16 },
  transferButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  transferButtonDisabled: { backgroundColor: '#B0B0B0' },
  transferButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  confirmationDetails: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flexShrink: 1,
    textAlign: 'right',
    paddingLeft: 10,
  },
  confirmAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#EFEFEF',
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
});

export default ConfirmationDisplay;
