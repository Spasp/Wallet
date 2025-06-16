import React, {
  forwardRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import Slider from '@react-native-community/slider';
import ErrorDisplay from './ErrorDisplay';
import { useBalance } from '../hooks/useBalanceHook';
import { formatCurrency } from '../utils/formatCurrency';
import { TransferPayload, transferSchema } from '../schemas/validation';
import { transferFunds } from '../service/TransferFunds';
import ConfirmationDisplay from './ConfirmationDisplay';
import Toast from 'react-native-toast-message';

interface TransferMoneySheetProps {
  insets: EdgeInsets;
}

const TransferMoneySheet = forwardRef<
  BottomSheetModal,
  TransferMoneySheetProps
>(({ insets }, ref) => {
  const { balance, addTransaction } = useBalance();
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 500, // Duration in milliseconds
  });
  const [view, setView] = useState<'form' | 'confirmation'>('form');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState(''); // The "official" amount for validation
  const [liveAmount, setLiveAmount] = useState(''); // The live value for smooth UI
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<
    z.ZodError['formErrors']['fieldErrors'] | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countryCode, setCountryCode] = useState('30');
  const [phoneNumber, setPhoneNumber] = useState('');
  const snapPoints = useMemo(() => ['95%'], []);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const parsedAmount = parseFloat(amount);
    const dataToValidate = {
      recipientName,
      recipientAccount,
      amount: isNaN(parsedAmount) ? 0 : parsedAmount,
    };
    const result = transferSchema.safeParse(dataToValidate);
    setErrors(result.success ? null : result.error.formErrors.fieldErrors);
  }, [recipientName, recipientAccount, amount]);

  const isButtonDisabled =
    errors !== null ||
    !amount ||
    parseFloat(amount) <= 0 ||
    parseFloat(amount) > balance;

  // Transitions from the form to the confirmation view
  const handleProceedToConfirm = () => {
    if (isButtonDisabled) return;
    Keyboard.dismiss();
    setView('confirmation');
  };

  // Handles the final async transaction logic
  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
    const transferAmount = parseFloat(amount);

    try {
      const transferData: TransferPayload = {
        recipientName,
        recipientAccount,
        amount: transferAmount,
        description,
      };

      await transferFunds(transferData);
      addTransaction({
        amount: transferAmount,
        title: `To: ${recipientName}`,
        type: 'send',
      });

      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
      }
      setTimeout(
        () =>
          Toast.show({
            text1: 'Success',
            text2: 'Money transferred successfully!',
            type: 'success',
          }),
        1200,
      );
    } catch (error: any) {
      if (error?.code && error.status) {
        Alert.alert('Transfer Failed', error.message);
        return;
      }
      Alert.alert('Transfer failed', 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Resets the view to the form when the modal is closed
  const handleDismiss = () => {
    setView('form');
    // Clear the form for a fresh start next time
    setRecipientName('');
    setRecipientAccount('');
    setAmount('');
    setLiveAmount('');
    setDescription('');
    setErrors(null);
    setPhoneNumber('');
    setCountryCode('30');
  };
  const handleRecipientAccount = (code: string, number: string) => {
    const synthesizedRecipientAccount = `+${code}${number}`;
    setRecipientAccount(synthesizedRecipientAccount);
  };
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.bottomSheetBackground}
      topInset={insets.top}
      animationConfigs={animationConfigs}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContainer}
        scrollEnabled
      >
        {/* I should extract this to standalone component as well */}
        {view === 'form' ? (
          <View
            style={[styles.container, { paddingBottom: insets.bottom + 10 }]}
          >
            <View style={styles.header}>
              <Icon name="paper-plane" size={24} color="#007AFF" />
              <Text style={styles.title}>Transfer Money</Text>
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(balance)}
              </Text>
            </View>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Recipient Name *</Text>
                <BottomSheetTextInput
                  editable={!isProcessing}
                  style={[
                    styles.input,
                    errors?.recipientName && styles.inputError,
                  ]}
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Enter recipient's full name"
                  placeholderTextColor="#999999"
                  autoCapitalize="words"
                  importantForAutofill="yes"
                  returnKeyType="next"
                  submitBehavior="blurAndSubmit"
                />
                <ErrorDisplay message={errors?.recipientName?.[0]} />
              </View>

              <View>
                <Text style={styles.label}>Phone Number *</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.currencySymbol}>+</Text>
                    <BottomSheetTextInput
                      style={[
                        styles.input,
                        errors?.recipientAccount && styles.inputError,
                        { marginRight: 10, minWidth: 40 },
                      ]}
                      value={countryCode}
                      onChangeText={newCD => {
                        const cd = newCD.replace(/[^0-9]/g, '');
                        setCountryCode(cd);
                        handleRecipientAccount(cd, phoneNumber);
                      }}
                      maxLength={2}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <BottomSheetTextInput
                    editable={!isProcessing}
                    style={[
                      styles.input,
                      errors?.recipientAccount && styles.inputError,
                      { flex: 1 },
                    ]}
                    value={phoneNumber}
                    inputMode="tel"
                    keyboardType="phone-pad"
                    onChangeText={number => {
                      const strippedNumber = number.replace(/[^0-9]/g, '');

                      setPhoneNumber(strippedNumber);
                      handleRecipientAccount(countryCode, strippedNumber);
                    }}
                    placeholder="Enter phone number"
                    placeholderTextColor="#999999"
                    importantForAutofill="yes"
                    returnKeyType="next"
                    submitBehavior="blurAndSubmit"
                  />
                </View>
                <ErrorDisplay message={errors?.recipientAccount?.[0]} />
              </View>

              <View>
                <Text style={styles.label}>Amount *</Text>
                <View
                  style={[
                    styles.amountInputContainer,
                    (errors?.amount ||
                      (liveAmount && parseFloat(liveAmount) > balance)) &&
                      styles.inputError,
                  ]}
                >
                  <Text style={styles.currencySymbol}>€</Text>
                  <BottomSheetTextInput
                    editable={!isProcessing}
                    style={styles.amountInput}
                    value={liveAmount}
                    onChangeText={newAmount => {
                      setLiveAmount(newAmount);
                      setAmount(newAmount);
                    }}
                    onBlur={() => setAmount(liveAmount)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#999999"
                    returnKeyType="next"
                    submitBehavior="blurAndSubmit"
                  />
                </View>
                <ErrorDisplay
                  message={
                    errors?.amount?.[0] ||
                    (liveAmount && parseFloat(liveAmount) > balance
                      ? 'Amount exceeds available balance'
                      : undefined)
                  }
                />
              </View>

              {!keyboardVisible && ( //hiding slider when keyboard visible to prevent ui glitches
                <View style={styles.sliderWrapper}>
                  <Slider
                    minimumTrackTintColor={'#007AFF'}
                    maximumTrackTintColor="grey"
                    thumbTintColor={'#007AFF'}
                    onResponderGrant={() => true}
                    disabled={isProcessing}
                    value={parseFloat(liveAmount) || 0}
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={Math.floor(balance)}
                    step={1}
                    onValueChange={value =>
                      setLiveAmount(Math.round(value).toString())
                    }
                    onSlidingComplete={value =>
                      setAmount(Math.round(value).toString())
                    }
                  />
                  <View style={styles.sliderMaxMinWrapper}>
                    <Text style={styles.balanceLabel}>0 €</Text>
                    <Text style={styles.balanceLabel}>
                      {Math.floor(balance)} €
                    </Text>
                  </View>
                </View>
              )}

              <View style={[{ marginBottom: 5 }]}>
                <Text style={styles.label}>Description (Optional)</Text>
                <BottomSheetTextInput
                  editable={!isProcessing}
                  numberOfLines={2}
                  maxLength={50}
                  style={[styles.input, styles.descriptionInput]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add a note for this transfer"
                  multiline
                  placeholderTextColor="#999999"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.transferButton,
                isButtonDisabled && styles.transferButtonDisabled,
              ]}
              onPress={handleProceedToConfirm}
              disabled={isButtonDisabled}
            >
              <Text style={styles.transferButtonText}>Review Transfer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ConfirmationDisplay
            amount={parseFloat(amount)}
            recipientAccount={recipientAccount}
            recipientName={recipientName}
            isProcessing={isProcessing}
            description={description}
            onConfirm={handleConfirmTransfer}
            onGoBack={() => setView('form')}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomSheetBackground: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  indicator: { backgroundColor: '#E0E0E0', width: 40, height: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: { fontSize: 20, fontWeight: '600', marginLeft: 10, color: '#000' },
  balanceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, color: '#666' },
  balanceAmount: { fontSize: 24, fontWeight: '700', color: '#007AFF' },
  form: { flex: 1 },
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
  sliderWrapper: { marginBottom: 5 },
  slider: { height: 40 },
  sliderMaxMinWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Confirmation View Styles
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
    flexShrink: 1, // Allow text to shrink if needed
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

export default TransferMoneySheet;
