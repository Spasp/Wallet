import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";

// Define your stack parameter list
export type RootStackParamList = {
  Home: undefined; // undefined means no params
};

const Stack = createStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default RootStack;