import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Image
} from "react-native";
import React, { useState ,useEffect} from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from "@expo/vector-icons";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          navigation.replace("Home");
        } else {
          // token not found , show the login screen itself
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    checkLoginStatus();
  }, []);
  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };

    axios
      .post("http://localhost:8000/login", user)
      .then((response) => {
        console.log(response);
        const token = response.data.token;
        AsyncStorage.setItem("authToken", token);

        navigation.replace("Home");
      })
      .catch((error) => {
        Alert.alert("Login Error", "Invalid email or password");
        console.log("Login Error", error);
      });
  };
  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={{ flex: 3 }}>
        <View
          style={{
            flex: 2.3,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <Image
            source={require("../assets/login.png")}
            style={{ height: 140, width: 140, resizeMode: "contain" }}
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 0.7,
            marginTop: 5,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "600" }}>Sign In</Text>
        </View>
      </View>
      <View style={{ flex: 7, marginTop: 30, alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#f8f4f4",
            width: "85%",
            height: 50,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              flex: 1.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Octicons name="mail" size={27} color="gray" />
          </View>
          <View style={{ flex: 8.5 }}>
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={{
                fontSize: email ? 18 : 18,
                width: "100%",
                height: "100%",
                paddingLeft: 10,
                borderRadius: 10,
              }}
              placeholderTextColor={"gray"}
              placeholder="Enter your email"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#f8f4f4",
            width: "85%",
            height: 50,
            borderRadius: 10,
            marginTop: 15,
          }}
        >
          <View
            style={{
              flex: 1.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Octicons name="lock" size={27} color="gray" />
          </View>
          <View style={{ flex: 8.5 }}>
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              style={{
                fontSize: email ? 18 : 18,
                width: "100%",
                height: "100%",
                paddingLeft: 10,
                borderRadius: 10,
              }}
              placeholderTextColor={"gray"}
              placeholder="Enter your password"
            />
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          style={{
            width: "85%",
            backgroundColor: "#4A55A2",
            borderRadius: 10,
            padding: 15,
            marginTop: 50,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Login
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Dont't have an account?
          </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={{ textAlign: "center", fontSize: 16, color: "blue", paddingLeft:5,}}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 5 }}>
          <Pressable
          // onPress={() => navigation.navigate()}
          >
            <Text style={{ textAlign: "center", fontSize: 16 }}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
