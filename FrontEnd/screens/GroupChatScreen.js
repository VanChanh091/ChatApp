import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { io } from "socket.io-client";
import * as DocumentPicker from "expo-document-picker";
import { AntDesign } from '@expo/vector-icons';

export default function GroupChatScreen({ route }) {
  const { groupId } = route.params;

  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState("");
  const [group, setgroup] = useState();
  const [memberId, setMemberId] = useState([]);
  const [message, setMessage] = useState("");
  const { userId, setUserId } = useContext(UserType);
  const [usersDetais, setUsersDetail] = useState([]);
  // const [usersImages, setUsersImages] = useState([]);

  const scrollViewRef = useRef(null);

  const socketRef = useRef(null);

  useEffect(() => {
    // fetch thông tin group
    const fetchGroupInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/group/${groupId}`);
        const data = await response.json();

        if (response.ok) {
          setgroup(data);

          // lưu lại id của các thành viên trong mảng memberId
          const memberIds = data.members.map((member) => member._id);
          setMemberId(memberIds);
          console.log("memberIds:", memberIds);
        } else {
          console.log("error fetching group info", response.status.message);
        }
      } catch (error) {
        console.log("error fetching group info", error);
      }
    };
    fetchGroupInfo();
  }, []);

  useEffect(() => {
    // fetch thông tin người dùng trong group
    const getDetailUserInGroup = async () => {
      try {
        const response = await fetch("http://localhost:8000/groups/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userIds: memberId }),
        });

        if (!response.ok) {
          throw new Error("Lỗi khi truy vấn người dùng");
        }

        const users = await response.json();

        // console.log("Danh sách người dùng:", users);
        setUsersDetail(users);
        console.log("danh sách nguoi dung:", usersDetais);
        return users;
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu:", error);
        return null;
      }
    };
    getDetailUserInGroup();
  }, [memberId]);

  useEffect(() => {
    // Kết nối với máy chủ Socket.io khi component được tạo
    socketRef.current = io("http://localhost:8000");

    // Lắng nghe sự kiện "newMessage" từ máy chủ và cập nhật danh sách tin nhắn
    socketRef.current.on("newMessageGroup", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Lắng nghe sự kiện "sendMessage" từ máy chủ và cập nhật danh sách tin nhắn
    socketRef.current.on("sendMessageGroup", ({ newMessage }) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Đảm bảo rằng bạn ngắt kết nối khi component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/group-messages/${groupId}`
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
  }, []);

  

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/group-messages/${groupId}`
        );

        const data = await response.json();
        setRecepientData(data);
        console.log("recepient data:", data);
      } catch (error) {
        console.log("error retrieving details", error);
      }
    };

    fetchRecepientData();
  }, []);

  const handleSend = async (messageType, imageUri) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("groupId", groupId); // Add groupId to formData

      formData.append("recepientId", memberId);

      // Check if the message type is image or a normal text
      if (messageType === "image") {
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const response = await fetch("http://localhost:8000/group-messages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        setSelectedImage("");
        // Notify the server and recipient about the new event
        socketRef.current.emit("sendMessage", {
          senderId: userId,
          recepientId: memberId,
          newMessage: response.newMessage, // Modify this line based on your server response
        });

        // Fetch the message list to update the interface
        fetchMessages();
      }
    } catch (error) {
      console.log("error in sending the message", error);
    }
  };

  const handdleToDetailGroup = () => {
    navigation.navigate("GroupInfoScreen", {
      groupId: groupId,
    });
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginLeft:10, }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />

          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: "bold" }}>
                {group?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, }}>
            <Ionicons name="arrow-redo-sharp" size={24} color="black" />
            <Ionicons name="arrow-undo" size={24} color="black" />
            <FontAwesome name="star" size={24} color="black" />
            <MaterialIcons
              onPress={() => deleteMessages(selectedMessages)}
              name="delete"
              size={24}
              color="black"
            />
            
          </View>
        ) : <View><AntDesign name="bars" size={26} color="black" onPress={handdleToDetailGroup} style={{marginRight:12,}} /></View>,
    });
  }, [recepientData, selectedMessages]);

  const deleteMessages = async (messageIds) => {
    try {
      const response = await fetch("http://localhost:8000/deleteMessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messageIds }),
      });

      if (response.ok) {
        setSelectedMessages((prevSelectedMessages) =>
          prevSelectedMessages.filter((id) => !messageIds.includes(id))
        );

        fetchMessages();
      } else {
        console.log("error deleting messages", response.status);
      }
    } catch (error) {
      console.log("error deleting messages", error);
    }
  };
  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    delete result.cancelled;
    console.log(result);
    if (!result.canceled) {
      handleSend("image", result.assets[0].uri);
    }
  };
  const handleSelectMessage = (message) => {
    //check if the message is already selected
    const isSelected = selectedMessages.includes(message._id);
    console.log("isSelected:", isSelected);

    if (isSelected) {
      setSelectedMessages((previousMessages) =>
        previousMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((previousMessages) => [
        ...previousMessages,
        message._id,
      ]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();

      // Check if the user canceled the picker
      if (result.cancelled) {
        return;
      }

      // You can now use result.uri to upload the document file to your server
      console.log("Document URI:", result.uri);

      // Handle the document file upload
      handleSend("document", result.uri);
    } catch (error) {
      console.log("Error picking document:", error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={handleContentSizeChange}
      >
        {messages.map((item, index) => {
          if (item.messageType === "text") {
            const isSelected = selectedMessages.includes(item._id);
            console.log("recepientId:", item.recepientId);
            return (
              <Pressable
                onLongPress={() => handleSelectMessage(item)}
                key={index}
                style={[
                  item?.senderId === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },

                  isSelected && { width: "100%", backgroundColor: "#F0FFFF" },
                ]}
              >
                <View style={{ flexDirection: "row" }}>
                  {/* // hiển thị ảnh đại diện của người gửi tin nhắn */}

                  {/* <Image
                    style={{
                      width: 25,
                      height: 25,
                      borderRadius: 25,
                      resizeMode: "cover",
                    }}
                    source={{
                      uri: usersDetais.find(
                        (user) => user._id === item.senderId
                      )?.image,
                    }}
                  /> */}
                  {item.senderId !== userId && (
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                        borderRadius: 25,
                        resizeMode: "cover",
                      }}
                      source={{
                        uri: usersDetais.find(
                          (user) => user._id === item.senderId
                        )?.image,
                      }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 20,
                      marginHorizontal: 5,
                      textAlign: isSelected ? "right" : "left",
                    }}
                  >
                    {item?.message}
                  </Text>
                </View>
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 9,
                    color: "gray",
                    marginTop: 5,
                  }}
                >
                  {formatTime(item.timeStamp)}
                </Text>
              </Pressable>
            );
          }

          if (item.messageType === "image") {
            const baseUrl = "/Users/nganle/Downloads/realtime-chat-app/BackEnd/files/";

            const imageUrl = item.imageUrl;
            const filename = imageUrl.split("/").pop();
            const source = { uri: baseUrl + filename };
            console.log("source :", source);
            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },
                ]}
              >
                <View>
                  {/* ảnh đại diện  */}
                  {/* <Image
                    style={{
                      width: 25,
                      height: 25,
                      borderRadius: 25,
                      resizeMode: "contain",
                      borderColor: "gray",
                      borderWidth: 1,
                    }}
                    source={{
                      uri: usersDetais.find(
                        (user) => user._id === item.senderId
                      )?.image,
                    }}
                  /> */}

                  {item.senderId !== userId && (
                    <Image
                      style={{
                        width: 25,
                        height: 25,
                        borderRadius: 25,
                        resizeMode: "cover",
                      }}
                      source={{
                        uri: usersDetais.find(
                          (user) => user._id === item.senderId
                        )?.image,
                      }}
                    />
                  )}
                  <Image
                    source={source}
                    style={{ width: 200, height: 200, borderRadius: 7 }}
                  />
                  <Text
                    style={{
                      textAlign: "right",
                      fontSize: 9,
                      position: "absolute",
                      right: 10,
                      bottom: 7,
                      color: "white",
                      marginTop: 5,
                    }}
                  >
                    {formatTime(item?.timeStamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: showEmojiSelector ? 0 : 25,
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          style={{ marginRight: 5 }}
          name="emoji-happy"
          size={24}
          color="gray"
        />
        
        <Entypo name="attachment" size={24} color="black" onPress={pickDocument}/>
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
          }}
          placeholder="Type Your message..."
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          <Entypo onPress={pickImage} name="camera" size={24} color="gray" />

          <Feather name="mic" size={24} color="gray" />
        </View>

        <Pressable
          onPress={() => handleSend("text")}
          style={{
            backgroundColor: "#007bff",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </Pressable>
      </View>

      {showEmojiSelector && (
        <EmojiSelector
          onEmojiSelected={(emoji) => {
            setMessage((prevMessage) => prevMessage + emoji);
          }}
          style={{ height: 250 }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
