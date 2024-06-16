import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GlobalProvider } from './GlobalContext';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import 'react-native-reanimated';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Main from './pages/Main';
import Calendar from './pages/Calendar';
import Folders from './pages/Folders';
import ProjectDetails from './pages/ProjectDetails';
import Project from './pages/Project';
import AddTask from './pages/AddTask';
import AddProject from './pages/AddProject';
import Chat from './pages/Chat';
import StatisticsScreen from './pages/StatisticScreen';
import ProfileScreen from './pages/ProfileScreen';
import EditProfileScreen from './pages/EditProfileScreen';
import EditProject from './pages/EditProject';

const Stack = createNativeStackNavigator();
enableScreens();

export default function App() {
  return (
    <GlobalProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" options={{headerShown: false}} component={Login} />
            <Stack.Screen name="Registration" component={Registration} options={{headerShown: false}} />
            <Stack.Screen name="Main" component={Main} options={{headerShown: false}} />
            <Stack.Screen name="Calendar" component={Calendar} options={{headerShown: false}} />
            <Stack.Screen name="Folders" component={Folders} options={{headerShown: false}} />
            <Stack.Screen name="ProjectDetails" component={ProjectDetails} options={{headerShown: false}} />
            <Stack.Screen name="Project" component={Project} options={{headerShown: false}} />
            <Stack.Screen name="AddTask" component={AddTask} options={{headerShown: false}} />
            <Stack.Screen name="AddProject" component={AddProject} options={{headerShown: false}} />
            <Stack.Screen name="Chat" component={Chat} options={{headerShown: false}} />
            <Stack.Screen name="StatisticsScreen" component={StatisticsScreen} options={{headerShown: false}} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{headerShown: false}} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{headerShown: false}} />
            <Stack.Screen name="EditProject" component={EditProject} options={{headerShown: false}} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </GlobalProvider>
  );
}
