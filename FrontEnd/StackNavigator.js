import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import FriendsScreen from "./screens/FriendsScreen";
import ChatsScreen from "./screens/ChatsScreen";
import ChatMessagesScreen from "./screens/ChatMessagesScreen";
import CreateGroupScreen from "./screens/CreateGroupScreen";
import GroupChatScreen from "./screens/GroupChatScreen";
import UserChat from "./components/UserChat";
import ListGroupChat from "./screens/ListGroupScreen";
import ShareMessageScreen from "./screens/ShareMessageScreen";
import GroupInfoScreen from "./screens/GroupInfoScreen";
import AddMemberGroupScreen from "./screens/AddMemberGroupScreen";
import ProfileScreen from "./screens/ProfileScreen";
const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="Friends" component={FriendsScreen} />

        <Stack.Screen name="Chats" component={ChatsScreen} />

        <Stack.Screen name="Messages" component={ChatMessagesScreen} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen}  options={{headerShown:false}}/>
        <Stack.Screen name="GroupChat" component={GroupChatScreen} options={{headerShown:true}}/>
        <Stack.Screen name="ListGroupChat" component={ListGroupChat} options={{headerShown:true}} />
        <Stack.Screen name="ShareMessage" component={ShareMessageScreen} />
        <Stack.Screen name="GroupInfoScreen" component={GroupInfoScreen} options={{headerShown:true}} />
        <Stack.Screen name="AddMemberScreen" component={AddMemberGroupScreen} options={{headerShown:false}}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
