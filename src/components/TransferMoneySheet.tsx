import React, { forwardRef, useMemo, useState, useCallback, useEffect } from 'react';
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
  BottomSheetTextInput
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';
import Slider from '@react-native-community/slider';
import ErrorDisplay from './ErrorDisplay';
import { useBalance } from '../hooks/useBalanceHook';
import { formatCurrency } from '../utils/formatCurrency';

interface TransferData {
  recipientName: string;
  recipientAccount: string;
  amount: number;
  description: string;
}

// Define the validation schema using Zod
const transferSchema = z.object({
  recipientName: z.string().min(8, 'Recipient full name is required'),
  recipientAccount: z.string().refine(phone=>isValidPhoneNumber(phone),{message:"Please add a valid phone "}),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});

interface TransferMoneySheetProps {
 
  insets: EdgeInsets;
 
}

const TransferMoneySheet = forwardRef<BottomSheetModal, TransferMoneySheetProps>(
  ({  insets }, ref) => {
    const [recipientName, setRecipientName] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<z.ZodError['formErrors']['fieldErrors'] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
     const [liveAmount, setLiveAmount] = useState('');
    const { balance, addTransaction } = useBalance();
     
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

   
 const isButtonDisabled = errors !== null || isProcessing || parseFloat(amount) > balance;


    const handleTransfer = async () => {
      // We can do a final check here just in case.
      if (errors !== null || parseFloat(amount) > balance) {
        Alert.alert('Error', 'Please fix the errors before submitting.');
        return;
      }

      Keyboard.dismiss();
      setIsProcessing(true);
      const transferAmount = parseFloat(amount);

      try {
         const transferData: TransferData = { recipientName, recipientAccount, amount: transferAmount, description };
         const shouldReject = transferData.amount === 1 ? true:false
         //For testing purposes if the input is 1 then the call fails
        await new Promise((resolve,reject) => setTimeout(()=>{
        if (shouldReject) reject(new Error("Network issue"))
          return resolve("Success")
        },6000)) 
        setRecipientName('');
        setRecipientAccount('');
        setAmount('');
        setDescription('');
        setLiveAmount('')
        setErrors(null);

        addTransaction({amount:transferData.amount,title: `To: ${recipientName}`,type:'send'});
        Alert.alert('Success', 'Money transferred successfully!');
        
        // 3. Dismiss the modal on success
        (ref as any)?.current?.dismiss();
      } catch (error) {
        console.log(error)
        Alert.alert('Error', 'Transfer failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
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
          <View style={[styles.container, { paddingBottom: insets.bottom +10 }]}>
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
                <BottomSheetTextInput editable={!isProcessing} style={[styles.input, errors?.recipientName && styles.inputError]} value={recipientName} onChangeText={setRecipientName} placeholder="Enter recipient's full name" placeholderTextColor={styles.placeHolderColor.color} />
                <ErrorDisplay message={errors?.recipientName?.[0]} />
              </View>

              {/* Recipient Account */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <BottomSheetTextInput editable={!isProcessing} style={[styles.input, errors?.recipientAccount && styles.inputError]} value={recipientAccount} keyboardType="phone-pad" onChangeText={setRecipientAccount} placeholder="Enter phone number (+30...)" placeholderTextColor={styles.placeHolderColor.color} />
                <ErrorDisplay message={errors?.recipientAccount?.[0]} />
              </View>

              {/* Amount */}
              <View>
                <Text style={styles.label}>Amount *</Text>
                <View style={[styles.amountInputContainer, (errors?.amount || (amount && parseFloat(amount) > balance)) && styles.inputError]}>
                  <Text style={styles.currencySymbol}>€</Text>
                  <BottomSheetTextInput
                  editable={!isProcessing}
                    style={styles.amountInput}
                    value={liveAmount}
                    onChangeText={(text) => {
                      setLiveAmount(text); 
                      setAmount(text)
                    }}
                 
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#999999"
                  />
                </View>
              
                <ErrorDisplay message={errors?.amount?.[0] || (amount && parseFloat(amount) > balance ? 'Amount exceeds available balance' : undefined)} />
              </View>
              
              {/* Slider */}
              <View style={styles.sliderWrapper}>
                <Slider
                  minimumTrackTintColor={"#007AFF"}
                  maximumTrackTintColor='grey'
                  thumbTintColor={"#007AFF"}
                 onResponderGrant={()=>true}
                  value={parseFloat(liveAmount) || 0}
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={Math.floor(balance)}
                  step={1}
                  disabled={isProcessing}
                  
                   onValueChange={(value) => setLiveAmount(Math.round(value).toString())}
               
                 onSlidingComplete={(value) => setAmount(Math.round(value).toString())}
                />
                <View style={styles.sliderMaxMinWrapper}>
                  <Text style={styles.balanceLabel} >0 €</Text>
                  <Text style={styles.balanceLabel} >{balance} €</Text>
                </View>
              </View>

              {/* Description */}
              <View style={[styles.inputContainer,{marginBottom:5,}]}>
                <Text style={styles.label}>Description (Optional)</Text>
                <BottomSheetTextInput editable={!isProcessing} numberOfLines={2} maxLength={50} style={[styles.input, styles.descriptionInput]} value={description} onChangeText={setDescription} placeholder="Add a note for this transfer" multiline placeholderTextColor={styles.placeHolderColor.color} />
              
              </View>
            </View>

            {/* Transfer Button */}
            <TouchableOpacity style={[styles.transferButton, isButtonDisabled && styles.transferButtonDisabled]} onPress={handleTransfer} disabled={isButtonDisabled}>
              <Text style={styles.transferButtonText}>{isProcessing ? 'Processing...' : 'Transfer Money'}</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    )
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
    marginBottom: 10,
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
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
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
    marginBottom: 0,
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
    flexWrap:"wrap",
    flex:1,
   
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
  },
  sliderWrapper:{

  
  },
  slider:{
    height:40,
  },
  sliderMaxMinWrapper:{flex:1,flexDirection:"row",justifyContent:"space-between"}
});

export default TransferMoneySheet;