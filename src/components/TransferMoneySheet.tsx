// src/components/TransferMoneySheet.tsx
import React, { forwardRef, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,

} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { z } from "zod/v4";



interface TransferMoneySheetProps {
  balance: number;
  insets: EdgeInsets;
  onTransferComplete?: (transferData: TransferData) => void;
}

interface TransferData {
  recipientName: string;
  recipientAccount: string;
  amount: number;
  description: string;
}
const transferSchema = z.object({
  receipientName: z.string().min(10,"You need to add the full recipient name") 
})
const TransferMoneySheet = forwardRef<BottomSheet, TransferMoneySheetProps>(
  ({ balance, onTransferComplete,insets }, ref) => {
    const [recipientName, setRecipientName] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);


    
    const snapPoints = useMemo(() => ['25%', '85%'], []);


    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

 
    const isFormValid = () => {
      return (
        recipientName.trim() !== '' &&
        recipientAccount.trim() !== '' &&
        amount.trim() !== '' &&
        parseFloat(amount) > 0 &&
        parseFloat(amount) <= balance
      );
    };


    const handleTransfer = async () => {
      if (!isFormValid()) {
        Alert.alert('Error', 'Please fill all required fields and ensure amount is valid.');
        return;
      }

      const transferAmount = parseFloat(amount);
      if (transferAmount > balance) {
        Alert.alert('Insufficient Funds', 'Transfer amount exceeds available balance.');
        return;
      }

      setIsProcessing(true);

      try {
     
        await new Promise(resolve => setTimeout(resolve, 2000));

        const transferData: TransferData = {
          recipientName,
          recipientAccount,
          amount: transferAmount,
          description,
        };

        // Clear form
        setRecipientName('');
        setRecipientAccount('');
        setAmount('');
        setDescription('');

        // Call callback if provided
        onTransferComplete?.(transferData);

        Alert.alert('Success', 'Money transferred successfully!');
        
        // Close bottom sheet
        (ref as any)?.current?.close();
      } catch (error) {
        Alert.alert('Error', 'Transfer failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    // Format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(value);
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          <View style={[styles.container,{paddingBottom:insets.bottom}]}>
      
            {/* Header */}
            <View style={styles.header}>
              <Icon name="paper-plane" size={24} color="#007AFF" />
              <Text style={styles.title}>Transfer Money</Text>
            </View>

            {/* Balance Display */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Recipient Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Recipient Name *</Text>
                <TextInput
                  style={styles.input}
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Enter recipient's full name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>

              {/* Recipient Account */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Account Number *</Text>
                <TextInput
                  style={styles.input}
                  value={recipientAccount}
                  onChangeText={setRecipientAccount}
                  placeholder="Enter account number or email"
                  placeholderTextColor="#999"
               
                  autoCapitalize="none"
                />
              </View>

              {/* Amount */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount *</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>€</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                </View>
                {amount && parseFloat(amount) > balance && (
                  <Text style={styles.errorText}>Amount exceeds available balance</Text>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add a note for this transfer"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountContainer}>
                <Text style={styles.label}>Quick Amount</Text>
                <View style={styles.quickAmountButtons}>
                  {[25, 50, 100, 250].map((quickAmount) => (
                    <TouchableOpacity
                      key={quickAmount}
                      style={styles.quickAmountButton}
                      onPress={() => setAmount(quickAmount.toString())}
                      disabled={quickAmount > balance}
                    >
                      <Text
                        style={[
                          styles.quickAmountText,
                          quickAmount > balance && styles.disabledText,
                        ]}
                      >
                        €{quickAmount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Transfer Button */}
            <TouchableOpacity
              style={[
                styles.transferButton,
                (!isFormValid() || isProcessing) && styles.transferButtonDisabled,
              ]}
              onPress={handleTransfer}
              disabled={!isFormValid() || isProcessing}
            >
              <Text style={styles.transferButtonText}>
                {isProcessing ? 'Processing...' : 'Transfer Money'}
              </Text>
            </TouchableOpacity>
         
       </View>
        </BottomSheetScrollView>
      </BottomSheet>
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
    marginBottom: 4,
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
  quickAmountContainer: {
    marginBottom: 24,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  disabledText: {
    color: '#999',
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
});



export default TransferMoneySheet;