import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  SafeAreaView,
  Alert,
  Pressable,
  Image,
  StatusBar,
} from "react-native";
import CheckBox from "expo-checkbox";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CreateGroup({ route }) {
  const { users, userId } = route.params;

  const navigation = useNavigation();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleSelectUser = (userId) => {
    // Toggle the selection state of the user
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(userId)) {
        // If the user is already selected, remove them from the selectedUsers array
        return prevSelectedUsers.filter((id) => id !== userId);
      } else {
        // If the user is not selected, add them to the selectedUsers array
        return [...prevSelectedUsers, userId];
      }
    });
  };

  const handleCreateGroup = () => {
    // gán userId của người tạo gr vào mảng selectedUsers
    const usersWithSelf = [...selectedUsers, userId];

    // Validate group name and selected users
    if (!groupName) {
      Alert.alert("Error", "Please enter a group name.");
      return;
    }
    if (usersWithSelf.length < 2) {
      Alert.alert(
        "Error",
        "You need to select at least two users to create a group."
      );
      return;
    }

    // Perform further actions for creating the group
    console.log("Group Name:", groupName);
    console.log("Selected Users:", usersWithSelf);

    const requestData = {
      groupName: groupName,
      selectedUsers: usersWithSelf,
      leader: userId,
    };

    try {
      // Post request to server to create a group
      fetch("http://localhost:8000/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      //thông báo tạo group thành công. bấm ok mới quay về Home

      Alert.alert("Success", "Group created successfully.");
    } catch (error) {
      console.log("Error creating group:", error);
      // Show error message to user
      alert("Error creating group. Please try again.");
    }
    // Navigate to the group chat screen và truyền danh sách id user đã chọn
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      <StatusBar/>
      <View
        style={{
          width: "100%",
          height: 60,
          flexDirection: "row",
          borderColor: "gray",
          borderBottomWidth: 1,
        }}
      >
        <View
          style={{ flex: 1.5, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons
            name="arrow-back-outline"
            size={27}
            color="black"
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={{ flex: 5.5, justifyContent: "center" }}>
          <Text style={{ fontWeight: 400, fontSize: 18, paddingLeft: 10 }}>
            Create Group
          </Text>
        </View>
        <View
          style={{ flex: 3, justifyContent: "center", alignItems: "center" }}
        >
          <Pressable
            onPress={handleCreateGroup}
            style={{
              width: "70%",
              height: "70%",
              backgroundColor: "#2196f3",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>
              Create
            </Text>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          width: "100%",
          height: 130,
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", paddingLeft: 15 }}>
          Group Name:
        </Text>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <TextInput
            value={groupName}
            onChangeText={(text) => setGroupName(text)}
            style={{
              fontSize: groupName ? 18 : 18,
              borderColor: "gray",
              borderWidth: 1,
              marginVertical: 10,
              width: "90%",
              height: 50,
              borderRadius: 10,
              paddingLeft: 15,
            }}
            placeholder="Enter your group name"
          />
        </View>
      </View>

      <ScrollView style={{ width: "100%", height: 200 }}>
        {users.map((user) => (
          <View
            key={user._id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              height: 50,
              width: "100%",
              // borderWidth:1,
            }}
          >
            <View
              style={{
                flex: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CheckBox
                value={selectedUsers.includes(user._id)}
                onValueChange={() => toggleSelectUser(user._id)}
              />
            </View>
            {/* <User item={user} /> */}
            <View style={{ flex: 8 }}>
              <Text
                style={{
                  fontWeight: 400,
                  fontSize: 18,
                  placeholder: 5,
                  paddingLeft: 20,
                }}
              >
                {user.email}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
    
  );
}
