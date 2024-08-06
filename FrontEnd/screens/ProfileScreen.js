import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from "react-native";
import React, { useLayoutEffect, useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = ({ route }) => {
  // console.log("user data profile:", user);
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [user, setUser] = useState({});
  const [userName, setUserName] = useState(user.name);
  const [source, setSource] = useState({});
  const [image, setImage] = useState(null);

  const handleNameChange = (newName) => {
    setUserName(newName);

    try {
      axios
        .put(`http://localhost:8000/user/update-name`, {
          userId: userId,
          name: newName,
        })
        .then((response) => {
          console.log("response data:", response.data);
          setUser(response.data);
        });
    } catch (error) {
      console.log(error);
      Alert.alert("Error");
    }
  };

  const handleLogout = async () => {
    // Clear the authentication token from AsyncStorage
    await AsyncStorage.removeItem("authToken");

    // Clear the user ID in the context
    setUserId(null);

    // Navigate to the login screen
    navigation.navigate("Login");
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      const response = await axios.get(`http://localhost:8000/user/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Pressable style={{marginLeft:15,}}>
          <Ionicons
            //   onPress={() => navigation.navigate("Profile")}
            onPress={() => navigation.goBack()}
            name="arrow-back-outline"
            size={30}
            color="black"
          />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable style={{marginRight:15,}}>
          <Ionicons
            //   onPress={() => navigation.navigate("Profile")}
            name="ellipsis-horizontal-outline"
            size={30}
            color="black"
          />
        </Pressable>
      ),
    });
  }, []);

  useEffect(() => {
    const baseUrl = "D:/20045291/CNM/BTL/realtime-chat-app-main/BackEnd";
    const imageUrl = user.image;
    // const filename = imageUrl.split("/").pop();
    console.log("file name :",imageUrl);
    const source = { uri: baseUrl + imageUrl };
    setSource(source);
  }, [user.image]);


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.cancelled) {
      let image = result.assets[0].uri;
  
      // Prepare the form data
      let formData = new FormData();
      formData.append('file', { uri: image, name: 'image.jpg', type: 'image/jpg' });
      formData.append('userId', userId);
  
      // Use Axios to send the POST request
      axios
        .put('http://localhost:8000/user/update-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          console.log('response data img:', response.data.image);
          setUser(response.data);
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('Error');
        });
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 4 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <TouchableOpacity
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={pickImage}
          >
            <Image
              source={source}
              style={{ width: 120, height: 120, borderRadius: 60 }}
              
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
            flexDirection: "row",
            gap: 5,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>{user.name}</Text>
          <AntDesign
            name="edit"
            size={24}
            color="black"
            onPress={() => setUserName(user.name)} // Toggle the text input
          />
        </View>

        {userName !== undefined ? ( // Render TextInput only when userName is defined
          <View style={{ alignItems: "center" }}>
            <TextInput
              value={userName}
              onChangeText={setUserName} // Update userName state directly
              onBlur={() => {
                handleNameChange(userName); // Call API to update name when TextInput loses focus
                setUserName(undefined); // Hide TextInput
              }}
              style={{
                borderRadius: 5,
                padding: 5,
                margin: 5,
                width: "50%",
                borderBottomWidth: 1,
                borderBottomColor: "black",
                fontSize: 16,
                fontWeight: 600,
              }}
            />
          </View>
        ) : null}
      </View>
      <View style={{ flex: 6, alignItems: "center", marginTop:10, }}>
        <View
          style={{
            backgroundColor: "white",
            width: "95%",
            height: 60,
            borderRadius: 10,
            gap: 0,
          }}
        > 
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
            }}
            onPress={handleLogout}
          >
            <View
              style={{
                flex: 2.5,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: "#f4f4f4",
                  width: "80%",
                  height: "80%",
                }}
              >
                <Ionicons
                  // onPress={() => navigation.navigate("Profile")}
                  name="log-out-outline"
                  size={35}
                  color="black"
                />
              </View>
            </View>
            <View style={{ flex: 6.5, justifyContent: "center" }}>
              <Text
                style={{ fontWeight: "400", fontSize: 22, paddingLeft: 15 }}
              >
                Logout
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="chevron-forward-outline"
                size={35}
                color="black"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
});
