import React, { useRef, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
import TransferMoneySheet from '../components/TransferMoneySheet';
import { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const EmptyComponent = () => null;

const BottomTabNavigator = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarShowLabel: true,
          tabBarStyle: { backgroundColor: '#ffffff', height: 70 },
        }}
      >
        <Tab.Screen
          name="My Wallet"
          component={HomeScreen}
          options={{
            tabBarIcon: ({
              color,
              size,
              focused,
            }: {
              color: string;
              size: number;
              focused: boolean;
            }) => (
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
          component={EmptyComponent}
          options={{
            tabBarButton: (props: any) => (
              <Pressable
                {...props}
                onPress={handlePresentModalPress}
                style={styles.floatingButtonContainer}
              >
                <View style={styles.floatingButton}>
                  <Icon name="paper-plane-outline" size={30} color="white" />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            tabBarIcon: ({
              color,
              size,
              focused,
            }: {
              color: string;
              size: number;
              focused: boolean;
            }) => (
              <Icon
                name={focused ? 'person' : 'person-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
      <TransferMoneySheet ref={bottomSheetModalRef} insets={insets} />
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  floatingButton: {
    top: -25,

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default BottomTabNavigator;
