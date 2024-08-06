import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export default function AddMemberGroupScreen({ route }) {
  const { groupmembers, groupId } = route.params;
  console.log("groupmembers:", groupmembers);
  console.log("groupId:", groupId);
  const [usersAdd, setUsersAdd] = React.useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    // lấy tất cả user từ server
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/user");
        const data = await response.json();

        const users = data.map((user) => {
          return {
            _id: user._id,
            name: user.name,
            image: user.image,
          };
        });
        // lọc ra những user chưa có trong group
        const newUsers = users.filter(
          (user) => !groupmembers.find((member) => member._id === user._id)
        );
        setUsersAdd(newUsers);
      } catch (error) {
        console.log("error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleAddMember = async (groupId, userId) => {
    try {
      const response = await fetch(`http://localhost:8000/add-user-to-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupId, userId: userId }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("add member successfully", data);
        Alert.alert("Success", "Add member successfully");
        // quay lại màn hình trước đó
      } else {
        console.log("error add member", data);
        Alert.alert("Error", "Add member error");
      }
    } catch (error) {
      console.log("error add member", error);
      Alert.alert("Error", "Add member error");
    }
    // cập nhật lại danh sách usersAdd
    const newUsers = usersAdd.filter((user) => user._id !== userId);
    setUsersAdd(newUsers);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ maxHeight: "70%", marginTop: "10%" }}>
        {/* hiển thi danh sách thành viên trong Group */}
        {usersAdd.map((member) => (
          <View
            key={member._id}
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <TouchableOpacity
              onPress={() => handleAddMember(groupId, member._id)}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "90%",
                height: 60,
                borderRadius: 10,
                backgroundColor: "#fff",
                marginTop: 15,
                // đổ bóng cho thành viên
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: "20%",
                }}
              >
                {/* <Image
                  source={{ uri: member.image }}
                  style={{ width: 50, height: 50, borderRadius: 50 / 2 }}
                /> */}
                <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 600 }}>
                  {member.name}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={{width:'100%', height:10,}}></View>
          </View>
        ))}
      </ScrollView>
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("GroupChat", { groupId: groupId })}
          style={{
            alignItems: "center",
            justifyContent:'center',
            backgroundColor: "green",
            width: "40%",
            height:50,
            marginTop:25,
            borderRadius:10,
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: 600, color:"white"}}>Exit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
