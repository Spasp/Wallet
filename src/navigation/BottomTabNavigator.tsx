// src/navigation/BottomTabNavigator.tsx
import React, { useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomSheet from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons'; 

import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
// import { TransferMoneySheet } from '../components/TransferMoneySheet';
import { BottomTabParamList } from './types';
import TransferMoneySheet from '../components/TransferMoneySheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const DummyComponent = () => null;

const BottomTabNavigator = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [currentBalance, setCurrentBalance] = useState(1500.75);
  const insets = useSafeAreaInsets();

  const handleOpenPress = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: { backgroundColor: '#ffffff', height: 60 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: 'My Wallet',
            // FIX: Added the tabBarIcon function back in
            tabBarIcon: ({ color, size, focused }) => (
              <Icon
                name={focused ? 'wallet' : 'wallet-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Add"
          component={DummyComponent}
          options={{
            tabBarButton: () => (
              <View style={{justifyContent:'center',alignItems:"center"}}>
              <Pressable
                onPress={handleOpenPress}
                style={{
                  top: -20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 50,
                  height: 50,
                  borderRadius: 30,
                  backgroundColor: 'dodgerblue',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.27,
                  shadowRadius: 4.65,
                  elevation: 6,
                }}
              >
                <Icon name="paper-plane-outline" size={24} color="white" />
              </Pressable>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            headerTitle: 'My Account',
             // FIX: Added the tabBarIcon function back in
            tabBarIcon: ({ color, size, focused }) => (
              <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>

      <TransferMoneySheet ref={bottomSheetRef} balance={currentBalance} insets={insets} />
    </View>
  );
};

export default BottomTabNavigator;
