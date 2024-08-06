import { StyleSheet, Text, View ,ScrollView, Pressable, TouchableOpacity} from "react-native";
import React, { useContext,useEffect,useState } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";
import GroupChat from "../components/GroupChat";
import User from "../components/User";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";

const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  // const navigation = useNavigation();

  // const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);


  const [groups, setGroups] = useState([]);
  const fetchGroups = async () => {
    try {
      // Replace 'userId' with the actual ID of the logged-in user
      // const userId = userId; // You should retrieve the actual userId from your authentication system
      const response = await fetch(`http://localhost:8000/groups/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Handle error
    }
  };

    const toggleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      // Nếu người dùng đã được chọn, hãy bỏ chọn
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      // Nếu người dùng chưa được chọn, hãy chọn
      setSelectedUsers([...selectedUsers, userId]);
    }
  };


  const navigation = useNavigation();
  useEffect(() => {
    const acceptedFriendsList = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/accepted-friends/${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          setAcceptedFriends(data);
        }
      } catch (error) {
        console.log("error showing the accepted friends", error);
      }
    };

    acceptedFriendsList();
    fetchGroups();
    ;
  }, []);
  console.log("friends",acceptedFriends)


  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      axios
        .get(`http://localhost:8000/users/${userId}`)
        .then((response) => {
          setUsers(response.data);

          console.log("users[] :", users);
        })
        .catch((error) => {
          console.log("error retrieving users", error);
        });
    };

    fetchUsers();
  }, []);

  
  return (
    // <ScrollView showsVerticalScrollIndicator={false}>
    //   <Pressable>
        
    //       {acceptedFriends.map((item,index) => (
    //           <UserChat key={index} item={item}/>
    //       ))}
    //       {
    //         groups.map((item,index) => (
    //           <GroupChat key={index} item={item}/>
    //         ))
    //       }
    //   </Pressable>
    // </ScrollView>
    <View>
      <ScrollView style={{ padding: 10 }}>
        {users.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => toggleSelectUser(item.userId)}
          >
            <User item={item} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({});
