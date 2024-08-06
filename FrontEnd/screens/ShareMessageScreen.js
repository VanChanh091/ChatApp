import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";

export default function ShareMessageScreen({ route }) {
  const { messageId } = route.params;
  console.log("messageId :", messageId);

  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/messages/${messageId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(messageId),
          }
        );
        const responseData = await response.json();

        setSenderId(responseData[0].senderId);
        setMessage(responseData[0].message);
        setMessageType(responseData[0].messageType);
        console.log("message share:", message);

        console.log("senderId :", senderId);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMessage();
  }, [senderId, message, messageType]);

  return (
    <View>
      <Text>ShareMessageScreen</Text>
      <Text>{message}</Text>
      <Text>{senderId}</Text>
      <Text>{messageType}</Text>
    </View>
  );
}
