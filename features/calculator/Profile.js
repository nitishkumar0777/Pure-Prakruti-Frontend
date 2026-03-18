import React, { useEffect } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { selectUserInfo, logout } from "./calculatorSlice";

const ProfileScreen = () => {
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();

  // ✅ Use userInfo directly (not userInfo?.data?.data)
  const user = userInfo || {};

  useEffect(() => {
    console.log("📌 Full User Info:", userInfo);
    console.log("✅ Parsed User:", user);
  }, [userInfo]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/Pure Prakriti bg img.jpg")}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <View style={styles.overlay} />

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.contentContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                {user?.profileImage?.[0] ? (
                  <Image
                    source={{ uri: user.profileImage[0] }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <FontAwesome name="user-o" size={40} color="black" />
                )}
              </View>

              {/* Main Info */}
              <Text style={styles.nameText}>{user.userName || "Name"}</Text>
              <Text style={styles.mobileText}>
                {user.mobileNumber ? `Mob No. :- ${user.mobileNumber}` : "Mobile Number"}
              </Text>

              {/* Other Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailItem}>
                  <Text style={styles.label}> ID: </Text>
                  {user.userId || "-"}
                </Text>
              </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  imageBackground: { flex: 1, alignItems: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(247, 238, 243, 0.6)",
  },
  headerContainer: {
    width: "100%",
    height: "15%",
    backgroundColor: "#006400",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  headerText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: { alignItems: "center", paddingBottom: 60 },

  // 🔥 3D Card
  profileCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    transform: [{ perspective: 1000 }, { scale: 1.02 }],
  },
  avatarContainer: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 50,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  avatarImage: { width: 70, height: 70, borderRadius: 35 },
  nameText: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
  mobileText: { fontSize: 18, color: "#666", marginBottom: 15 },

  detailsContainer: { width: "100%", marginTop: 10, alignItems: "center" },
  detailItem: { fontSize: 16, color: "#333", marginBottom: 8 },
  label: { fontWeight: "600", color: "#555" },

  logoutButton: {
    marginTop: 20,
    backgroundColor: "#b22222",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default ProfileScreen;



// import React, { useEffect } from "react";
// import {
//   ImageBackground,
//   KeyboardAvoidingView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   Platform,
//   SafeAreaView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUserInfo, logout } from "./calculatorSlice";

// const ProfileScreen = () => {
//   const userInfo = useSelector(selectUserInfo);
//   const dispatch = useDispatch();

//   const user = userInfo?.data?.data || {};

//   useEffect(() => {
//     console.log("📌 Full User Info:", userInfo);
//     console.log("✅ Parsed User:", user);
//   }, [userInfo]);

//   const handleLogout = () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
//     ]);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>Profile</Text>
//         </View>

//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={styles.contentContainer}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             {/* Single Profile Card */}
//             <View style={styles.profileCard}>
//               {/* Avatar */}
//               <View style={styles.avatarContainer}>
//                 {user?.profileImage?.[0] ? (
//                   <Image
//                     source={{ uri: user.profileImage[0] }}
//                     style={styles.avatarImage}
//                   />
//                 ) : (
//                   <FontAwesome name="user-o" size={40} color="black" />
//                 )}
//               </View>

//               {/* Main Info */}
//               <Text style={styles.nameText}>{user.userName || "Name"}</Text>
//               <Text style={styles.mobileText}>
//                 {user.mobileNumber ? `Mob No. :- ${user.mobileNumber}` : "Mobile Number"}
//               </Text>

//               {/* Other Details */}
//               <View style={styles.detailsContainer}>
//                 <Text style={styles.detailItem}>
//                   <Text style={styles.label}> ID: </Text>
//                   {user.userId || "-"}
//                 </Text>
//                 {/* Hide token by default */}
//                 {/* <Text style={styles.detailItem}>
//                   <Text style={styles.label}>Token: </Text>
//                   {user.token}
//                 </Text> */}
//               </View>
//             </View>

//             {/* Logout */}
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f0f0f0" },
//   imageBackground: { flex: 1, alignItems: "center" },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(247, 238, 243, 0.6)",
//   },
//   headerContainer: {
//     width: "100%",
//     height: "15%",
//     backgroundColor: "#006400",
//     justifyContent: "center",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   headerText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
//   contentContainer: {
//     flex: 1,
//     width: "100%",
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   scrollContent: { alignItems: "center", paddingBottom: 60 },

//   // 🔥 Single 3D Card
//   profileCard: {
//     width: "90%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 20,
//     marginVertical: 15,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.25,
//     shadowRadius: 12,
//     elevation: 12,
//     transform: [{ perspective: 1000 }, { scale: 1.02 }], // 3D effect
//   },
//   avatarContainer: {
//     backgroundColor: "#f5f5f5",
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   avatarImage: { width: 70, height: 70, borderRadius: 35 },
//   nameText: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
//   mobileText: { fontSize: 18, color: "#666", marginBottom: 15 },

//   detailsContainer: { width: "100%", marginTop: 10, alignItems: "center", },
//   detailItem: { fontSize: 16, color: "#333", marginBottom: 8 },
//   label: { fontWeight: "600", color: "#555" },

//   logoutButton: {
//     marginTop: 20,
//     backgroundColor: "#b22222",
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   logoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
// });

// export default ProfileScreen;


// import React, { useEffect } from "react";
// import {
//   ImageBackground,
//   KeyboardAvoidingView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   Platform,
//   SafeAreaView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUserInfo, logout } from "./calculatorSlice";

// const ProfileScreen = () => {
//   const userInfo = useSelector(selectUserInfo);
//   const dispatch = useDispatch();

//   // ✅ unwrap nested user data
//   const user = userInfo?.data?.data || {};

//   // 🔥 Log both full & parsed user
//   useEffect(() => {
//     console.log("📌 Full User Info:", userInfo);
//     console.log("✅ Parsed User:", user);
//   }, [userInfo]);

//   const handleLogout = () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
//     ]);
//   };

//   // Fields to display (Token hidden by default)
//   const fields = [
//     { label: "User Name", value: user.userName },
//     { label: "Base Username", value: user.baseUsername },
//     { label: "Mobile Number", value: user.mobileNumber },
//     { label: "User ID", value: user.userId },
//     // { label: "Token", value: user.token }, // uncomment only if you want to see token
//   ].filter((item) => item.value);

//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         {/* Overlay */}
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>Profile</Text>
//         </View>

//         {/* Main Content */}
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={styles.contentContainer}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             {/* Profile Card */}
//             <View style={styles.card}>
//               <View style={styles.avatarContainer}>
//                 {user?.profileImage?.[0] ? (
//                   <Image
//                     source={{ uri: user.profileImage[0] }}
//                     style={styles.avatarImage}
//                   />
//                 ) : (
//                   <FontAwesome name="user-o" size={40} color="black" />
//                 )}
//               </View>
//               <Text style={styles.nameText}>{user.userName || "Name"}</Text>
//               <Text style={styles.mobileText}>
//                 {user.mobileNumber ? `No. :- ${user.mobileNumber}` : "Mobile Number"}
//               </Text>
//             </View>

//             {/* Dynamic Info Cards */}
//             {fields.map((item, index) => (
//               <View key={index} style={styles.card}>
//                 <Text style={styles.labelText}>{item.label}</Text>
//                 <Text style={styles.infoText}>{item.value}</Text>
//               </View>
//             ))}

//             {/* Logout Button */}
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f0f0f0" },
//   imageBackground: { flex: 1, alignItems: "center" },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(247, 238, 243, 0.6)",
//   },
//   headerContainer: {
//     width: "100%",
//     height: "15%",
//     backgroundColor: "#006400",
//     justifyContent: "center",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   headerText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
//   contentContainer: {
//     flex: 1,
//     width: "100%",
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   scrollContent: { alignItems: "center", paddingBottom: 60 },
//   card: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//     marginVertical: 10,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   avatarContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   avatarImage: { width: 60, height: 60, borderRadius: 30 },
//   nameText: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
//   mobileText: { fontSize: 18, color: "#666" },
//   labelText: { fontSize: 16, color: "#888", marginBottom: 5 },
//   infoText: { fontSize: 18, fontWeight: "500", color: "#333" },

//   logoutButton: {
//     marginTop: 20,
//     backgroundColor: "#b22222",
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   logoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
// });

// export default ProfileScreen;


// import React, { useEffect } from "react";
// import {
//   ImageBackground,
//   KeyboardAvoidingView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   Platform,
//   SafeAreaView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUserInfo, logout } from "./calculatorSlice"; // ✅ add logout action

// const ProfileScreen = () => {
//   const userInfo = useSelector(selectUserInfo);
//   const dispatch = useDispatch();

//   // 🔥 Log full user info when component loads
//   useEffect(() => {
//     console.log("📌 Full User Info:", userInfo);
//   }, [userInfo]);

//   const handleLogout = () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
//     ]);
//   };

//   // Fields to display
//   const fields = [
//     { label: "User Name", value: userInfo?.userName },
//     { label: "Mobile Number", value: userInfo?.mobileNumber },
//     { label: "Email", value: userInfo?.email },
//     { label: "Account Type", value: userInfo?.type },
//     { label: "PAN Number", value: userInfo?.panNumber },
//     { label: "Aadhar Number", value: userInfo?.aadharNumber },
//     { label: "Created At", value: userInfo?.createdAt },
//     { label: "Updated At", value: userInfo?.updatedAt },
//   ].filter((item) => item.value);

//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         {/* Overlay */}
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>Profile</Text>
//         </View>

//         {/* Main Content */}
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={styles.contentContainer}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             {/* Profile Card */}
//             <View style={styles.card}>
//               <View style={styles.avatarContainer}>
//                 {userInfo?.profileImage?.[0] ? (
//                   <Image
//                     source={{ uri: userInfo.profileImage[0] }}
//                     style={styles.avatarImage}
//                   />
//                 ) : (
//                   <FontAwesome name="user-o" size={40} color="black" />
//                 )}
//               </View>
//               <Text style={styles.nameText}>
//                 {userInfo?.userName || "Name"}
//               </Text>
//               <Text style={styles.mobileText}>
//                 {userInfo?.mobileNumber
//                   ? `No. :- ${userInfo.mobileNumber}`
//                   : "Mobile Number"}
//               </Text>
//             </View>

//             {/* Dynamic Info Cards */}
//             {fields.map((item, index) => {
//               // 🔥 Log each field
//               console.log(`📌 ${item.label}:`, item.value);

//               return (
//                 <View key={index} style={styles.card}>
//                   <Text style={styles.labelText}>{item.label}</Text>
//                   <Text style={styles.infoText}>{item.value}</Text>
//                 </View>
//               );
//             })}

//             {/* Logout Button */}
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f0f0f0" },
//   imageBackground: { flex: 1, alignItems: "center" },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(247, 238, 243, 0.6)",
//   },
//   headerContainer: {
//     width: "100%",
//     height: "15%",
//     backgroundColor: "#006400",
//     justifyContent: "center",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   headerText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
//   contentContainer: {
//     flex: 1,
//     width: "100%",
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   scrollContent: { alignItems: "center", paddingBottom: 60 },
//   card: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//     marginVertical: 10,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   avatarContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   avatarImage: { width: 60, height: 60, borderRadius: 30 },
//   nameText: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
//   mobileText: { fontSize: 18, color: "#666" },
//   labelText: { fontSize: 16, color: "#888", marginBottom: 5 },
//   infoText: { fontSize: 18, fontWeight: "500", color: "#333" },

//   logoutButton: {
//     marginTop: 20,
//     backgroundColor: "#b22222",
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   logoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
// });

// export default ProfileScreen;


// import React, { useEffect } from "react";
// import {
//   ImageBackground,
//   KeyboardAvoidingView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   Platform,
//   SafeAreaView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUserInfo, logout } from "./calculatorSlice"; // ✅ add logout action

// const ProfileScreen = () => {
//   const userInfo = useSelector(selectUserInfo);
//   const dispatch = useDispatch();

//   // ✅ Console log full user data once screen loads or when userInfo changes
//   useEffect(() => {
//     if (userInfo) {
//       console.log("🔎 Full User Data:", JSON.stringify(userInfo, null, 2));
//     } else {
//       console.log("⚠️ No user data found");
//     }
//   }, [userInfo]);

//   const handleLogout = () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
//     ]);
//   };

//   // Fields to display
//   const fields = [
//     { label: "User Name", value: userInfo?.userName },
//     { label: "Mobile Number", value: userInfo?.mobileNumber },
//     { label: "Email", value: userInfo?.email },
//     { label: "Account Type", value: userInfo?.type },
//     { label: "PAN Number", value: userInfo?.panNumber },
//     { label: "Aadhar Number", value: userInfo?.aadharNumber },
//     { label: "Created At", value: userInfo?.createdAt },
//     { label: "Updated At", value: userInfo?.updatedAt },
//   ].filter((item) => item.value);

//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>Profile</Text>
//         </View>

//         {/* Content */}
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={styles.contentContainer}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             {/* Profile Card */}
//             <View style={styles.card}>
//               <View style={styles.avatarContainer}>
//                 {userInfo?.profileImage?.[0] ? (
//                   <Image
//                     source={{ uri: userInfo.profileImage[0] }}
//                     style={styles.avatarImage}
//                   />
//                 ) : (
//                   <FontAwesome name="user-o" size={40} color="black" />
//                 )}
//               </View>
//               <Text style={styles.nameText}>
//                 {userInfo?.userName || "Name"}
//               </Text>
//               <Text style={styles.mobileText}>
//                 {userInfo?.mobileNumber
//                   ? `No. :- ${userInfo.mobileNumber}`
//                   : "Mobile Number"}
//               </Text>
//             </View>

//             {/* Dynamic Info Cards */}
//             {fields.map((item, index) => (
//               <View key={index} style={styles.card}>
//                 <Text style={styles.labelText}>{item.label}</Text>
//                 <Text style={styles.infoText}>{item.value}</Text>
//               </View>
//             ))}

//             {/* Logout Button */}
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f0f0f0" },
//   imageBackground: { flex: 1, alignItems: "center" },
//   overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(247, 238, 243, 0.6)" },
//   headerContainer: {
//     width: "100%",
//     height: "15%",
//     backgroundColor: "#006400",
//     justifyContent: "center",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   headerText: { color: "#fff", fontSize: 26, fontWeight: "bold", letterSpacing: 1 },
//   contentContainer: { flex: 1, width: "100%", marginTop: 20, paddingHorizontal: 20 },
//   scrollContent: { alignItems: "center", paddingBottom: 60 },
//   card: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//     marginVertical: 10,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   avatarContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   avatarImage: { width: 60, height: 60, borderRadius: 30 },
//   nameText: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
//   mobileText: { fontSize: 18, color: "#666" },
//   labelText: { fontSize: 16, color: "#888", marginBottom: 5 },
//   infoText: { fontSize: 18, fontWeight: "500", color: "#333" },
//   logoutButton: {
//     marginTop: 20,
//     backgroundColor: "#b22222",
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   logoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
// });

// export default ProfileScreen;


// import React from "react";
// import {
//   ImageBackground,
//   KeyboardAvoidingView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   Platform,
//   SafeAreaView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { useSelector, useDispatch } from "react-redux";
// import { selectUserInfo, logout } from "./calculatorSlice"; // ✅ add logout action

// const ProfileScreen = () => {
//   const userInfo = useSelector(selectUserInfo);
//   const dispatch = useDispatch();

//   const handleLogout = () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
//     ]);
//   };

//   // Fields to display (you can add more depending on API)
//   const fields = [
//     { label: "User Name", value: userInfo?.userName },
//     { label: "Mobile Number", value: userInfo?.mobileNumber },
//     { label: "Email", value: userInfo?.email },
//     { label: "Account Type", value: userInfo?.type },
//     { label: "PAN Number", value: userInfo?.panNumber },
//     { label: "Aadhar Number", value: userInfo?.aadharNumber },
//     { label: "Created At", value: userInfo?.createdAt },
//     { label: "Updated At", value: userInfo?.updatedAt },
//   ].filter((item) => item.value); // remove empty/null values

//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         {/* Overlay */}
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>Profile</Text>
//         </View>

//         {/* Main Content */}
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={styles.contentContainer}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             {/* Profile Card */}
//             <View style={styles.card}>
//               <View style={styles.avatarContainer}>
//                 {userInfo?.profileImage?.[0] ? (
//                   <Image
//                     source={{ uri: userInfo.profileImage[0] }}
//                     style={styles.avatarImage}
//                   />
//                 ) : (
//                   <FontAwesome name="user-o" size={40} color="black" />
//                 )}
//               </View>
//               <Text style={styles.nameText}>
//                 {userInfo?.userName || "Name"}
//               </Text>
//               <Text style={styles.mobileText}>
//                 {userInfo?.mobileNumber
//                   ? `No. :- ${userInfo.mobileNumber}`
//                   : "Mobile Number"}
//               </Text>
//             </View>

//             {/* Dynamic Info Cards */}
//             {fields.map((item, index) => (
//               <View key={index} style={styles.card}>
//                 <Text style={styles.labelText}>{item.label}</Text>
//                 <Text style={styles.infoText}>{item.value}</Text>
//               </View>
//             ))}

//             {/* Logout Button */}
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f0f0f0" },
//   imageBackground: { flex: 1, alignItems: "center" },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(247, 238, 243, 0.6)",
//   },
//   headerContainer: {
//     width: "100%",
//     height: "15%",
//     backgroundColor: "#006400",
//     justifyContent: "center",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   headerText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
//   contentContainer: {
//     flex: 1,
//     width: "100%",
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   scrollContent: { alignItems: "center", paddingBottom: 60 },
//   card: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//     marginVertical: 10,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   avatarContainer: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   avatarImage: { width: 60, height: 60, borderRadius: 30 },
//   nameText: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
//   mobileText: { fontSize: 18, color: "#666" },
//   labelText: { fontSize: 16, color: "#888", marginBottom: 5 },
//   infoText: { fontSize: 18, fontWeight: "500", color: "#333" },

//   logoutButton: {
//     marginTop: 20,
//     backgroundColor: "#b22222",
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   logoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
// });

// export default ProfileScreen;


// import React from 'react';
// import {
//   ImageBackground,
//   KeyboardAvoidingView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { useSelector } from 'react-redux';
// import { selectUserInfo } from './calculatorSlice';

// const ProfileScreen = () => {
//   const userInfo = useSelector(selectUserInfo);

//   return (
//     <View style={styles.container}>
//       <ImageBackground
//         source={require('../../assets/images/Pure Prakriti bg img.jpg')}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         {/* Overlay */}
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>Profile</Text>
//         </View>

//         {/* Main Content */}
//         <KeyboardAvoidingView behavior="padding" style={styles.contentContainer}>
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             {/* Profile Card */}
//             <View style={styles.card}>
//               <View style={styles.avatarContainer}>
//                 <FontAwesome name="user-o" size={40} color="black" />
//               </View>
//               <Text style={styles.nameText}>{userInfo ? userInfo.userName : 'Name'}</Text>
//               <Text style={styles.mobileText}>
//                 {userInfo ? `No. :- ${userInfo.mobileNumber}` : 'Mobile Number'}
//               </Text>
//             </View>

//             {/* Optional Email / Additional Info */}
//             {userInfo?.email && (
//               <View style={styles.card}>
//                 <Text style={styles.labelText}>Email</Text>
//                 <Text style={styles.infoText}>{userInfo.email}</Text>
//               </View>
//             )}
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//   },
//   imageBackground: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(247, 238, 243, 0.6)',
//   },
//   headerContainer: {
//     width: '100%',
//     height: '15%',
//     backgroundColor: '#006400',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   headerText: {
//     color: '#fff',
//     fontSize: 26,
//     fontWeight: 'bold',
//     letterSpacing: 1,
//   },
//   contentContainer: {
//     flex: 1,
//     width: '100%',
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   scrollContent: {
//     alignItems: 'center',
//     paddingBottom: 40,
//   },
//   card: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//     marginVertical: 15,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   avatarContainer: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 50,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   nameText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   mobileText: {
//     fontSize: 18,
//     color: '#666',
//   },
//   labelText: {
//     fontSize: 16,
//     color: '#888',
//     marginBottom: 5,
//   },
//   infoText: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#333',
//   },
// });

// export default ProfileScreen;


// import React, { useState } from 'react';
// import { ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { Formik } from 'formik';
// import { TextInput } from 'react-native';
// import { CheckBox } from 'react-native-elements';
// import { Picker } from '@react-native-picker/picker';
// import * as ImagePicker from 'expo-image-picker';
// // import CheckBox from 'react-native-check-box';
// import { useNavigation } from '@react-navigation/native';
// import { selectCalculator, selectCalculatorError, selectUserInfo } from './calculatorSlice';
// import { useSelector, useDispatch } from 'react-redux';


// const App = () => {
//   const [isChecked, setIsChecked] = useState(false);
//   const [image, setImage] = useState(null);
//   const navigation = useNavigation();
//   const userInfo = useSelector(selectUserInfo);
//   const handleCheckBox = () => {
//     setIsChecked(!isChecked);
//   };
//   const pickImage = async (setFieldValue) => {
//     // No permissions request is necessary for launching the image library
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     // console.log(result);
//     // console.log(result.assets[0].uri);
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setFieldValue('image', result.assets[0].uri);
//     }
//   };

//   const handleSubmit = async (values) => {
//     const formData = new FormData();
//     formData.append('photo', {
//       uri: values.image.uri,
//       name: 'photo.jpg',
//       type: 'image/jpeg',
//     });

//     // Append other form fields to formData if necessary
//     for (const key in values) {
//       if (key !== 'image') {
//         if (key === 'pin' || key === 'mobileNumber') {
//           // Convert pin to a number
//           formData.append(key, Number(values[key]));
//         } else {
//           formData.append(key, values[key]);
//         }
//       }
//     }
//     if (isChecked) {
//       console.log(values);
//       console.log(formData);
//       // Navigate to the next page
//       navigation.navigate('Profile');
//     } else {
//       // Do nothing, stay on the same page
//     }

//     // try {
//     //   const response = await axios.post('http://192.168.1.8:8000/api/v1/upload', formData, {
//     //     headers: {
//     //       'Content-Type': 'multipart/form-data',
//     //     },
//     //   });
//     //   console.log('Upload success', response.data);
//     // } catch (error) {
//     //   console.error('Upload error', error);
//     // }
//   };

//   const cities = [
//     { name: "Los Angeles", id: 1 },
//     { name: "Philadelphia", id: 2 },
//     { name: "Chicago", id: 3 },
//     { name: "Washington DC", id: 4 },
//     { name: "New York", id: 5 },
//     { name: "San Diego", id: 6 },
//     { name: "Fort Worth", id: 7 },
//     { name: "Houston", id: 8 },
//     { name: "Cleveland", id: 9 },
//     { name: "Pittsburg", id: 10 },
//     { name: "Detroit", id: 11 },
//     { name: "Jacksonville", id: 12 },
//     { name: "Denver", id: 13 },
//     { name: "Columbus", id: 14 },
//     { name: "El Paso", id: 15 },
//     { name: "New Orleans", id: 16 },
//     { name: "Cincinnati", id: 17 },
//     { name: "Nashville", id: 18 },
//     { name: "Miami", id: 19 },
//     { name: "Tampa", id: 20 },
//     { name: "Bakersfield", id: 22 },
//     { name: "Tuscon", id: 23 },
//     { name: "Baltimore", id: 25 },
//     { name: "St Louis", id: 26 },
//     { name: "Las Vegas", id: 27 },
//     { name: "Memphis", id: 28 },
//     { name: "Seatle", id: 29 },
//     { name: "San Fransisco", id: 30 },

//   ]

//   return (
//     <View className=" h-[100%] ">
//       <ImageBackground source={require("../../assets/images/Pure Prakriti bg img.jpg")} resizeMode="cover" className="h-[100%] flex items-center">
//         <View style={styles.overlay} />
//         <View className="w-[105%] h-[13%] bg-green-800  flex-row">
//           <Text className="mt-[40px] text-2xl ml-[170px] text-white">Profile</Text>
//         </View>

//         <KeyboardAvoidingView className=" h-[70%] w-[100%] mt-8">
//           <ScrollView>
//             <View className="flex-row mt-[40px]">
//               <View className=" ml-[60px] flex items-center justify-center h-[80px] w-[80px] bg-white rounded-[100px]">
//                 <FontAwesome name="user-o" size={24} color="black" /></View>
//               <Text className="text-2xl mt-5 ml-11">{userInfo ? userInfo.userName : "Name"}</Text>

//             </View>
//             <View className="flex items-center justify-center">
//               <Text className="text-2xl my-10">{userInfo ? `No. :- ${userInfo.mobileNumber}` : "Mobile Number"}</Text>
//               {/* <Text className="text-2xl my-8 ">Email-id</Text> */}
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </View>
//   )
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   image: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   text: {
//     color: 'white',
//     fontSize: 42,
//     lineHeight: 84,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     backgroundColor: '#000000c0',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject, // Covers the entire ImageBackground
//     backgroundColor: 'rgba(247, 238, 243, 0.6)', // Adjust color and opacity
//   },
// });

// export default App;