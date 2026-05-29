import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from './Icon';
import {MainTabParamList} from '../../types/navigation';
import {HomeScreen} from '../../screens/HomeScreen';
import {ScanStackNavigator} from '../../navigation/MainNavigator';
import {MapStackNavigator} from '../../navigation/MainNavigator';
import {AchievementsStackNavigator} from '../../navigation/MainNavigator';
import {ProfileStackNavigator} from '../../navigation/MainNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function BottomNavBar() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({color, size}) => {
          const icons: Record<string, string> = {
            HomeTab: 'home',
            ScanTab: 'camera',
            MapTab: 'map-marker',
            AchievementsTab: 'trophy',
            ProfileTab: 'account',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStackNavigator}
        options={{tabBarLabel: 'Map'}}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanStackNavigator}
        options={{tabBarLabel: 'Scan'}}
      />
      <Tab.Screen
        name="AchievementsTab"
        component={AchievementsStackNavigator}
        options={{tabBarLabel: 'Achievements'}}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}
