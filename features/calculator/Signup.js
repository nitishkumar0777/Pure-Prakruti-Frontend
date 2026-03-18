import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsOtpVerified,
  sendNumberAsync,
  signupAsync,
  verifyOtpAsync,
} from "./calculatorSlice";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const SignupScreen = () => {
  const [isLoading, setIsLoading]                 = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    userName: "", mobileNumber: "", pin: "", confirmPin: "", otp: "",
  });
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [timer, setTimer]         = useState(60);

  const navigation      = useNavigation();
  const dispatch        = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOtpVerified   = useSelector(selectIsOtpVerified);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
      navigation.navigate("Calculator");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let interval;
    if (isOTPSent && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      setIsOTPSent(false);
    }
    return () => clearInterval(interval);
  }, [isOTPSent, timer]);

  const handleInputChange = (f, v) => setFormValues((p) => ({ ...p, [f]: v }));

  const handleSendOtp = () => {
    if (formValues.mobileNumber.length !== 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit mobile number");
      return;
    }
    dispatch(sendNumberAsync({ mobileNumber: formValues.mobileNumber }));
    setIsOTPSent(true);
    setTimer(60);
  };

  const handleSubmit = async () => {
    if (!formValues.userName || !formValues.mobileNumber || !formValues.pin) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    if (formValues.pin !== formValues.confirmPin) {
      Alert.alert("Error", "PINs do not match!");
      return;
    }
    if (!formValues.otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify OTP
      const otpResponse = await dispatch(
        verifyOtpAsync({ otp: formValues.otp, mobileNumber: formValues.mobileNumber })
      ).unwrap();

      if (!otpResponse?.success) {
        Alert.alert("Error", "OTP verification failed!");
        setIsLoading(false);
        return;
      }

      // 2. Register user
      const signupResponse = await dispatch(signupAsync(formValues)).unwrap();

      if (signupResponse?.data?.userId) {
        // 3. Navigate to VehicleRegistrationScreen with userId
        navigation.navigate("VehicleRegistration", {
          userId: signupResponse.data.userId,
        });
      } else {
        Alert.alert("Error", "Signup failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", error?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../../assets/images/Pure Prakriti bg img.jpg")}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.centerContent}>
              <Image source={require("../../assets/images/pureP.png")} style={styles.logo} />
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up with your WhatsApp Number</Text>
            </View>

            <View style={styles.formWrapper}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={formValues.userName}
                  onChangeText={(t) => handleInputChange("userName", t)}
                />
              </View>

              <Text style={styles.label}>PIN</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 4-digit PIN"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                  value={formValues.pin}
                  onChangeText={(t) => handleInputChange("pin", t)}
                />
              </View>

              <Text style={styles.label}>Confirm PIN</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm PIN"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                  value={formValues.confirmPin}
                  onChangeText={(t) => handleInputChange("confirmPin", t)}
                />
              </View>

              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter mobile number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={formValues.mobileNumber}
                  onChangeText={(t) => handleInputChange("mobileNumber", t)}
                  editable={!isOtpVerified}
                />
              </View>

              {isOTPSent && (
                <View>
                  <Text style={styles.label}>Enter OTP</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="key-outline" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 4-digit OTP"
                      keyboardType="numeric"
                      maxLength={4}
                      onChangeText={(t) => handleInputChange("otp", t)}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.otpButton}
                onPress={handleSendOtp}
                disabled={isOTPSent}
              >
                <Text style={styles.otpText}>
                  {isOTPSent ? `Resend OTP in ${timer}s` : "Send OTP"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#0d47a1", "#1976d2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Signup</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={styles.signupContainer}
              >
                <Text style={styles.signupText}>Already have an account?</Text>
                <Text style={styles.signupLink}> Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {!isKeyboardVisible && (
          <View style={styles.footerContainer}>
            <Text style={styles.termsText}>
              By logging in, you agree to our{" "}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("TermsScreen")}
              >
                Terms & Conditions
              </Text>
            </Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer:   { flex: 1 },
  imageBackground: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  scrollContainer: {
    flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 40,
  },
  centerContent: { alignItems: "center", marginBottom: 25 },
  logo:          { width: 140, height: 140, resizeMode: "contain", marginBottom: 12 },
  title:         { fontSize: 28, fontWeight: "bold", color: "#8B0000", letterSpacing: 0.5 },
  subtitle:      { fontSize: 14, color: "#444", marginTop: 5 },
  formWrapper: {
    padding: 20, backgroundColor: "#fff", borderRadius: 18,
    shadowColor: "#000", shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 4,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 4 },
  inputContainer: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#ddd", borderRadius: 12, backgroundColor: "#f9f9f9",
    marginBottom: 8, paddingHorizontal: 10,
  },
  inputIcon:        { marginRight: 6 },
  input:            { flex: 1, height: 42, fontSize: 14 },
  otpButton:        { alignSelf: "flex-end", marginBottom: 10 },
  otpText:          { color: "#0d47a1", fontWeight: "600" },
  submitButton: {
    height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center",
    marginVertical: 12, shadowColor: "#0d47a1", shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 4, elevation: 3,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 1 },
  signupContainer:  { flexDirection: "row", justifyContent: "center", marginTop: 6 },
  signupText:       { fontSize: 12, color: "#555" },
  signupLink:       { fontSize: 12, fontWeight: "700", color: "#0d47a1" },
  footerContainer:  { marginBottom: 15, alignItems: "center", paddingVertical: 8 },
  termsText:        { fontSize: 11, color: "#666", textAlign: "center" },
  linkText:         { color: "#0d47a1", fontWeight: "600", textDecorationLine: "underline" },
});

export default SignupScreen;

// import React, { useEffect, useState } from "react";
// import {
//   ImageBackground,
//   KeyboardAvoidingView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Image,
//   ActivityIndicator,
//   Alert,
//   TextInput,
//   Keyboard,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   selectIsAuthenticated,
//   selectIsOtpVerified,
//   sendNumberAsync,
//   signupAsync,
//   verifyOtpAsync,
// } from "./calculatorSlice";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";

// const SignupScreen = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [formValues, setFormValues] = useState({
//     userName: "",
//     mobileNumber: "",
//     pin: "",
//     confirmPin: "",
//     otp: "",
//   });
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const [isOTPSent, setIsOTPSent] = useState(false);
//   const [timer, setTimer] = useState(30);

//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const isOtpVerified = useSelector(selectIsOtpVerified);

//   useEffect(() => {
//     const showSub = Keyboard.addListener("keyboardDidShow", () =>
//       setIsKeyboardVisible(true)
//     );
//     const hideSub = Keyboard.addListener("keyboardDidHide", () =>
//       setIsKeyboardVisible(false)
//     );
//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   useEffect(() => {
//     if (isAuthenticated) {
//       setIsLoading(false);
//       navigation.navigate("Calculator");
//     }
//   }, [isAuthenticated]);

//   useEffect(() => {
//     let interval;
//     if (isOTPSent && timer > 0) {
//       interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//     } else if (timer === 0) {
//       clearInterval(interval);
//       setIsOTPSent(false);
//     }
//     return () => clearInterval(interval);
//   }, [isOTPSent, timer]);

//   const handleInputChange = (field, value) => {
//     setFormValues((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSendOtp = () => {
//     if (formValues.mobileNumber.length !== 10) {
//       Alert.alert("Invalid", "Please enter a valid 10-digit mobile number");
//       return;
//     }
//     dispatch(sendNumberAsync({ mobileNumber: formValues.mobileNumber }));
//     setIsOTPSent(true);
//     setTimer(60);
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     if (!formValues.userName || !formValues.mobileNumber || !formValues.pin) {
//       Alert.alert("Error", "All fields are required!");
//       setIsLoading(false);
//       return;
//     }
//     if (formValues.pin !== formValues.confirmPin) {
//       Alert.alert("Error", "PINs do not match!");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const otpResponse = await dispatch(
//         verifyOtpAsync({
//           otp: formValues.otp,
//           mobileNumber: formValues.mobileNumber,
//         })
//       ).unwrap();

//       if (!otpResponse.success) {
//         Alert.alert("Error", "OTP verification failed!");
//         setIsLoading(false);
//         return;
//       }

//       const signupResponse = await dispatch(signupAsync(formValues)).unwrap();
//       if (signupResponse) {
//         navigation.navigate("Calculator");
//       } else {
//         Alert.alert("Error", "Signup failed!");
//       }
//     } catch (error) {
//       console.error("API Error:", error);
//       Alert.alert("Error", "Something went wrong!");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.mainContainer}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         <View style={styles.overlay} />

//         <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
//           <ScrollView contentContainerStyle={styles.scrollContainer}  showsVerticalScrollIndicator={false}>
//             {/* Logo + Heading */}
//             <View style={styles.centerContent}>
//               <Image
//                 source={require("../../assets/images/pureP.png")}
//                 style={styles.logo}
//               />
//               <Text style={styles.title}>Create Account</Text>
//               <Text style={styles.subtitle}>
//                 Sign up with your WhatsApp Number
//               </Text>
//             </View>

//             {/* Signup Form */}
//             <View style={styles.formWrapper}>
//               {/* Username */}
//               <Text style={styles.label}>Username</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="person-outline"
//                   size={20}
//                   color="#888"
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter username"
//                   value={formValues.userName}
//                   onChangeText={(t) => handleInputChange("userName", t)}
//                 />
//               </View>

//               {/* PIN */}
//               <Text style={styles.label}>PIN</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="lock-closed-outline"
//                   size={20}
//                   color="#888"
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter 4-digit PIN"
//                   secureTextEntry
//                   keyboardType="numeric"
//                   value={formValues.pin}
//                   onChangeText={(t) => handleInputChange("pin", t)}
//                 />
//               </View>

//               {/* Confirm PIN */}
//               <Text style={styles.label}>Confirm PIN</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="lock-closed-outline"
//                   size={20}
//                   color="#888"
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Confirm PIN"
//                   secureTextEntry
//                   keyboardType="numeric"
//                   value={formValues.confirmPin}
//                   onChangeText={(t) => handleInputChange("confirmPin", t)}
//                 />
//               </View>

//               {/* Mobile Number */}
//               <Text style={styles.label}>Mobile Number</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="call-outline"
//                   size={20}
//                   color="#888"
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter mobile number"
//                   keyboardType="numeric"
//                   value={formValues.mobileNumber}
//                   onChangeText={(t) => handleInputChange("mobileNumber", t)}
//                   editable={!isOtpVerified}
//                 />
//               </View>

//               {/* OTP Section */}
//               {isOTPSent && (
//                 <View>
//                   <Text style={styles.label}>Enter OTP</Text>
//                   <View style={styles.inputContainer}>
//                     <Ionicons
//                       name="key-outline"
//                       size={20}
//                       color="#888"
//                       style={styles.inputIcon}
//                     />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Enter OTP"
//                       keyboardType="numeric"
//                       maxLength={4}
//                       onChangeText={(t) => handleInputChange("otp", t)}
//                     />
//                   </View>
//                 </View>
//               )}

//               {/* Send OTP / Resend OTP */}
//               <TouchableOpacity
//                 style={styles.otpButton}
//                 onPress={handleSendOtp}
//                 disabled={isOTPSent}
//               >
//                 <Text style={styles.otpText}>
//                   {isOTPSent ? `Resend OTP in ${timer}s` : "Send OTP"}
//                 </Text>
//               </TouchableOpacity>

//               {/* Signup Button */}
//               <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
//                 <LinearGradient
//                   colors={["#0d47a1", "#1976d2"]}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={styles.submitButton}
//                 >
//                   {isLoading ? (
//                     <ActivityIndicator size="small" color="#fff" />
//                   ) : (
//                     <Text style={styles.submitButtonText}>Signup</Text>
//                   )}
//                 </LinearGradient>
//               </TouchableOpacity>

//               {/* Login Link */}
//               <TouchableOpacity
//                 onPress={() => navigation.navigate("Login")}
//                 style={styles.signupContainer}
//               >
//                 <Text style={styles.signupText}>Already have an account?</Text>
//                 <Text style={styles.signupLink}> Login</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>

//         {/* Footer Logos */}
//         {!isKeyboardVisible && (
//           <View style={styles.footerContainer}>
//             <Text style={styles.termsText}>
//               By logging in, you agree to our{' '}
//               <Text
//                 style={styles.linkText}
//                 onPress={() => navigation.navigate('TermsScreen')}
//               >
//                 Terms & Conditions
//               </Text>
//             </Text>
//           </View>
//         )}
//       </ImageBackground>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   mainContainer: { flex: 1 },
//   imageBackground: { flex: 1, },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.6)",
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 40,
//   },
//   centerContent: { alignItems: "center", marginBottom: 25 },
//   logo: { width: 140, height: 140, resizeMode: "contain", marginBottom: 12 },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#8B0000",
//     letterSpacing: 0.5,
//   },
//   subtitle: { fontSize: 14, color: "#444", marginTop: 5 },
//   formWrapper: {
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 18,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 4,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 12,
//     backgroundColor: "#f9f9f9",
//     marginBottom: 8,
//     paddingHorizontal: 10,
//   },
//   inputIcon: { marginRight: 6 },
//   input: { flex: 1, height: 42, fontSize: 14 },
//   otpButton: { alignSelf: "flex-end", marginBottom: 10 },
//   otpText: { color: "#0d47a1", fontWeight: "600" },
//   submitButton: {
//     height: 46,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 12,
//     shadowColor: "#0d47a1",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   submitButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 1,
//   },
//   signupContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 6,
//   },
//   signupText: { fontSize: 12, color: "#555" },
//   signupLink: { fontSize: 12, fontWeight: "700", color: "#0d47a1" },
//   footerContainer: {
//     marginBottom: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//   },
//   termsText: {
//     fontSize: 11,
//     color: '#666',
//     textAlign: 'center',
//   },
//   linkText: {
//     color: '#0d47a1',
//     fontWeight: '600',
//     textDecorationLine: 'underline',
//   },
// });

// export default SignupScreen;



