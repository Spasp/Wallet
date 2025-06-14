import React, { forwardRef, useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

// Define the shape of the form data
interface TransferData {
  recipientName: string;
  recipientAccount: string;
  amount: number;
  description: string;
}

// Define the validation schema using Zod
const transferSchema = z.object({
  recipientName: z.string().min(8, 'Recipient full name is required'),
  recipientAccount: z.string().min(5, 'A valid account is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});

interface TransferMoneySheetProps {
  balance: number;
  insets: EdgeInsets;
  onTransferComplete?: (transferData: TransferData) => void;
}

const TransferMoneySheet = forwardRef<BottomSheetModal, TransferMoneySheetProps>(
  ({ balance, onTransferComplete, insets }, ref) => {
    const [recipientName, setRecipientName] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<z.ZodError['formErrors']['fieldErrors'] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
     const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1} 
          appearsOnIndex={0}  
          opacity={0.7} 
        />
      ),
      []
    );

   
    const snapPoints = useMemo(() => ['90%'], []);

    // Validate form on input change
    useEffect(() => {
      const parsedAmount = parseFloat(amount);
      const dataToValidate = {
        recipientName,
        recipientAccount,
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
      };

      const result = transferSchema.safeParse(dataToValidate);
      console.log(result)
      setErrors(result.success ? null : result.error.formErrors.fieldErrors);
    }, [recipientName, recipientAccount, amount]);

    const isFormValid = () => {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > balance) {
        return false;
      }
      return transferSchema.safeParse({ recipientName, recipientAccount, amount: parsedAmount }).success;
    };

    // Handle transfer
    const handleTransfer = async () => {
      if (!isFormValid()) {
        Alert.alert('Error', 'Please fill all required fields and ensure the amount is valid.');
        return;
      }

      Keyboard.dismiss();
      setIsProcessing(true);
      const transferAmount = parseFloat(amount);

      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const transferData: TransferData = { recipientName, recipientAccount, amount: transferAmount, description };
        
        setRecipientName('');
        setRecipientAccount('');
        setAmount('');
        setDescription('');
        setErrors(null);

        onTransferComplete?.(transferData);
        Alert.alert('Success', 'Money transferred successfully!');
        
        // 3. Dismiss the modal on success
        (ref as any)?.current?.dismiss();
      } catch (error) {
        Alert.alert('Error', 'Transfer failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value);
    };
    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.header}>
              <Icon name="paper-plane" size={24} color="#007AFF" />
              <Text style={styles.title}>Transfer Money</Text>
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            </View>

            <View style={styles.form}>
              {/* Recipient Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Recipient Name *</Text>
                <TextInput style={[styles.input, errors?.recipientName && styles.inputError]} value={recipientName} onChangeText={setRecipientName} placeholder="Enter recipient's full name" placeholderTextColor={styles.placeHolderColor.color}/>
                {errors?.recipientName && <Text style={styles.errorText}>{errors.recipientName[0]}</Text>}
              </View>

              {/* Recipient Account */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Account Number *</Text>
                <TextInput style={[styles.input, errors?.recipientAccount && styles.inputError]} value={recipientAccount} onChangeText={setRecipientAccount} placeholder="Enter account number or email" placeholderTextColor={styles.placeHolderColor.color} />
                {errors?.recipientAccount && <Text style={styles.errorText}>{errors.recipientAccount[0]}</Text>}
              </View>

              {/* Amount */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount *</Text>
                <View style={[styles.amountInputContainer, (errors?.amount || (amount && parseFloat(amount) > balance)) && styles.inputError]}>
                  <Text style={styles.currencySymbol}>€</Text>
                  <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={styles.placeHolderColor.color} />
                </View>
                {errors?.amount && <Text style={styles.errorText}>{errors.amount[0]}</Text>}
                {amount && parseFloat(amount) > balance && <Text style={styles.errorText}>Amount exceeds available balance</Text>}
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput style={[styles.input, styles.descriptionInput]} value={description} onChangeText={setDescription} placeholder="Add a note for this transfer" multiline placeholderTextColor={styles.placeHolderColor.color} />
              </View>
            </View>

            {/* Transfer Button */}
            <TouchableOpacity style={[styles.transferButton, (!isFormValid() || isProcessing) && styles.transferButtonDisabled]} onPress={handleTransfer} disabled={!isFormValid() || isProcessing}>
              <Text style={styles.transferButtonText}>{isProcessing ? 'Processing...' : 'Transfer Money'}</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomSheetBackground: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  indicator: {
    backgroundColor: '#E0E0E0',
    width: 40,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#000',
  },
  balanceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  inputError: {
    borderColor: '#FF3B30',
  },
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
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  transferButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  transferButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeHolderColor:{
    color:"#999999"
  }
});

export default TransferMoneySheet;