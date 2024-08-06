import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
  Linking,
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
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Socket, io } from "socket.io-client";
import * as FileSystem from 'expo-file-system';

import { PDFReader } from 'rn-pdf-reader-js';


import * as DocumentPicker from "expo-document-picker";

import { Octicons } from "@expo/vector-icons";
import UserChat from "../components/UserChat";
import WebView from "react-native-webview";

const ChatMessagesScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState("");
  const route = useRoute();
  const { recepientId } = route.params;
  const [message, setMessage] = useState("");
  const { userId, setUserId } = useContext(UserType);
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [itemIndex, setItemIndex] = useState(null);
  const scrollViewRef = useRef(null);
  const [selectedImageShare, setSelectedImageShare] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [source, setSource] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    // Kết nối với máy chủ Socket.io khi component được tạo
    socketRef.current = io("http://localhost:8000");

    // Lắng nghe sự kiện "newMessage" từ máy chủ và cập nhật danh sách tin nhắn
    socketRef.current.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Lắng nghe sự kiện "sendMessage" từ máy chủ và cập nhật danh sách tin nhắn
    socketRef.current.on("sendMessage", ({ newMessage }) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    socketRef.current.on("deleteMessages", ({ messageIds }) => {
      // Remove the deleted messages from the messages state
      setMessages((prevMessages) =>
        prevMessages.filter((message) => !messageIds.includes(message._id))
      );
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
        `http://localhost:8000/messages/${userId}/${recepientId}`
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

  const handleShareMessage = () => {
    setModalVisible(true);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

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
  }, []);

  const handleShareMessageFriend = async (item) => {
    // lay id cua nguoi nhan
    const recepientId = item._id;

    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);
      console.log("messageType:", messages[itemIndex].messageType);
      console.log("messageText:", messages[itemIndex].message);
      // console.log("uri:", selectedImageShare.uri);

      //if the message type id image or a normal text
      if (messages[itemIndex].messageType === "image") {
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: selectedImageShare.uri,

          name: "image.jpg",
          type: "image/jpeg",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", messages[itemIndex].message);
      }

      const response = await fetch("http://localhost:8000/messages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        setSelectedImage("");
        // Thông báo cho máy chủ và bên B về sự kiện mới
        socketRef.current.emit("sendMessage", {
          senderId: userId,
          recepientId: recepientId,
          newMessage: response.newMessage, // Modify this line based on your server response
        });
        console.log("newMessage:", response.newMessage);
        console.log("senderId:", userId);
        console.log("recepientId:", recepientId);
        // Fetch lại danh sách tin nhắn để cập nhật giao diện
        fetchMessages();
      }
      // đóng modal
      setModalVisible(!modalVisible);
    } catch (error) {
      console.log("error sending message", error);
    }
  };

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/user/${recepientId}`
        );
        const data = await response.json();
        setRecepientData(data);
      } catch (error) {
        console.log("error retrieving details", error);
      }
    };
  
    fetchRecepientData();
  
    
  }, [recepientData]);
  

  const handleSend = async (messageType, imageUri, fileName) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);
      // console.log("filename:", fileName);
      //if the message type id image or a normal text
      if (messageType === "image") {
        formData.append("messageType", "image");
        formData.append("file", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
      } else if (messageType === "document") {
        formData.append("messageType", "document");
        formData.append("fileName", fileName);
        formData.append("file", {
          uri: imageUri,
          name: "document.pdf",
          type: "application/pdf",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const response = await fetch("http://localhost:8000/messages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        setSelectedImage("");
        // Thông báo cho máy chủ và bên B về sự kiện mới
        socketRef.current.emit("sendMessage", {
          senderId: userId,
          recepientId,
          newMessage: response.newMessage, // Modify this line based on your server response
        });

        // Fetch lại danh sách tin nhắn để cập nhật giao diện
        fetchMessages();
      }
    } catch (error) {
      console.log("error in sending the message", error);
    }
  };


useEffect(()=>{
  if (recepientData && recepientData.image) {
    const baseUrl = "/Users/nganle/Downloads/realtime-chat-app/BackEnd/";
    const imageUrl = recepientData.image;
    const source = { uri: baseUrl + imageUrl };
    setSource(source);
    console.log("source :",source);
  }
},[recepientData])
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: "cover",
                }}
                source={source}
              />

              <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}>
                {recepientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* <ModalComponent/> */}

            {/* // chia sẽ tin nhắn  */}
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={handleShareMessage}
            >
              <Ionicons name="arrow-undo" size={24} color="black" />
            </Pressable>

            <FontAwesome name="star" size={24} color="black" />
            <MaterialIcons
              onPress={() => deleteMessages(selectedMessages)}
              name="delete"
              size={24}
              color="black"
            />
          </View>
        ) : null,
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
        socketRef.current.emit("deleteMessages", { messageIds });

        fetchMessages();
      } else {
        console.log("error deleting messages", response.status);
      }
      //socketio
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
    delete result.canceled;
    console.log(result.assets[0].uri);
    if (!result.canceled) {
      handleSend("image", result.assets[0].uri);
    }
  };
  const handleSelectMessage = (message, index, source) => {
    //check if the message is already selected
    const isSelected = selectedMessages.includes(message._id);
    setItemIndex(index);
    setSelectedImageShare(source);

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
      if (result.canceled) {
        return;
      }

      // You can now use result.uri to upload the document file to your server
      // console.log("Document URI:", result.assets[0].uri);

      // Handle the document file upload
      handleSend("document", result.assets[0].uri, result.assets[0].name);
    } catch (error) {
      console.log("Error picking document:", error);
    }
  };

  const handleReadDocument = async (item, index, source) => {
    const uri = source;
    
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
            return (
              <Pressable
                onLongPress={() => handleSelectMessage(item, index)}
                key={index}
                style={[
                  item?.senderId?._id === userId
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
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: isSelected ? "right" : "left",
                  }}
                >
                  {item?.message}
                </Text>
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
            if (item.imageUrl) {
              const baseUrl =
                "/Users/nganle/Downloads/realtime-chat-app/BackEnd/files/";

              const imageUrl = item.imageUrl;
              const filename = imageUrl.split("/").pop();
              const source = { uri: baseUrl + filename };

              return (
                <TouchableOpacity
                  onLongPress={() => handleSelectMessage(item, index, source)}
                  key={index}
                  style={[
                    item?.senderId?._id === userId
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
                </TouchableOpacity>
              );
            }
          }
          // hiển thị document
          if (item.messageType === "document") {
            if (item.documentUrl) {
              const baseUrl = "/Users/nganle/Downloads/realtime-chat-app/BackEnd/files/";

              const documentUrl = item.documentUrl;
              const filename = documentUrl.split("/").pop();
              const source = { uri: baseUrl + filename };

              console.log("source pdf:", source);
              return (
                <TouchableOpacity
                  onPress={() => handleReadDocument(item, index, source)}
                  onLongPress={() => handleSelectMessage(item, index, source)}
                  key={index}
                  style={[
                    item?.senderId?._id === userId
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <AntDesign name="pdffile1" size={24} color="#d02" />
                      <Text>{item.fileName}</Text>
                    </View>

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
                </TouchableOpacity>
              );
            }
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

        <Entypo
          name="attachment"
          size={24}
          color="black"
          onPress={pickDocument}
        />
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
          style={{ height: 500 }}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Share Message</Text>

            <ScrollView>
              {acceptedFriends.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleShareMessageFriend(item, index)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Image
                      key={index}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        resizeMode: "cover",
                      }}
                      source={{ uri: item.image }}
                    />
                    <Text style={{ fontSize: 20, fontWeight: 500 }}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  containerReadPDF: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
  },
});
