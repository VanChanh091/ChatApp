import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Alert,
  Image
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Octicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const navigation = useNavigation();
  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
    };

    // send a POST  request to the backend API to register the user
    axios
      .post("http://localhost:8000/register", user)
      .then((response) => {
        console.log(response);
        Alert.alert(
          "Registration successful",
          "You have been registered Successfully"
        );
        setName("");
        setEmail("");
        setPassword("");
        
      })
      .catch((error) => {
        Alert.alert(
          "Registration Error",
          "An error occurred while registering"
        );
        console.log("registration failed", error);
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
            source={require("../assets/register.png")}
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
          <Text style={{ fontSize: 24, fontWeight: "600" }}>
            Register to your account
          </Text>
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
            <Feather name="user" size={27} color="gray" />
          </View>
          <View style={{ flex: 8.5 }}>
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={{
                fontSize: email ? 18 : 18,
                width: "100%",
                height: "100%",
                paddingLeft: 10,
                borderRadius: 10,
              }}
              placeholderTextColor={"gray"}
              placeholder="Enter Your Name"
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
              placeholder="Enter Your Email"
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
              placeholder="Password"
            />
          </View>
        </View>

        <Pressable
          onPress={handleRegister}
          style={{
            width: "85%",
            backgroundColor: "#4A55A2",
            borderRadius: 10,
            padding: 15,
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 30,
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
            Register
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Already Have an account?
          </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={{ textAlign: "center", fontSize: 16, color: "blue", paddingLeft: 5}}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
