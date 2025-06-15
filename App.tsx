import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomTabNavigator } from './src/navigation';
import { BalanceProvider } from './src/context/BalanceContext';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        {/* Wrap your NavigationContainer with the Modal Provider */}
        <BottomSheetModalProvider>
          <BalanceProvider>
            <NavigationContainer>
              <BottomTabNavigator />
            </NavigationContainer>
          </BalanceProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
