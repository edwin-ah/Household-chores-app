import React, { useContext } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from "../context_api/AuthContext";
import { Ionicons, Octicons  } from '@expo/vector-icons';
import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/LoginScreen';
import HouseScreen from '../screens/HouseScreen';
import ChoresScreen from '../screens/ChoresScreen';
import RegisterHouseScreen from '../screens/RegisterHouseScreen';
import HandleChoreScreen from '../screens/HandleChoreScreen';

const HouseStack = createNativeStackNavigator()
function HouseStackScreen() {
  return (
    <HouseStack.Navigator>
      <HouseStack.Screen 
        name="House" 
        component={HouseScreen} 
        options={{ title: 'Hushåll'}}
      />
      <HouseStack.Screen 
        name="RegisterHouse" 
        component={RegisterHouseScreen} 
        options={{ title: 'Registrera hushåll'}}
      />
    </HouseStack.Navigator>
  )
}

const ChoreStack = createNativeStackNavigator()
function ChoreStackScreen() {
  return (
    <ChoreStack.Navigator>
      <ChoreStack.Screen 
        name="Chores" 
        component={ChoresScreen} 
        options={{ title: 'Hushållsysslor'}}
      />
      <ChoreStack.Screen 
        name="HandleChore" 
        component={HandleChoreScreen} 
        options={{ title: 'Hantera sysslor'}}
      />
    </ChoreStack.Navigator>
  )
}

const Tab = createBottomTabNavigator()
export default function StackNavigator() {

  const [authUser, setAuthUser] = useContext(AuthContext)
  return (
    // Returnera olika screens beroende på om användare är inloggad eller inte
    <Tab.Navigator>
      {authUser ? (
        <>
          <Tab.Screen 
            name="Home" 
            component={StartScreen} 
            options={{
              tabBarIcon: ({ focused }) => <Ionicons name="stats-chart" size={24} color={focused ? 'blue' : 'gray'} />,
              title: 'Översikt'
            }}
          />
          <Tab.Screen 
            name="HouseTab" 
            component={HouseStackScreen} 
            options={{ 
              headerShown: false,
              tabBarIcon: ({ focused }) => <Ionicons name="home" size={24} color={focused ? 'blue' : 'gray'} />,
              title: 'Hushåll'
            }} 
          />
          <Tab.Screen 
            name="ChoresTab" 
            component={ChoreStackScreen} 
            options={{
              headerShown: false, 
              tabBarIcon: ({ focused }) => <Octicons name="checklist" size={24} color={focused ? 'blue' : 'gray'} />,
              title: 'Sysslor'
            }} 
          />
        </>
      ) : (
        <Tab.Screen name="Login" component={LoginScreen} 
          options={{ 
            headerShown: false,  
            tabBarIcon: () => <Ionicons name="log-in" size={24} color={'blue'} /> 
          }} />
      )}
    </Tab.Navigator>
  )
}
