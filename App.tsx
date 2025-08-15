import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import DaireDetailScreen from './src/screens/DaireDetailScreen';
import AddDaireScreen from './src/screens/AddDaireScreen';
import StatsScreen from './src/screens/StatsScreen';

import { DaireProvider } from './src/context/DaireContext';

export type RootStackParamList = {
  Home: undefined;
  DaireDetail: { daireId: string };
  AddDaire: undefined;
  Stats: undefined;
  Backup: undefined;
};

export type TabParamList = {
  Daireler: undefined;
  DaireEkle: undefined;
  Bilgiler: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Stack Navigator'lar
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Daireler' }} />
    <Stack.Screen name="DaireDetail" component={DaireDetailScreen} options={{ title: 'Daire Detayı' }} />
  </Stack.Navigator>
);

const AddDaireStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen name="AddDaire" component={AddDaireScreen} options={{ title: 'Yeni Daire Ekle' }} />
  </Stack.Navigator>
);

const StatsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen name="Home" component={StatsScreen} options={{ title: 'Bilgiler' }} />
  </Stack.Navigator>
);

// Özel Daire Ekle butonu
const CustomAddButton = () => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity
      style={styles.customButton}
      onPress={() => navigation.navigate('DaireEkle' as never)}
    >
      <Ionicons name="add" size={30} color="white" />
    </TouchableOpacity>
  );
};

export default function App() {
  return (
    <DaireProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#2196F3" />
        <View style={styles.container}>
          <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Daireler') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'DaireEkle') {
                return <CustomAddButton />;
              } else if (route.name === 'Bilgiler') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              height: 60,
              paddingBottom: 5,
              paddingTop: 5,
              marginBottom: 8,
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="Daireler" 
            component={HomeStack}
            options={{ tabBarLabel: 'Daireler' }}
          />
          <Tab.Screen 
            name="DaireEkle" 
            component={AddDaireStack}
            options={{ 
              tabBarLabel: () => null
            }}
          />
          <Tab.Screen 
            name="Bilgiler" 
            component={StatsStack}
            options={{ tabBarLabel: 'Bilgiler' }}
          />

                  </Tab.Navigator>
        </View>
      </NavigationContainer>
    </DaireProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  customButton: {
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});