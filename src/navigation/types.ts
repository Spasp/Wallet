// src/navigation/types.ts

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Main: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Add: undefined;
  Account:undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AppBottomTabScreenProps<T extends keyof BottomTabParamList> =
  BottomTabScreenProps<BottomTabParamList, T>;

    

