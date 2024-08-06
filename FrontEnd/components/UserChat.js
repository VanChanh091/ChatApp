import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";

const UserChat = ({ item }) => {
  const { userId, setUserId } = useContext(UserType);
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const [source, setSource] = useState(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/messages/${userId}/${item._id}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        console.log("error showing messags", response.status.message);
      }
    } catch (error) {
      console.log("error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    getLastMessage();
  }, []);
  console.log(messages);

  const getLastMessage = () => {
    const userMessages = messages.filter(
      (message) => message.messageType === "text"
    );

    const n = userMessages.length;

    return userMessages[n - 1];
  };
  const lastMessage = getLastMessage();
  console.log(lastMessage);
  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  useEffect(() => {
    const baseUrl = "D:/20045291/CNM/BTL/realtime-chat-app-main/BackEnd/";
    const imageUrl = item.image;
    // const filename = imageUrl.split("/").pop();
    console.log("file name :", imageUrl);
    const source = { uri: baseUrl + imageUrl };
    console.log("uri :", source.uri);
    setSource(source);
  }, [item.image]);

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Messages", {
          recepientId: item._id,
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#F9F9F9",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Image
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          resizeMode: "cover",
        }}
        source={{
          uri: "https://www.bing.com/th?id=OIP.SqTcfufj92gVRBT45d045wAAAA&w=150&h=150&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
        }}
      />

      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
          {item?.name}
        </Text>
        {lastMessage && (
          <Text
            style={{
              marginTop: 3,
              color: "#666",
              fontWeight: "400",
              fontSize: 14,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lastMessage?.message}
          </Text>
        )}
      </View>

      <Text style={{ fontSize: 12, fontWeight: "400", color: "#888" }}>
        {lastMessage && formatTime(lastMessage?.timeStamp)}
      </Text>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});
