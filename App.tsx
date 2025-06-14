import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// IMPORT THE MODAL PROVIDER
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomTabNavigator } from './src/navigation';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        {/* Wrap your NavigationContainer with the Modal Provider */}
        <BottomSheetModalProvider>
          <NavigationContainer>
            <BottomTabNavigator />
          </NavigationContainer>
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