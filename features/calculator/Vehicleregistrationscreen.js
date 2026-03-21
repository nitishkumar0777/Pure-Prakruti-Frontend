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
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const API_URL = "http://192.168.1.8:4500";
console.log(API_URL);

const FUEL_TYPES    = ["Diesel", "Petrol", "CNG", "ELECTRIC(BOV)"];
const VEHICLE_TYPES = ["Truck", "Car", "Bike", "Bus", "Auto"];

const VehicleRegistrationScreen = () => {
  const navigation = useNavigation();
  const route      = useRoute();
  const userId     = route?.params?.userId;

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: "",
    vehicleType:   "Truck",
    fuelType:      "Diesel",
  });

  const [location, setLocation]               = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError]     = useState(null);
  const [isLoading, setIsLoading]             = useState(false);

  useEffect(() => {
    captureLocation();
  }, []);

  const handleVehicleChange = (field, value) =>
    setVehicleForm((prev) => ({ ...prev, [field]: value }));

  // ── expo-location se GPS + Nominatim reverse geocode (free, no key) ──────
  const captureLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      // Permission request
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission nahi mila. Settings mein jaake allow karo.");
        setLocationLoading(false);
        return;
      }

      // GPS coordinates
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = pos.coords;

      // Reverse geocode via Nominatim — free, no API key needed
      let address = "";
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "User-Agent": "PurePrakritiApp/1.0" } }
        );
        const data = await res.json();
        if (data?.display_name) {
          address = data.display_name.split(",").slice(0, 3).join(", ");
        }
      } catch (_) {
        // address empty rahega — lat/lng phir bhi save hoga
      }

      setLocation({ latitude, longitude, address });
    } catch (err) {
      console.error("Location error:", err.message);
      setLocationError("GPS se location nahi mila. GPS on karo aur retry karo.");
    } finally {
      setLocationLoading(false);
    }
  };

  // ── Vehicle registration API ──────────────────────────────────────────────
  const handleRegisterVehicle = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID missing. Please signup again.");
      return;
    }
    if (!vehicleForm.vehicleNumber.trim()) {
      Alert.alert("Error", "Vehicle number daalo.");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(vehicleForm.vehicleNumber.replace(/\s/g, ""))) {
      Alert.alert("Error", "Vehicle number sirf alphanumeric hona chahiye.");
      return;
    }
    if (!location) {
      Alert.alert("Error", "Location capture nahi hua. Retry karo.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup-vehicle`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId:        userId,
            vehicleNumber: vehicleForm.vehicleNumber.replace(/\s/g, "").toUpperCase(),
            vehicleType:   vehicleForm.vehicleType,
            fuelType:      vehicleForm.fuelType,
            latitude:      location.latitude,
            longitude:     location.longitude,
            address:       location.address,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", "Vehicle register ho gaya!", [
          { text: "OK", onPress: () => navigation.navigate("Dashboard") },
        ]);
      } else if (response.status === 409) {
        navigation.navigate("Dashboard");
      } else {
        Alert.alert("Error", data.error || "Vehicle registration fail ho gayi.");
      }
    } catch (err) {
      console.error("Vehicle registration error:", err);
      Alert.alert("Error", "Kuch galat ho gaya. Dobara try karo.");
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
            {/* Header */}
            <View style={styles.centerContent}>
              <Image
                source={require("../../assets/images/pureP.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>Vehicle Register Karo</Text>
              <Text style={styles.subtitle}>Ek baar setup — permanently save hoga</Text>
            </View>

            <View style={styles.formWrapper}>

              {/* Step indicator */}
              <View style={styles.stepRow}>
                <View style={styles.stepDone}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepActive}>
                  <Text style={styles.stepActiveText}>2</Text>
                </View>
                <View style={[styles.stepLine, { opacity: 0.3 }]} />
                <View style={styles.stepPending}>
                  <Text style={styles.stepPendingText}>3</Text>
                </View>
              </View>
              <View style={styles.stepLabelRow}>
                <Text style={styles.stepLabelDone}>Signup</Text>
                <Text style={styles.stepLabelActive}>Vehicle</Text>
                <Text style={styles.stepLabelPending}>Done</Text>
              </View>

              {/* Location card */}
              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={18} color="#0d47a1" />
                  <Text style={styles.locationTitle}>Registration Location</Text>
                </View>

                {locationLoading && (
                  <View style={styles.locationRow}>
                    <ActivityIndicator size="small" color="#0d47a1" />
                    <Text style={styles.locationText}>  GPS fetch ho raha hai...</Text>
                  </View>
                )}

                {!locationLoading && location && (
                  <View>
                    <View style={styles.locationRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                      <Text style={[styles.locationText, { marginLeft: 6 }]} numberOfLines={2}>
                        {location.address || "Location capture ho gaya"}
                      </Text>
                    </View>
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}

                {!locationLoading && !location && (
                  <View>
                    {locationError && (
                      <Text style={styles.locationErrorText}>{locationError}</Text>
                    )}
                    <TouchableOpacity onPress={captureLocation} style={styles.retryBtn}>
                      <Ionicons name="refresh" size={14} color="#0d47a1" />
                      <Text style={styles.retryText}>  Retry karo</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Vehicle number */}
              <Text style={styles.label}>Vehicle Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="car-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { textTransform: "uppercase" }]}
                  placeholder="e.g. DL01AB1234"
                  autoCapitalize="characters"
                  value={vehicleForm.vehicleNumber}
                  onChangeText={(t) => handleVehicleChange("vehicleNumber", t)}
                />
              </View>

              {/* Vehicle type chips */}
              <Text style={styles.label}>Vehicle Type</Text>
              <View style={styles.chipRow}>
                {VEHICLE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, vehicleForm.vehicleType === type && styles.chipActive]}
                    onPress={() => handleVehicleChange("vehicleType", type)}
                  >
                    <Text style={[styles.chipText, vehicleForm.vehicleType === type && styles.chipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fuel type chips */}
              <Text style={styles.label}>Fuel Type</Text>
              <View style={styles.chipRow}>
                {FUEL_TYPES.map((fuel) => (
                  <TouchableOpacity
                    key={fuel}
                    style={[styles.chip, vehicleForm.fuelType === fuel && styles.chipActive]}
                    onPress={() => handleVehicleChange("fuelType", fuel)}
                  >
                    <Text style={[styles.chipText, vehicleForm.fuelType === fuel && styles.chipTextActive]}>
                      {fuel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Summary card — vehicle number + location filled hone ke baad dikhega */}
              {vehicleForm.vehicleNumber.length > 0 && location && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Vehicle No.</Text>
                    <Text style={styles.summaryVal}>{vehicleForm.vehicleNumber.toUpperCase()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Type</Text>
                    <Text style={styles.summaryVal}>{vehicleForm.vehicleType}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Fuel</Text>
                    <Text style={styles.summaryVal}>{vehicleForm.fuelType}</Text>
                  </View>
                  <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.summaryKey}>Location</Text>
                    <Text style={styles.summaryVal} numberOfLines={2}>
                      {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                    </Text>
                  </View>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                onPress={handleRegisterVehicle}
                activeOpacity={0.8}
                disabled={isLoading || locationLoading}
              >
                <LinearGradient
                  colors={["#0d47a1", "#1976d2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.submitButton,
                    (isLoading || locationLoading) && { opacity: 0.6 },
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View style={styles.submitRow}>
                      <Text style={styles.submitButtonText}>Registration Complete Karo</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.vehicleNote}>
                Vehicle aur location ek baar capture hoga — baad mein change nahi ho sakta.
              </Text>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  logo:          { width: 120, height: 120, resizeMode: "contain", marginBottom: 12 },
  title:         { fontSize: 26, fontWeight: "bold", color: "#8B0000", letterSpacing: 0.5 },
  subtitle:      { fontSize: 13, color: "#444", marginTop: 5 },
  formWrapper: {
    padding: 20, backgroundColor: "#fff", borderRadius: 18,
    shadowColor: "#000", shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 4,
  },

  // Step indicator
  stepRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", marginBottom: 4,
  },
  stepDone: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#27ae60", alignItems: "center", justifyContent: "center",
  },
  stepActive: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#0d47a1", alignItems: "center", justifyContent: "center",
  },
  stepActiveText:  { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepPending: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#f0f0f0", borderWidth: 1, borderColor: "#ddd",
    alignItems: "center", justifyContent: "center",
  },
  stepPendingText: { color: "#aaa", fontSize: 13 },
  stepLine:        { flex: 1, height: 2, backgroundColor: "#0d47a1", maxWidth: 40 },
  stepLabelRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 4, marginBottom: 20,
  },
  stepLabelDone:    { fontSize: 10, color: "#27ae60", fontWeight: "600", width: 50, textAlign: "center" },
  stepLabelActive:  { fontSize: 10, color: "#0d47a1", fontWeight: "700", width: 50, textAlign: "center" },
  stepLabelPending: { fontSize: 10, color: "#aaa", width: 50, textAlign: "center" },

  // Location
  locationCard: {
    backgroundColor: "#EEF4FF", borderRadius: 10, padding: 12,
    marginBottom: 18, borderWidth: 1, borderColor: "#C5D8F8",
  },
  locationHeader:    { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  locationTitle:     { fontSize: 12, fontWeight: "600", color: "#0d47a1", marginLeft: 5 },
  locationRow:       { flexDirection: "row", alignItems: "flex-start" },
  locationText:      { fontSize: 13, color: "#333", lineHeight: 18, flex: 1 },
  locationErrorText: { fontSize: 12, color: "#c0392b", marginBottom: 6 },
  locationCoords: {
    fontSize: 11, color: "#888", marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  retryBtn:  { flexDirection: "row", alignItems: "center" },
  retryText: { color: "#0d47a1", fontSize: 13, fontWeight: "600" },

  // Form
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
  inputContainer: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#ddd", borderRadius: 12, backgroundColor: "#f9f9f9",
    marginBottom: 16, paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 6 },
  input:     { flex: 1, height: 44, fontSize: 15, letterSpacing: 1 },

  // Chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18, marginTop: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: "#ddd", backgroundColor: "#f9f9f9",
  },
  chipActive:     { backgroundColor: "#0d47a1", borderColor: "#0d47a1" },
  chipText:       { fontSize: 13, color: "#555" },
  chipTextActive: { color: "#fff", fontWeight: "600" },

  // Summary
  summaryCard: {
    backgroundColor: "#f0f7ff", borderRadius: 10, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: "#d0e8ff",
  },
  summaryTitle: {
    fontSize: 12, fontWeight: "700", color: "#0d47a1",
    marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#dce8f5",
  },
  summaryKey: { fontSize: 12, color: "#888" },
  summaryVal: { fontSize: 12, fontWeight: "600", color: "#333", maxWidth: "65%" },

  // Submit
  submitButton: {
    height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center",
    marginVertical: 12, shadowColor: "#0d47a1", shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 4,
  },
  submitRow:        { flexDirection: "row", alignItems: "center" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  vehicleNote:      { fontSize: 11, color: "#999", textAlign: "center", lineHeight: 16 },
});

export default VehicleRegistrationScreen;

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
//   Platform,
// } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";

// const FUEL_TYPES    = ["Diesel", "Petrol", "CNG", "ELECTRIC(BOV)"];
// const VEHICLE_TYPES = ["Truck", "Car", "Bike", "Bus", "Auto"];

// const VehicleRegistrationScreen = () => {
//   const navigation = useNavigation();
//   const route      = useRoute();

//   // userId passed from SignupScreen after successful signup
//   const userId = route?.params?.userId;

//   const [vehicleForm, setVehicleForm] = useState({
//     vehicleNumber: "",
//     vehicleType:   "Truck",
//     fuelType:      "Diesel",
//   });

//   const [location, setLocation]               = useState(null);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [locationError, setLocationError]     = useState(null);
//   const [isLoading, setIsLoading]             = useState(false);

//   // Auto-capture GPS on mount
//   useEffect(() => {
//     captureLocation();
//   }, []);

//   const handleVehicleChange = (field, value) =>
//     setVehicleForm((prev) => ({ ...prev, [field]: value }));

//   // ── GPS via navigator.geolocation (Expo managed — no install needed) ──────
//   const captureLocation = () => {
//     setLocationLoading(true);
//     setLocationError(null);

//     if (!navigator.geolocation) {
//       setLocationError("Geolocation is not supported on this device.");
//       setLocationLoading(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;

//         let address = "";
//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
//             { headers: { "User-Agent": "PurePrakritiApp/1.0" } }
//           );
//           const data = await res.json();
//           if (data?.display_name) {
//             address = data.display_name.split(",").slice(0, 3).join(", ");
//           }
//         } catch (_) {
//           // coords still captured even if reverse geocode fails
//         }

//         setLocation({ latitude, longitude, address });
//         setLocationLoading(false);
//       },
//       (error) => {
//         console.warn("GPS error:", error.message);
//         setLocationError("GPS fetch nahi ho saka. Location enable karke retry karo.");
//         setLocationLoading(false);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//     );
//   };

//   // ── Submit vehicle registration ───────────────────────────────────────────
//   const handleRegisterVehicle = async () => {
//     if (!userId) {
//       Alert.alert("Error", "User ID missing. Please signup again.");
//       return;
//     }

//     if (!vehicleForm.vehicleNumber.trim()) {
//       Alert.alert("Error", "Vehicle number daalo.");
//       return;
//     }

//     if (!/^[a-zA-Z0-9]+$/.test(vehicleForm.vehicleNumber.replace(/\s/g, ""))) {
//       Alert.alert("Error", "Vehicle number sirf alphanumeric hona chahiye.");
//       return;
//     }

//     if (!location) {
//       Alert.alert("Error", "Location capture nahi hua. Retry karo.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `${process.env.EXPO_PUBLIC_API_URL}/api/auth/signup-vehicle`,
//         {
//           method:  "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId:        userId,
//             vehicleNumber: vehicleForm.vehicleNumber.replace(/\s/g, "").toUpperCase(),
//             vehicleType:   vehicleForm.vehicleType,
//             fuelType:      vehicleForm.fuelType,
//             latitude:      location.latitude,
//             longitude:     location.longitude,
//             address:       location.address,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.success) {
//         Alert.alert("Success", "Vehicle register ho gaya!", [
//           { text: "OK", onPress: () => navigation.navigate("Calculator") },
//         ]);
//       } else if (response.status === 409) {
//         // Already registered — go to app directly
//         navigation.navigate("Calculator");
//       } else {
//         Alert.alert("Error", data.error || "Vehicle registration fail ho gayi.");
//       }
//     } catch (err) {
//       console.error("Vehicle registration error:", err);
//       Alert.alert("Error", "Kuch galat ho gaya. Dobara try karo.");
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

//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={{ flex: 1 }}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Header */}
//             <View style={styles.centerContent}>
//               <Image
//                 source={require("../../assets/images/pureP.png")}
//                 style={styles.logo}
//               />
//               <Text style={styles.title}>Vehicle Register Karo</Text>
//               <Text style={styles.subtitle}>
//                 Ek baar setup — permanently save hoga
//               </Text>
//             </View>

//             <View style={styles.formWrapper}>

//               {/* Step indicator */}
//               <View style={styles.stepRow}>
//                 <View style={styles.stepDone}>
//                   <Ionicons name="checkmark" size={14} color="#fff" />
//                 </View>
//                 <View style={styles.stepLine} />
//                 <View style={styles.stepActive}>
//                   <Text style={styles.stepActiveText}>2</Text>
//                 </View>
//                 <View style={[styles.stepLine, { opacity: 0.3 }]} />
//                 <View style={styles.stepPending}>
//                   <Text style={styles.stepPendingText}>3</Text>
//                 </View>
//               </View>
//               <View style={styles.stepLabelRow}>
//                 <Text style={styles.stepLabelDone}>Signup</Text>
//                 <Text style={styles.stepLabelActive}>Vehicle</Text>
//                 <Text style={styles.stepLabelPending}>Done</Text>
//               </View>

//               {/* Location card */}
//               <View style={styles.locationCard}>
//                 <View style={styles.locationHeader}>
//                   <Ionicons name="location" size={18} color="#0d47a1" />
//                   <Text style={styles.locationTitle}>Registration Location</Text>
//                 </View>

//                 {locationLoading && (
//                   <View style={styles.locationRow}>
//                     <ActivityIndicator size="small" color="#0d47a1" />
//                     <Text style={styles.locationText}>  GPS fetch ho raha hai...</Text>
//                   </View>
//                 )}

//                 {!locationLoading && location && (
//                   <View>
//                     <View style={styles.locationRow}>
//                       <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
//                       <Text style={[styles.locationText, { marginLeft: 6 }]} numberOfLines={2}>
//                         {location.address || "Location mil gaya"}
//                       </Text>
//                     </View>
//                     <Text style={styles.locationCoords}>
//                       {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
//                     </Text>
//                   </View>
//                 )}

//                 {!locationLoading && !location && (
//                   <View>
//                     {locationError && (
//                       <Text style={styles.locationErrorText}>{locationError}</Text>
//                     )}
//                     <TouchableOpacity onPress={captureLocation} style={styles.retryBtn}>
//                       <Ionicons name="refresh" size={14} color="#0d47a1" />
//                       <Text style={styles.retryText}>  Retry karo</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               </View>

//               {/* Vehicle number */}
//               <Text style={styles.label}>Vehicle Number</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="car-outline"
//                   size={20}
//                   color="#888"
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={[styles.input, { textTransform: "uppercase" }]}
//                   placeholder="e.g. DL01AB1234"
//                   autoCapitalize="characters"
//                   value={vehicleForm.vehicleNumber}
//                   onChangeText={(t) => handleVehicleChange("vehicleNumber", t)}
//                 />
//               </View>

//               {/* Vehicle type chips */}
//               <Text style={styles.label}>Vehicle Type</Text>
//               <View style={styles.chipRow}>
//                 {VEHICLE_TYPES.map((type) => (
//                   <TouchableOpacity
//                     key={type}
//                     style={[
//                       styles.chip,
//                       vehicleForm.vehicleType === type && styles.chipActive,
//                     ]}
//                     onPress={() => handleVehicleChange("vehicleType", type)}
//                   >
//                     <Text
//                       style={[
//                         styles.chipText,
//                         vehicleForm.vehicleType === type && styles.chipTextActive,
//                       ]}
//                     >
//                       {type}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* Fuel type chips */}
//               <Text style={styles.label}>Fuel Type</Text>
//               <View style={styles.chipRow}>
//                 {FUEL_TYPES.map((fuel) => (
//                   <TouchableOpacity
//                     key={fuel}
//                     style={[
//                       styles.chip,
//                       vehicleForm.fuelType === fuel && styles.chipActive,
//                     ]}
//                     onPress={() => handleVehicleChange("fuelType", fuel)}
//                   >
//                     <Text
//                       style={[
//                         styles.chipText,
//                         vehicleForm.fuelType === fuel && styles.chipTextActive,
//                       ]}
//                     >
//                       {fuel}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* Vehicle details summary card */}
//               {vehicleForm.vehicleNumber.length > 0 && location && (
//                 <View style={styles.summaryCard}>
//                   <Text style={styles.summaryTitle}>Summary</Text>
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryKey}>Vehicle No.</Text>
//                     <Text style={styles.summaryVal}>
//                       {vehicleForm.vehicleNumber.toUpperCase()}
//                     </Text>
//                   </View>
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryKey}>Type</Text>
//                     <Text style={styles.summaryVal}>{vehicleForm.vehicleType}</Text>
//                   </View>
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryKey}>Fuel</Text>
//                     <Text style={styles.summaryVal}>{vehicleForm.fuelType}</Text>
//                   </View>
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryKey}>Location</Text>
//                     <Text style={styles.summaryVal} numberOfLines={1}>
//                       {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
//                     </Text>
//                   </View>
//                 </View>
//               )}

//               {/* Submit button */}
//               <TouchableOpacity
//                 onPress={handleRegisterVehicle}
//                 activeOpacity={0.8}
//                 disabled={isLoading || locationLoading}
//               >
//                 <LinearGradient
//                   colors={["#0d47a1", "#1976d2"]}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={[
//                     styles.submitButton,
//                     (isLoading || locationLoading) && { opacity: 0.6 },
//                   ]}
//                 >
//                   {isLoading ? (
//                     <ActivityIndicator size="small" color="#fff" />
//                   ) : (
//                     <View style={styles.submitRow}>
//                       <Text style={styles.submitButtonText}>
//                         Registration Complete Karo
//                       </Text>
//                       <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
//                     </View>
//                   )}
//                 </LinearGradient>
//               </TouchableOpacity>

//               <Text style={styles.vehicleNote}>
//                 Vehicle aur location ek baar capture hoga — baad mein change nahi ho sakta.
//               </Text>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   mainContainer:   { flex: 1 },
//   imageBackground: { flex: 1 },
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
//   logo:          { width: 120, height: 120, resizeMode: "contain", marginBottom: 12 },
//   title:         { fontSize: 26, fontWeight: "bold", color: "#8B0000", letterSpacing: 0.5 },
//   subtitle:      { fontSize: 13, color: "#444", marginTop: 5 },

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

//   // Step indicator
//   stepRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 4,
//   },
//   stepDone: {
//     width: 28, height: 28, borderRadius: 14,
//     backgroundColor: "#27ae60",
//     alignItems: "center", justifyContent: "center",
//   },
//   stepActive: {
//     width: 28, height: 28, borderRadius: 14,
//     backgroundColor: "#0d47a1",
//     alignItems: "center", justifyContent: "center",
//   },
//   stepActiveText:  { color: "#fff", fontSize: 13, fontWeight: "700" },
//   stepPending: {
//     width: 28, height: 28, borderRadius: 14,
//     backgroundColor: "#f0f0f0",
//     borderWidth: 1, borderColor: "#ddd",
//     alignItems: "center", justifyContent: "center",
//   },
//   stepPendingText: { color: "#aaa", fontSize: 13 },
//   stepLine:        { flex: 1, height: 2, backgroundColor: "#0d47a1", maxWidth: 40 },
//   stepLabelRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 4,
//     marginBottom: 20,
//   },
//   stepLabelDone:    { fontSize: 10, color: "#27ae60", fontWeight: "600", width: 50, textAlign: "center" },
//   stepLabelActive:  { fontSize: 10, color: "#0d47a1", fontWeight: "700", width: 50, textAlign: "center" },
//   stepLabelPending: { fontSize: 10, color: "#aaa",    width: 50, textAlign: "center" },

//   // Location card
//   locationCard: {
//     backgroundColor: "#EEF4FF",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 18,
//     borderWidth: 1,
//     borderColor: "#C5D8F8",
//   },
//   locationHeader:    { flexDirection: "row", alignItems: "center", marginBottom: 8 },
//   locationTitle:     { fontSize: 12, fontWeight: "600", color: "#0d47a1", marginLeft: 5 },
//   locationRow:       { flexDirection: "row", alignItems: "flex-start" },
//   locationText:      { fontSize: 13, color: "#333", lineHeight: 18, flex: 1 },
//   locationErrorText: { fontSize: 12, color: "#c0392b", marginBottom: 6 },
//   locationCoords: {
//     fontSize: 11,
//     color: "#888",
//     marginTop: 4,
//     fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
//   },
//   retryBtn:  { flexDirection: "row", alignItems: "center" },
//   retryText: { color: "#0d47a1", fontSize: 13, fontWeight: "600" },

//   // Form fields
//   label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 12,
//     backgroundColor: "#f9f9f9",
//     marginBottom: 16,
//     paddingHorizontal: 10,
//   },
//   inputIcon: { marginRight: 6 },
//   input:     { flex: 1, height: 44, fontSize: 15, letterSpacing: 1 },

//   // Chips
//   chipRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginBottom: 18,
//     marginTop: 4,
//   },
//   chip: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     backgroundColor: "#f9f9f9",
//   },
//   chipActive:     { backgroundColor: "#0d47a1", borderColor: "#0d47a1" },
//   chipText:       { fontSize: 13, color: "#555" },
//   chipTextActive: { color: "#fff", fontWeight: "600" },

//   // Summary card
//   summaryCard: {
//     backgroundColor: "#f0f7ff",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#d0e8ff",
//   },
//   summaryTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#0d47a1",
//     marginBottom: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   summaryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 4,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#dce8f5",
//   },
//   summaryKey: { fontSize: 12, color: "#888" },
//   summaryVal: { fontSize: 12, fontWeight: "600", color: "#333", maxWidth: "65%" },

//   // Submit
//   submitButton: {
//     height: 50,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 12,
//     shadowColor: "#0d47a1",
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   submitRow:        { flexDirection: "row", alignItems: "center" },
//   submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
//   vehicleNote:      { fontSize: 11, color: "#999", textAlign: "center", lineHeight: 16 },
// });

// export default VehicleRegistrationScreen;