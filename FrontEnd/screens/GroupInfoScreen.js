import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect } from "react";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import jwt_decode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const GroupInfoScreen = ({ route }) => {
  const { groupId } = route.params;
  console.log("groupId:", groupId);
  const [group, setgroup] = React.useState({});
  const [memberId, setMemberId] = React.useState([]);
  const [usersDetail, setUsersDetail] = React.useState([]);
  const navigation = useNavigation();

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

  // fetch thông tin người dùng trong group từ mảng memberIds
  useEffect(() => {
    // fetch thông tin người dùng trong group từ mảng memberIds
    const fetchUserDetails = async () => {
      try {
        const users = [];
        for (const id of memberId) {
          const response = await fetch(`http://localhost:8000/user/${id}`);
          const data = await response.json();

          if (response.ok) {
            users.push(data);
          } else {
            console.log("error fetching user info", response.status.message);
          }
        }
        setUsersDetail(users);
      } catch (error) {
        console.log("error fetching user info", error);
      }
    };

    fetchUserDetails();
  }, [memberId]);

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
        console.log("danh sách nguoi dung:", users);
        return users;
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu:", error);
        return null;
      }
    };
    getDetailUserInGroup();
  }, []);

  const handleDeleteMember = async (groupId, userId) => {
    try {
      const response = await fetch(`http://localhost:8000/leave-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupId, userId: userId }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi xóa thành viên");
      }

      const data = await response.json();
      console.log("Xóa thành viên thành công:", data);
    } catch (error) {
      console.error("Lỗi khi xóa thành viên:", error);
    }
    // Cập nhật lại danh sách thành viên
    const newMemberIds = memberId.filter((id) => id !== userId);
    setMemberId(newMemberIds);
    // Cập nhật lại danh sách thành viên
  };

  const handleDeleteGroup = async (groupId, leaderId) => {
    try {
      const response = await fetch(`http://localhost:8000/delete-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupId, leaderId: leaderId }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi xóa nhóm");
        Alert.alert("Error", "Lỗi xóa nhóm");
      }

      const data = await response.json();
      console.log("Xóa nhóm thành công:", data);
      Alert.alert("Success", "Xóa nhóm thành công");
    } catch (error) {
      console.error("Lỗi khi xóa nhóm:", error);
      Alert.alert("Error", "Lỗi xóa nhóm");
    }
    // Cập nhật lại danh sách thành viên
    const newMemberIds = memberId.filter((id) => id !== leaderId);
    setMemberId(newMemberIds);
    // Cập nhật lại danh sách thành viên
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      const response = await fetch(`http://localhost:8000/leave-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupId, userId: userId }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi rời nhóm");
        Alert.alert("Error", "Lỗi rời nhóm");
      }

      const data = await response.json();
      console.log("Rời nhóm thành công:", data);
      Alert.alert("Success", "Rời nhóm thành công");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Lỗi khi rời nhóm:", error);
      Alert.alert("Error", "Lỗi rời nhóm");
    }
  };

  const baseUrl = "/Users/nganle/Downloads/realtime-chat-app/BackEnd/";

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginLeft: 10,
          }}
        >
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 30, fontWeight: 500, marginTop: 20 }}>
          Nhóm {group.name}
        </Text>
      </View>
      <Text
        style={{ fontSize: 20, fontWeight: 500, marginTop: 30, marginLeft: 20 }}
      >
        Thành viên:
      </Text>
      <ScrollView style={{ maxHeight: "50%" }}>
        {usersDetail.map((user) => (
          <View
            key={user._id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              margin: 10,
              borderRadius: 10,
              backgroundColor: "#fff",
              padding: 10,
              // đổ bóng cho view thành viên
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
            <View style={{ flex: 1.5,  }}>
              <Image
                source={{ uri: baseUrl + user.image }}
                style={{ width: 30, height: 30, borderRadius: 25 }}
              />
            </View>
            <View style={{ flex: 5.5,  }}>
              <Text style={{ fontSize: 18, marginLeft: 10 }}>{user.name}</Text>
            </View>
            {/* nếu là admin thì hiển thị badge admin */}
            <View style={{ flex: 3 }}>
              {user._id === group.leader ? (
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#7ef",
                    alignItems: "center",
                    marginLeft: 10,
                    padding: 5,
                    borderRadius: 5,
                  }}
                >
                  <FontAwesome5 name="key" size={16} color="orange" />
                  <Text
                    style={{
                      // backgroundColor: "red",
                      color: "black",
                      padding: 5,
                      borderRadius: 5,
                      marginLeft: 5,
                      fontWeight: 700,
                      marginRight:5,
                    }}
                  >
                    Admin
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", borderRadius: 10 }}>
                  {/* <Text
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    padding: 5,
                    borderRadius: 5,
                    marginLeft: 10,
                    fontWeight: 700,
                  }}
                >
                  Member
                </Text> */}
                  <TouchableOpacity
                    onPress={() => handleDeleteMember(group._id, user._id)}
                    style={{width:'80%', height:'70%', justifyContent:'center', alignItems:'center'}}
                  >
                    <Text
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: 5,
                        borderRadius: 5,
                        marginLeft: 10,
                      }}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ justifyContent: "center", alignItems: "center" }}>
        {/* // nút thêm thành viên */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AddMemberScreen", {
              groupmembers: group.members,
              groupId: groupId,
            });
          }}
          style={{
            backgroundColor: "blue",
            width: "90%",
            height: 50,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
            Thêm thành viên
          </Text>
        </TouchableOpacity>

        {/* nút rời nhóm */}
        <TouchableOpacity
          onPress={() => {
            handleLeaveGroup(group._id);
          }}
          style={{
            backgroundColor: "red",
            width: "90%",
            height: 50,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
            Rời nhóm
          </Text>
        </TouchableOpacity>
      </View>
      {/* nếu là leader thì hiển thị xoá nhóm. nếu là member thì hiển thị rời nhóm */}
    </View>
  );
};

export default GroupInfoScreen;
