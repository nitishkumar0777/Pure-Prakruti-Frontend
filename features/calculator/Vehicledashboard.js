/**
 * VehicleDashboard.jsx
 *
 * Shows:
 *  - Vehicle details card
 *  - Live GPS tracking (updates every 30 s while screen is focused)
 *  - 12-hour CO₂ certificate generation countdown + one-tap generation
 *
 * Backend endpoints consumed:
 *  GET  /api/auth/signup-vehicle/:userId   → vehicle + nextLocationUpdateDue
 *  PATCH /api/location/update              → push fresh location
 *  GET  /api/location/history/:userId      → recent location history
 *
 * Navigation:
 *  Expects `userId` in Redux (useSelector(selectUserInfo).userId)
 *  Navigates to "Result" after PDF generation (same as Calculator)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { generatePdfAsync, selectUserInfo } from "./calculatorSlice";

const { width: SCREEN_W } = Dimensions.get("window");
const API_URL = "http://192.168.1.2:4500";

// ─── helpers ──────────────────────────────────────────────────────────────────
const FUEL_ICON = {
  Diesel: "water",
  Petrol: "flame",
  CNG: "leaf",
  "ELECTRIC(BOV)": "flash",
};
const VEHICLE_ICON = {
  Truck: "truck",
  Car: "car",
  Bike: "bicycle",
  Bus: "bus",
  Auto: "rickshaw",
};

function msToHMS(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// ─── main component ───────────────────────────────────────────────────────────
const VehicleDashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);

  // vehicle state
  const [vehicle, setVehicle] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);

  // location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [nextUpdateDue, setNextUpdateDue] = useState(null); // ISO string
  const [countdown, setCountdown] = useState(0); // ms remaining
  const [trackingActive, setTrackingActive] = useState(false);

  // certificate / PDF
  const [certLoading, setCertLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // intervals
  const locationIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // ── pulse animation for live dot ──────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // ── countdown ticker ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!nextUpdateDue) return;
    const tick = () => {
      const diff = new Date(nextUpdateDue) - Date.now();
      setCountdown(Math.max(0, diff));
    };
    tick();
    countdownIntervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(countdownIntervalRef.current);
  }, [nextUpdateDue]);

  // ── fetch vehicle details ─────────────────────────────────────────────────
  const fetchVehicle = useCallback(async () => {
    if (!userInfo?.userId) return;
    setVehicleLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup-vehicle/${userInfo.userId}`);
      const data = await res.json();
      if (data.success && data.vehicle) {
        setVehicle(data.vehicle);
      }
    } catch (e) {
      console.error("[fetchVehicle]", e.message);
    } finally {
      setVehicleLoading(false);
    }
  }, [userInfo?.userId]);

  // ── fetch location history ────────────────────────────────────────────────
  const fetchLocationHistory = useCallback(async () => {
    if (!userInfo?.userId) return;
    try {
      const res = await fetch(`${API_URL}/api/location/history/${userInfo.userId}?limit=5`);
      const data = await res.json();
      if (data.success) {
        setLocationHistory(data.locationHistory || []);
        if (data.nextLocationUpdateDue) setNextUpdateDue(data.nextLocationUpdateDue);
      }
    } catch (e) {
      console.error("[fetchLocationHistory]", e.message);
    }
  }, [userInfo?.userId]);

  // ── push location to backend ──────────────────────────────────────────────
  const pushLocationToBackend = useCallback(
    async (lat, lng, address) => {
      if (!userInfo?.userId) return;
      try {
        const res = await fetch(`${API_URL}/api/location/update`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userInfo.userId,
            latitude: lat,
            longitude: lng,
            address,
          }),
        });
        const data = await res.json();
        if (data.success && data.nextLocationUpdateDue) {
          setNextUpdateDue(data.nextLocationUpdateDue);
        }
      } catch (e) {
        console.error("[pushLocation]", e.message);
      }
    },
    [userInfo?.userId]
  );

  // ── capture + push GPS ────────────────────────────────────────────────────
  const captureAndPushLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Location permission nahi mila. Settings mein jaake allow karo.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;

      let address = "";
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "User-Agent": "PurePrakritiApp/1.0" } }
        );
        const geoData = await geoRes.json();
        if (geoData?.display_name)
          address = geoData.display_name.split(",").slice(0, 3).join(", ");
      } catch (_) {}

      setCurrentLocation({ latitude, longitude, address, timestamp: new Date().toISOString() });
      await pushLocationToBackend(latitude, longitude, address);
      await fetchLocationHistory();
    } catch (e) {
      Alert.alert("GPS Error", "Location capture nahi hua. GPS on karo.");
    } finally {
      setLocationLoading(false);
    }
  }, [pushLocationToBackend, fetchLocationHistory]);

  // ── start / stop 30-second live tracking ─────────────────────────────────
  const toggleTracking = () => {
    if (trackingActive) {
      clearInterval(locationIntervalRef.current);
      setTrackingActive(false);
    } else {
      captureAndPushLocation();
      locationIntervalRef.current = setInterval(captureAndPushLocation, 30_000);
      setTrackingActive(true);
    }
  };

  // ── generate CO₂ certificate (same HTML as Calculator) ───────────────────
  const generateCertificate = async () => {
    if (!vehicle || !userInfo) {
      Alert.alert("Error", "Vehicle ya user info nahi mila.");
      return;
    }

    // We need the latest calculation result; for the dashboard we build a
    // "location-based" cert. If you want the full trip cert, navigate to Calculator.
    const certNumber = `PP-${Date.now()}`;
    const issueDate = new Date().toLocaleDateString("en-IN");

    // Rough CO₂ estimate from location history (placeholder if no trip result)
    const co2Kg = (locationHistory.length * 2.5).toFixed(1); // illustrative
    const trees = Math.ceil(parseFloat(co2Kg) * 12);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate of CO₂ Emission</title>
  <style>
    @page { size: A4; margin: 0; }
    body { margin:0; padding:0; }
    .page { width:210mm; height:297mm; background:#f7f7f7; display:flex; justify-content:center; align-items:center; }
    .certificate { position:relative; width:210mm; height:297mm; margin:auto; background:#fff; border:20px solid #0d47a1; box-sizing:border-box; padding:60px 50px 120px 50px; display:flex; flex-direction:column; justify-content:space-between; }
    .header { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; margin-bottom:20px; }
    .header .left { font-size:14px; text-align:left; }
    .header .center img { height:120px; }
    .header .right { text-align:right; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .certificate-heading { text-align:center; margin:20px 0; }
    .certificate-heading h1 { font-size:32px; color:#0d47a1; margin:0; text-transform:uppercase; border-bottom:2px solid #0d47a1; display:inline-block; padding-bottom:5px; }
    .certificate-heading h2 { font-size:20px; color:#444; margin:10px 0 30px; letter-spacing:1px; }
    .certificate-body { flex-grow:1; text-align:center; }
    .certificate-body p { font-size:18px; line-height:1.7; }
    .highlight { color:#002060; font-weight:bold; }
    .details { display:flex; justify-content:center; gap:120px; margin-bottom:30px; }
    .detail-item { text-align:center; }
    .date { font-size:16px; font-weight:600; border-bottom:1px solid #c0a060; padding-bottom:3px; margin-bottom:5px; }
    .label { font-size:12px; font-weight:bold; color:#003366; text-transform:uppercase; letter-spacing:1px; }
    .footer { position:absolute; bottom:40px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:flex-end; }
    .signature { text-align:center; font-size:14px; }
    .signature img { height:60px; margin-bottom:5px; }
    .issuer { text-align:right; font-size:16px; font-weight:bold; color:#0d47a1; }
  </style>
</head>
<body>
  <div class="page">
    <div class="certificate">
      <div class="header">
        <div class="left">
          <p><strong>CERTIFICATE NO:</strong><br>
            <span class="highlight">${certNumber}</span>
          </p>
        </div>
        <div class="center">
          <img src="https://raw.githubusercontent.com/jagdish97897/exchange-backend/refs/heads/main/141237_a99dc7bf9310471cb7b315bf6b1f13ae%7Emv2.avif" alt="Logo" style="height:280px;">
        </div>
        <div class="right" style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <img src="https://raw.githubusercontent.com/nitish1899/Image/main/pureprukriti.png" alt="TSIL Logo" style="height:120px;">
          <img src="https://github.com/nitish1899/Image/blob/main/Logo1.png?raw=true" alt="Startup India" style="height:25px;">
        </div>
      </div>
      <div class="certificate-heading">
        <h1>Green Certificate</h1>
        <h2>CO₂ Emission Certification</h2>
      </div>
      <div class="certificate-body">
        <p>This is to certify that <span class="highlight">${userInfo.userName}</span>, with vehicle number <span class="highlight">${vehicle.vehicleNumber}</span>, has emitted <span class="highlight">${co2Kg}</span> unit CO₂.</p>
        <p>It is recommended to offset this footprint by planting <span style="color:green;font-weight:bold;">${trees}</span> 🌳.</p>
      </div>
      <div class="details">
        <div class="detail-item">
          <p class="date">${issueDate}</p>
          <p class="label">Date of Issue</p>
        </div>
        <div class="detail-item">
          <p class="date">31-12-2030</p>
          <p class="label">Valid Upto</p>
        </div>
      </div>
      <div class="footer">
        <div class="signature">
          <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature">
          <p>Authorized Signature</p>
        </div>
        <div class="issuer">
          Issued by:<br>Transvue Solution India Pvt. Ltd.
          <div style="font-size:14px;margin-top:10px;">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    setPdfGenerating(true);
    try {
      await dispatch(
        generatePdfAsync({ userId: userInfo.userId, id: certNumber, html: htmlContent })
      ).unwrap();
      navigation.navigate("Result");
    } catch (err) {
      Alert.alert("PDF Error", err?.error || "Certificate generate nahi hua.");
    } finally {
      setPdfGenerating(false);
    }
  };

  // ── lifecycle ─────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      fetchVehicle();
      fetchLocationHistory();
      captureAndPushLocation();

      // Block hardware back button — login ke baad wapas nahi ja sakta
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);

      return () => {
        clearInterval(locationIntervalRef.current);
        clearInterval(countdownIntervalRef.current);
        setTrackingActive(false);
        backHandler.remove();
      };
    }, [fetchVehicle, fetchLocationHistory, captureAndPushLocation])
  );

  // ── helpers ───────────────────────────────────────────────────────────────
  const certReady = countdown <= 0 && nextUpdateDue !== null;

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <ImageBackground
        source={require("../../assets/images/Pure Prakriti bg img.jpg")}
        resizeMode="cover"
        style={s.bg}
      >
        <View style={s.overlay} />

        {/* ── HEADER ── */}
        <LinearGradient colors={["#003300", "#006400"]} style={s.header}>
          <View>
            <Text style={s.headerGreet}>नमस्ते 🙏</Text>
            <Text style={s.headerName}>{userInfo?.userName || "Driver"}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={s.profileBtn}>
            <FontAwesome5 name="user-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* ── VEHICLE CARD ── */}
            <View style={s.sectionLabel}>
              <Ionicons name="car-sport" size={15} color="#006400" />
              <Text style={s.sectionLabelText}>  Aapka Vehicle</Text>
            </View>

            {vehicleLoading ? (
              <View style={s.loadingCard}>
                <ActivityIndicator color="#006400" />
                <Text style={s.loadingText}>Vehicle details load ho rahi hai...</Text>
              </View>
            ) : vehicle ? (
              <LinearGradient colors={["#003300", "#005500", "#006400"]} style={s.vehicleCard}>
                {/* top row */}
                <View style={s.vcTopRow}>
                  <View style={s.vcIconWrap}>
                    <MaterialCommunityIcons
                      name={VEHICLE_ICON[vehicle.vehicleType] || "car"}
                      size={38}
                      color="#fff"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={s.vcNumber}>{vehicle.vehicleNumber}</Text>
                    <Text style={s.vcType}>{vehicle.vehicleType}</Text>
                  </View>
                  <View style={s.vcBadge}>
                    <Ionicons
                      name={FUEL_ICON[vehicle.fuelType] || "flame"}
                      size={13}
                      color="#fff"
                    />
                    <Text style={s.vcBadgeText}> {vehicle.fuelType}</Text>
                  </View>
                </View>

                {/* divider */}
                <View style={s.vcDivider} />

                {/* detail chips */}
                <View style={s.vcChipRow}>
                  {vehicle.address ? (
                    <View style={s.vcChip}>
                      <Ionicons name="location-outline" size={12} color="#cfd" />
                      <Text style={s.vcChipText} numberOfLines={1}>{vehicle.address}</Text>
                    </View>
                  ) : null}
                  {vehicle.registeredAt ? (
                    <View style={s.vcChip}>
                      <Ionicons name="calendar-outline" size={12} color="#cfd" />
                      <Text style={s.vcChipText}>
                        {new Date(vehicle.registeredAt).toLocaleDateString("en-IN")}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </LinearGradient>
            ) : (
              <View style={s.emptyCard}>
                <Text style={s.emptyText}>Vehicle register nahi hua. Signup karo.</Text>
              </View>
            )}

            {/* ── LIVE LOCATION CARD ── */}
            <View style={[s.sectionLabel, { marginTop: 20 }]}>
              <Ionicons name="navigate" size={15} color="#006400" />
              <Text style={s.sectionLabelText}>  Live Location Tracking</Text>
            </View>

            <View style={s.locationCard}>
              {/* status row */}
              <View style={s.lcStatusRow}>
                <View style={s.liveDotWrap}>
                  <Animated.View
                    style={[
                      s.liveDotPulse,
                      { transform: [{ scale: pulseAnim }], opacity: trackingActive ? 0.35 : 0 },
                    ]}
                  />
                  <View style={[s.liveDot, { backgroundColor: trackingActive ? "#27ae60" : "#aaa" }]} />
                </View>
                <Text style={[s.liveLabel, { color: trackingActive ? "#27ae60" : "#aaa" }]}>
                  {trackingActive ? "LIVE  •  updates every 30s" : "Tracking off"}
                </Text>
                <TouchableOpacity
                  style={[s.trackBtn, { backgroundColor: trackingActive ? "#c0392b" : "#006400" }]}
                  onPress={toggleTracking}
                >
                  <Ionicons name={trackingActive ? "stop" : "play"} size={12} color="#fff" />
                  <Text style={s.trackBtnText}>{trackingActive ? " Stop" : " Start"}</Text>
                </TouchableOpacity>
              </View>

              {/* current coords */}
              {locationLoading && (
                <View style={s.lcRow}>
                  <ActivityIndicator size="small" color="#006400" />
                  <Text style={s.lcText}>  GPS fetch ho raha hai...</Text>
                </View>
              )}
              {!locationLoading && currentLocation && (
                <>
                  <View style={s.lcRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                    <Text style={s.lcAddress} numberOfLines={2}>
                      {"  " + (currentLocation.address || "Location captured")}
                    </Text>
                  </View>
                  <Text style={s.lcCoords}>
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </Text>
                  <Text style={s.lcTime}>
                    Last update: {new Date(currentLocation.timestamp).toLocaleTimeString("en-IN")}
                  </Text>
                </>
              )}
              {!locationLoading && !currentLocation && (
                <TouchableOpacity style={s.retryBtn} onPress={captureAndPushLocation}>
                  <Ionicons name="refresh" size={14} color="#006400" />
                  <Text style={s.retryText}>  Retry GPS</Text>
                </TouchableOpacity>
              )}

              {/* manual refresh */}
              <TouchableOpacity style={s.manualRefreshBtn} onPress={captureAndPushLocation} disabled={locationLoading}>
                <Ionicons name="refresh-circle-outline" size={16} color="#006400" />
                <Text style={s.manualRefreshText}>  Abhi update karo</Text>
              </TouchableOpacity>
            </View>

            {/* ── LOCATION HISTORY ── */}
            {locationHistory.length > 0 && (
              <>
                <View style={[s.sectionLabel, { marginTop: 20 }]}>
                  <Ionicons name="time" size={15} color="#006400" />
                  <Text style={s.sectionLabelText}>  Recent Locations</Text>
                </View>
                <View style={s.historyCard}>
                  {locationHistory.map((loc, idx) => (
                    <View key={idx} style={[s.histRow, idx < locationHistory.length - 1 && s.histRowBorder]}>
                      <View style={s.histDotCol}>
                        <View style={[s.histDot, { backgroundColor: idx === 0 ? "#27ae60" : "#bbb" }]} />
                        {idx < locationHistory.length - 1 && <View style={s.histLine} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.histAddr} numberOfLines={1}>
                          {loc.address || `${loc.latitude?.toFixed(4)}, ${loc.longitude?.toFixed(4)}`}
                        </Text>
                        <Text style={s.histTime}>
                          {loc.recordedAt
                            ? new Date(loc.recordedAt).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "—"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* ── CO₂ CERTIFICATE ── */}
            <View style={[s.sectionLabel, { marginTop: 20 }]}>
              <MaterialCommunityIcons name="certificate" size={15} color="#006400" />
              <Text style={s.sectionLabelText}>  CO₂ Certificate</Text>
            </View>

            <View style={s.certCard}>
              {nextUpdateDue === null ? (
                <Text style={s.certInfo}>Location update ke baad certificate milega.</Text>
              ) : certReady ? (
                <>
                  <View style={s.certReadyRow}>
                    <MaterialCommunityIcons name="leaf-circle" size={36} color="#27ae60" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={s.certReadyTitle}>Certificate Ready! 🎉</Text>
                      <Text style={s.certReadySubtitle}>
                        12 ghante complete ho gaye. Abhi generate karo.
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={generateCertificate}
                    disabled={pdfGenerating}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={["#1b5e20", "#388e3c"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={s.certBtn}
                    >
                      {pdfGenerating ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="file-certificate" size={18} color="#fff" />
                          <Text style={s.certBtnText}>  Certificate Generate Karo</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={s.countdownRow}>
                    <Ionicons name="hourglass-outline" size={30} color="#0d47a1" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={s.countdownLabel}>Next certificate mein</Text>
                      <Text style={s.countdownValue}>{msToHMS(countdown)}</Text>
                    </View>
                  </View>
                  {/* progress bar */}
                  <View style={s.progressBg}>
                    <View
                      style={[
                        s.progressFill,
                        {
                          width: `${Math.min(
                            100,
                            ((43200000 - countdown) / 43200000) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.certInfo}>
                    12-ghante ka cycle complete hone par certificate generate hoga.
                  </Text>
                </>
              )}
            </View>

            {/* quick nav to Calculator */}
            <TouchableOpacity
              style={s.calcNavBtn}
              onPress={() => navigation.navigate("Calculator")}
              activeOpacity={0.85}
            >
              <Ionicons name="calculator-outline" size={18} color="#006400" />
              <Text style={s.calcNavText}>  Trip Calculator kholo</Text>
              <Ionicons name="chevron-forward" size={16} color="#006400" />
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </Animated.View>
        </ScrollView>

        {/* ── PDF generating modal (same as Calculator) ── */}
        <Modal transparent visible={pdfGenerating} animationType="fade">
          <View style={s.modalOverlay}>
            <View style={s.modalBox}>
              <ActivityIndicator size="large" color="#006400" />
              <Text style={s.modalText}>⏳ Certificate generate ho raha hai...</Text>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default VehicleDashboard;

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.55)" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  // header
  header: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 52 : 36,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    marginBottom: 18,
  },
  headerGreet: { color: "#cdf5cd", fontSize: 12, fontWeight: "500" },
  headerName: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
  profileBtn: { padding: 6 },

  // section label
  sectionLabel: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionLabelText: { fontSize: 12, fontWeight: "700", color: "#006400", textTransform: "uppercase", letterSpacing: 0.8 },

  // loading / empty
  loadingCard: { backgroundColor: "#fff", borderRadius: 14, padding: 20, alignItems: "center", elevation: 2 },
  loadingText: { marginTop: 8, color: "#888", fontSize: 13 },
  emptyCard: { backgroundColor: "#fff", borderRadius: 14, padding: 20, alignItems: "center" },
  emptyText: { color: "#c0392b", fontSize: 13 },

  // vehicle card
  vehicleCard: {
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    shadowColor: "#003300",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  vcTopRow: { flexDirection: "row", alignItems: "center" },
  vcIconWrap: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  vcNumber: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  vcType: { color: "#cdf5cd", fontSize: 13, marginTop: 2 },
  vcBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  vcBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  vcDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 14 },
  vcChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  vcChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, maxWidth: SCREEN_W - 80,
  },
  vcChipText: { color: "#cdf5cd", fontSize: 11, marginLeft: 4, flexShrink: 1 },

  // location card
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  lcStatusRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  liveDotWrap: { width: 18, height: 18, alignItems: "center", justifyContent: "center" },
  liveDot: { width: 10, height: 10, borderRadius: 5, position: "absolute" },
  liveDotPulse: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#27ae60", position: "absolute",
  },
  liveLabel: { flex: 1, fontSize: 12, fontWeight: "700", marginLeft: 8 },
  trackBtn: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  trackBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  lcRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  lcAddress: { fontSize: 13, color: "#333", lineHeight: 18, flex: 1 },
  lcCoords: {
    fontSize: 11, color: "#888", marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  lcTime: { fontSize: 11, color: "#aaa", marginTop: 2 },
  retryBtn: { flexDirection: "row", alignItems: "center" },
  retryText: { color: "#006400", fontSize: 13, fontWeight: "600" },
  manualRefreshBtn: {
    flexDirection: "row", alignItems: "center",
    marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: "#f0f0f0",
  },
  manualRefreshText: { color: "#006400", fontSize: 13, fontWeight: "600" },

  // history card
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  histRow: { flexDirection: "row", paddingVertical: 10 },
  histRowBorder: { borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
  histDotCol: { width: 18, alignItems: "center" },
  histDot: { width: 10, height: 10, borderRadius: 5 },
  histLine: { flex: 1, width: 2, backgroundColor: "#e0e0e0", marginTop: 2 },
  histAddr: { fontSize: 13, color: "#333", fontWeight: "500" },
  histTime: { fontSize: 11, color: "#aaa", marginTop: 2 },

  // certificate card
  certCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  certReadyRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  certReadyTitle: { fontSize: 16, fontWeight: "800", color: "#1b5e20" },
  certReadySubtitle: { fontSize: 12, color: "#555", marginTop: 3 },
  certBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 12, paddingVertical: 14,
    elevation: 3, shadowColor: "#1b5e20", shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 5,
  },
  certBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  countdownRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  countdownLabel: { fontSize: 12, color: "#555" },
  countdownValue: {
    fontSize: 30, fontWeight: "900", color: "#0d47a1",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 2,
  },
  progressBg: {
    height: 8, backgroundColor: "#e8f5e9", borderRadius: 4, overflow: "hidden", marginBottom: 10,
  },
  progressFill: { height: "100%", backgroundColor: "#27ae60", borderRadius: 4 },
  certInfo: { fontSize: 12, color: "#888", lineHeight: 17 },

  // quick nav
  calcNavBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 16,
    borderWidth: 1.5, borderColor: "#006400",
    elevation: 2,
  },
  calcNavText: { flex: 1, color: "#006400", fontSize: 14, fontWeight: "700", textAlign: "center" },

  // modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", padding: 24, borderRadius: 14, alignItems: "center", minWidth: 220 },
  modalText: { marginTop: 12, fontWeight: "600", fontSize: 14, color: "#333", textAlign: "center" },
});


// /**
//  * VehicleDashboard.jsx
//  *
//  * Shows:
//  *  - Vehicle details card
//  *  - Live GPS tracking (updates every 30 s while screen is focused)
//  *  - 12-hour CO₂ certificate generation countdown + one-tap generation
//  *
//  * Backend endpoints consumed:
//  *  GET  /api/auth/signup-vehicle/:userId   → vehicle + nextLocationUpdateDue
//  *  PATCH /api/location/update              → push fresh location
//  *  GET  /api/location/history/:userId      → recent location history
//  *
//  * Navigation:
//  *  Expects `userId` in Redux (useSelector(selectUserInfo).userId)
//  *  Navigates to "Result" after PDF generation (same as Calculator)
//  */

// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Dimensions,
//   ImageBackground,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Image,
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import * as Location from "expo-location";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import { useSelector, useDispatch } from "react-redux";
// import { generatePdfAsync, selectUserInfo } from "./calculatorSlice";

// const { width: SCREEN_W } = Dimensions.get("window");
// const API_URL ="http://192.168.1.2:4500";

// // ─── helpers ──────────────────────────────────────────────────────────────────
// const FUEL_ICON = {
//   Diesel: "water",
//   Petrol: "flame",
//   CNG: "leaf",
//   "ELECTRIC(BOV)": "flash",
// };
// const VEHICLE_ICON = {
//   Truck: "truck",
//   Car: "car",
//   Bike: "bicycle",
//   Bus: "bus",
//   Auto: "rickshaw",
// };

// function msToHMS(ms) {
//   if (ms <= 0) return "00:00:00";
//   const totalSec = Math.floor(ms / 1000);
//   const h = Math.floor(totalSec / 3600);
//   const m = Math.floor((totalSec % 3600) / 60);
//   const s = totalSec % 60;
//   return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
// }

// // ─── main component ───────────────────────────────────────────────────────────
// const VehicleDashboard = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const userInfo = useSelector(selectUserInfo);

//   // vehicle state
//   const [vehicle, setVehicle] = useState(null);
//   const [vehicleLoading, setVehicleLoading] = useState(true);

//   // location state
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [locationHistory, setLocationHistory] = useState([]);
//   const [nextUpdateDue, setNextUpdateDue] = useState(null); // ISO string
//   const [countdown, setCountdown] = useState(0); // ms remaining
//   const [trackingActive, setTrackingActive] = useState(false);

//   // certificate / PDF
//   const [certLoading, setCertLoading] = useState(false);
//   const [pdfGenerating, setPdfGenerating] = useState(false);

//   // animations
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // intervals
//   const locationIntervalRef = useRef(null);
//   const countdownIntervalRef = useRef(null);

//   // ── pulse animation for live dot ──────────────────────────────────────────
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, { toValue: 1.6, duration: 800, useNativeDriver: true }),
//         Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
//       ])
//     ).start();

//     Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
//   }, []);

//   // ── countdown ticker ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!nextUpdateDue) return;
//     const tick = () => {
//       const diff = new Date(nextUpdateDue) - Date.now();
//       setCountdown(Math.max(0, diff));
//     };
//     tick();
//     countdownIntervalRef.current = setInterval(tick, 1000);
//     return () => clearInterval(countdownIntervalRef.current);
//   }, [nextUpdateDue]);

//   // ── fetch vehicle details ─────────────────────────────────────────────────
//   const fetchVehicle = useCallback(async () => {
//     if (!userInfo?.userId) return;
//     setVehicleLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/auth/signup-vehicle/${userInfo.userId}`);
//       const data = await res.json();
//       if (data.success && data.vehicle) {
//         setVehicle(data.vehicle);
//       }
//     } catch (e) {
//       console.error("[fetchVehicle]", e.message);
//     } finally {
//       setVehicleLoading(false);
//     }
//   }, [userInfo?.userId]);

//   // ── fetch location history ────────────────────────────────────────────────
//   const fetchLocationHistory = useCallback(async () => {
//     if (!userInfo?.userId) return;
//     try {
//       const res = await fetch(`${API_URL}/api/location/history/${userInfo.userId}?limit=5`);
//       const data = await res.json();
//       if (data.success) {
//         setLocationHistory(data.locationHistory || []);
//         if (data.nextLocationUpdateDue) setNextUpdateDue(data.nextLocationUpdateDue);
//       }
//     } catch (e) {
//       console.error("[fetchLocationHistory]", e.message);
//     }
//   }, [userInfo?.userId]);

//   // ── push location to backend ──────────────────────────────────────────────
//   const pushLocationToBackend = useCallback(
//     async (lat, lng, address) => {
//       if (!userInfo?.userId) return;
//       try {
//         const res = await fetch(`${API_URL}/api/location/update`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId: userInfo.userId,
//             latitude: lat,
//             longitude: lng,
//             address,
//           }),
//         });
//         const data = await res.json();
//         if (data.success && data.nextLocationUpdateDue) {
//           setNextUpdateDue(data.nextLocationUpdateDue);
//         }
//       } catch (e) {
//         console.error("[pushLocation]", e.message);
//       }
//     },
//     [userInfo?.userId]
//   );

//   // ── capture + push GPS ────────────────────────────────────────────────────
//   const captureAndPushLocation = useCallback(async () => {
//     setLocationLoading(true);
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission", "Location permission nahi mila. Settings mein jaake allow karo.");
//         return;
//       }
//       const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
//       const { latitude, longitude } = pos.coords;

//       let address = "";
//       try {
//         const geoRes = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
//           { headers: { "User-Agent": "PurePrakritiApp/1.0" } }
//         );
//         const geoData = await geoRes.json();
//         if (geoData?.display_name)
//           address = geoData.display_name.split(",").slice(0, 3).join(", ");
//       } catch (_) {}

//       setCurrentLocation({ latitude, longitude, address, timestamp: new Date().toISOString() });
//       await pushLocationToBackend(latitude, longitude, address);
//       await fetchLocationHistory();
//     } catch (e) {
//       Alert.alert("GPS Error", "Location capture nahi hua. GPS on karo.");
//     } finally {
//       setLocationLoading(false);
//     }
//   }, [pushLocationToBackend, fetchLocationHistory]);

//   // ── start / stop 30-second live tracking ─────────────────────────────────
//   const toggleTracking = () => {
//     if (trackingActive) {
//       clearInterval(locationIntervalRef.current);
//       setTrackingActive(false);
//     } else {
//       captureAndPushLocation();
//       locationIntervalRef.current = setInterval(captureAndPushLocation, 30_000);
//       setTrackingActive(true);
//     }
//   };

//   // ── generate CO₂ certificate (same HTML as Calculator) ───────────────────
//   const generateCertificate = async () => {
//     if (!vehicle || !userInfo) {
//       Alert.alert("Error", "Vehicle ya user info nahi mila.");
//       return;
//     }

//     // We need the latest calculation result; for the dashboard we build a
//     // "location-based" cert. If you want the full trip cert, navigate to Calculator.
//     const certNumber = `PP-${Date.now()}`;
//     const issueDate = new Date().toLocaleDateString("en-IN");

//     // Rough CO₂ estimate from location history (placeholder if no trip result)
//     const co2Kg = (locationHistory.length * 2.5).toFixed(1); // illustrative
//     const trees = Math.ceil(parseFloat(co2Kg) * 12);

//     const htmlContent = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <title>Certificate of CO₂ Emission</title>
//   <style>
//     @page { size: A4; margin: 0; }
//     body { margin:0; padding:0; }
//     .page { width:210mm; height:297mm; background:#f7f7f7; display:flex; justify-content:center; align-items:center; }
//     .certificate { position:relative; width:210mm; height:297mm; margin:auto; background:#fff; border:20px solid #0d47a1; box-sizing:border-box; padding:60px 50px 120px 50px; display:flex; flex-direction:column; justify-content:space-between; }
//     .header { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; margin-bottom:20px; }
//     .header .left { font-size:14px; text-align:left; }
//     .header .center img { height:120px; }
//     .header .right { text-align:right; display:flex; flex-direction:column; align-items:center; justify-content:center; }
//     .certificate-heading { text-align:center; margin:20px 0; }
//     .certificate-heading h1 { font-size:32px; color:#0d47a1; margin:0; text-transform:uppercase; border-bottom:2px solid #0d47a1; display:inline-block; padding-bottom:5px; }
//     .certificate-heading h2 { font-size:20px; color:#444; margin:10px 0 30px; letter-spacing:1px; }
//     .certificate-body { flex-grow:1; text-align:center; }
//     .certificate-body p { font-size:18px; line-height:1.7; }
//     .highlight { color:#002060; font-weight:bold; }
//     .details { display:flex; justify-content:center; gap:120px; margin-bottom:30px; }
//     .detail-item { text-align:center; }
//     .date { font-size:16px; font-weight:600; border-bottom:1px solid #c0a060; padding-bottom:3px; margin-bottom:5px; }
//     .label { font-size:12px; font-weight:bold; color:#003366; text-transform:uppercase; letter-spacing:1px; }
//     .footer { position:absolute; bottom:40px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:flex-end; }
//     .signature { text-align:center; font-size:14px; }
//     .signature img { height:60px; margin-bottom:5px; }
//     .issuer { text-align:right; font-size:16px; font-weight:bold; color:#0d47a1; }
//   </style>
// </head>
// <body>
//   <div class="page">
//     <div class="certificate">
//       <div class="header">
//         <div class="left">
//           <p><strong>CERTIFICATE NO:</strong><br>
//             <span class="highlight">${certNumber}</span>
//           </p>
//         </div>
//         <div class="center">
//           <img src="https://raw.githubusercontent.com/jagdish97897/exchange-backend/refs/heads/main/141237_a99dc7bf9310471cb7b315bf6b1f13ae%7Emv2.avif" alt="Logo" style="height:280px;">
//         </div>
//         <div class="right" style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
//           <img src="https://raw.githubusercontent.com/nitish1899/Image/main/pureprukriti.png" alt="TSIL Logo" style="height:120px;">
//           <img src="https://github.com/nitish1899/Image/blob/main/Logo1.png?raw=true" alt="Startup India" style="height:25px;">
//         </div>
//       </div>
//       <div class="certificate-heading">
//         <h1>Green Certificate</h1>
//         <h2>CO₂ Emission Certification</h2>
//       </div>
//       <div class="certificate-body">
//         <p>This is to certify that <span class="highlight">${userInfo.userName}</span>, with vehicle number <span class="highlight">${vehicle.vehicleNumber}</span>, has emitted <span class="highlight">${co2Kg}</span> unit CO₂.</p>
//         <p>It is recommended to offset this footprint by planting <span style="color:green;font-weight:bold;">${trees}</span> 🌳.</p>
//       </div>
//       <div class="details">
//         <div class="detail-item">
//           <p class="date">${issueDate}</p>
//           <p class="label">Date of Issue</p>
//         </div>
//         <div class="detail-item">
//           <p class="date">31-12-2030</p>
//           <p class="label">Valid Upto</p>
//         </div>
//       </div>
//       <div class="footer">
//         <div class="signature">
//           <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature">
//           <p>Authorized Signature</p>
//         </div>
//         <div class="issuer">
//           Issued by:<br>Transvue Solution India Pvt. Ltd.
//           <div style="font-size:14px;margin-top:10px;">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
//         </div>
//       </div>
//     </div>
//   </div>
// </body>
// </html>`;

//     setPdfGenerating(true);
//     try {
//       await dispatch(
//         generatePdfAsync({ userId: userInfo.userId, id: certNumber, html: htmlContent })
//       ).unwrap();
//       navigation.navigate("Result");
//     } catch (err) {
//       Alert.alert("PDF Error", err?.error || "Certificate generate nahi hua.");
//     } finally {
//       setPdfGenerating(false);
//     }
//   };

//   // ── lifecycle ─────────────────────────────────────────────────────────────
//   useFocusEffect(
//     useCallback(() => {
//       fetchVehicle();
//       fetchLocationHistory();
//       captureAndPushLocation();
//       return () => {
//         clearInterval(locationIntervalRef.current);
//         clearInterval(countdownIntervalRef.current);
//         setTrackingActive(false);
//       };
//     }, [fetchVehicle, fetchLocationHistory, captureAndPushLocation])
//   );

//   // ── helpers ───────────────────────────────────────────────────────────────
//   const certReady = countdown <= 0 && nextUpdateDue !== null;

//   // ─────────────────────────────────────────────────────────────────────────
//   //  RENDER
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <View style={s.root}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={s.bg}
//       >
//         <View style={s.overlay} />

//         {/* ── HEADER ── */}
//         <LinearGradient colors={["#003300", "#006400"]} style={s.header}>
//           <View>
//             <Text style={s.headerGreet}>नमस्ते 🙏</Text>
//             <Text style={s.headerName}>{userInfo?.userName || "Driver"}</Text>
//           </View>
//           <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={s.profileBtn}>
//             <FontAwesome5 name="user-circle" size={28} color="#fff" />
//           </TouchableOpacity>
//         </LinearGradient>

//         <ScrollView
//           style={s.scroll}
//           contentContainerStyle={s.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           <Animated.View style={{ opacity: fadeAnim }}>

//             {/* ── VEHICLE CARD ── */}
//             <View style={s.sectionLabel}>
//               <Ionicons name="car-sport" size={15} color="#006400" />
//               <Text style={s.sectionLabelText}>  Aapka Vehicle</Text>
//             </View>

//             {vehicleLoading ? (
//               <View style={s.loadingCard}>
//                 <ActivityIndicator color="#006400" />
//                 <Text style={s.loadingText}>Vehicle details load ho rahi hai...</Text>
//               </View>
//             ) : vehicle ? (
//               <LinearGradient colors={["#003300", "#005500", "#006400"]} style={s.vehicleCard}>
//                 {/* top row */}
//                 <View style={s.vcTopRow}>
//                   <View style={s.vcIconWrap}>
//                     <MaterialCommunityIcons
//                       name={VEHICLE_ICON[vehicle.vehicleType] || "car"}
//                       size={38}
//                       color="#fff"
//                     />
//                   </View>
//                   <View style={{ flex: 1, marginLeft: 14 }}>
//                     <Text style={s.vcNumber}>{vehicle.vehicleNumber}</Text>
//                     <Text style={s.vcType}>{vehicle.vehicleType}</Text>
//                   </View>
//                   <View style={s.vcBadge}>
//                     <Ionicons
//                       name={FUEL_ICON[vehicle.fuelType] || "flame"}
//                       size={13}
//                       color="#fff"
//                     />
//                     <Text style={s.vcBadgeText}> {vehicle.fuelType}</Text>
//                   </View>
//                 </View>

//                 {/* divider */}
//                 <View style={s.vcDivider} />

//                 {/* detail chips */}
//                 <View style={s.vcChipRow}>
//                   {vehicle.address ? (
//                     <View style={s.vcChip}>
//                       <Ionicons name="location-outline" size={12} color="#cfd" />
//                       <Text style={s.vcChipText} numberOfLines={1}>{vehicle.address}</Text>
//                     </View>
//                   ) : null}
//                   {vehicle.registeredAt ? (
//                     <View style={s.vcChip}>
//                       <Ionicons name="calendar-outline" size={12} color="#cfd" />
//                       <Text style={s.vcChipText}>
//                         {new Date(vehicle.registeredAt).toLocaleDateString("en-IN")}
//                       </Text>
//                     </View>
//                   ) : null}
//                 </View>
//               </LinearGradient>
//             ) : (
//               <View style={s.emptyCard}>
//                 <Text style={s.emptyText}>Vehicle register nahi hua. Signup karo.</Text>
//               </View>
//             )}

//             {/* ── LIVE LOCATION CARD ── */}
//             <View style={[s.sectionLabel, { marginTop: 20 }]}>
//               <Ionicons name="navigate" size={15} color="#006400" />
//               <Text style={s.sectionLabelText}>  Live Location Tracking</Text>
//             </View>

//             <View style={s.locationCard}>
//               {/* status row */}
//               <View style={s.lcStatusRow}>
//                 <View style={s.liveDotWrap}>
//                   <Animated.View
//                     style={[
//                       s.liveDotPulse,
//                       { transform: [{ scale: pulseAnim }], opacity: trackingActive ? 0.35 : 0 },
//                     ]}
//                   />
//                   <View style={[s.liveDot, { backgroundColor: trackingActive ? "#27ae60" : "#aaa" }]} />
//                 </View>
//                 <Text style={[s.liveLabel, { color: trackingActive ? "#27ae60" : "#aaa" }]}>
//                   {trackingActive ? "LIVE  •  updates every 30s" : "Tracking off"}
//                 </Text>
//                 <TouchableOpacity
//                   style={[s.trackBtn, { backgroundColor: trackingActive ? "#c0392b" : "#006400" }]}
//                   onPress={toggleTracking}
//                 >
//                   <Ionicons name={trackingActive ? "stop" : "play"} size={12} color="#fff" />
//                   <Text style={s.trackBtnText}>{trackingActive ? " Stop" : " Start"}</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* current coords */}
//               {locationLoading && (
//                 <View style={s.lcRow}>
//                   <ActivityIndicator size="small" color="#006400" />
//                   <Text style={s.lcText}>  GPS fetch ho raha hai...</Text>
//                 </View>
//               )}
//               {!locationLoading && currentLocation && (
//                 <>
//                   <View style={s.lcRow}>
//                     <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
//                     <Text style={s.lcAddress} numberOfLines={2}>
//                       {"  " + (currentLocation.address || "Location captured")}
//                     </Text>
//                   </View>
//                   <Text style={s.lcCoords}>
//                     {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
//                   </Text>
//                   <Text style={s.lcTime}>
//                     Last update: {new Date(currentLocation.timestamp).toLocaleTimeString("en-IN")}
//                   </Text>
//                 </>
//               )}
//               {!locationLoading && !currentLocation && (
//                 <TouchableOpacity style={s.retryBtn} onPress={captureAndPushLocation}>
//                   <Ionicons name="refresh" size={14} color="#006400" />
//                   <Text style={s.retryText}>  Retry GPS</Text>
//                 </TouchableOpacity>
//               )}

//               {/* manual refresh */}
//               <TouchableOpacity style={s.manualRefreshBtn} onPress={captureAndPushLocation} disabled={locationLoading}>
//                 <Ionicons name="refresh-circle-outline" size={16} color="#006400" />
//                 <Text style={s.manualRefreshText}>  Abhi update karo</Text>
//               </TouchableOpacity>
//             </View>

//             {/* ── LOCATION HISTORY ── */}
//             {locationHistory.length > 0 && (
//               <>
//                 <View style={[s.sectionLabel, { marginTop: 20 }]}>
//                   <Ionicons name="time" size={15} color="#006400" />
//                   <Text style={s.sectionLabelText}>  Recent Locations</Text>
//                 </View>
//                 <View style={s.historyCard}>
//                   {locationHistory.map((loc, idx) => (
//                     <View key={idx} style={[s.histRow, idx < locationHistory.length - 1 && s.histRowBorder]}>
//                       <View style={s.histDotCol}>
//                         <View style={[s.histDot, { backgroundColor: idx === 0 ? "#27ae60" : "#bbb" }]} />
//                         {idx < locationHistory.length - 1 && <View style={s.histLine} />}
//                       </View>
//                       <View style={{ flex: 1 }}>
//                         <Text style={s.histAddr} numberOfLines={1}>
//                           {loc.address || `${loc.latitude?.toFixed(4)}, ${loc.longitude?.toFixed(4)}`}
//                         </Text>
//                         <Text style={s.histTime}>
//                           {loc.recordedAt
//                             ? new Date(loc.recordedAt).toLocaleString("en-IN", {
//                                 dateStyle: "short",
//                                 timeStyle: "short",
//                               })
//                             : "—"}
//                         </Text>
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               </>
//             )}

//             {/* ── CO₂ CERTIFICATE ── */}
//             <View style={[s.sectionLabel, { marginTop: 20 }]}>
//               <MaterialCommunityIcons name="certificate" size={15} color="#006400" />
//               <Text style={s.sectionLabelText}>  CO₂ Certificate</Text>
//             </View>

//             <View style={s.certCard}>
//               {nextUpdateDue === null ? (
//                 <Text style={s.certInfo}>Location update ke baad certificate milega.</Text>
//               ) : certReady ? (
//                 <>
//                   <View style={s.certReadyRow}>
//                     <MaterialCommunityIcons name="leaf-circle" size={36} color="#27ae60" />
//                     <View style={{ marginLeft: 12, flex: 1 }}>
//                       <Text style={s.certReadyTitle}>Certificate Ready! 🎉</Text>
//                       <Text style={s.certReadySubtitle}>
//                         12 ghante complete ho gaye. Abhi generate karo.
//                       </Text>
//                     </View>
//                   </View>
//                   <TouchableOpacity
//                     onPress={generateCertificate}
//                     disabled={pdfGenerating}
//                     activeOpacity={0.85}
//                   >
//                     <LinearGradient
//                       colors={["#1b5e20", "#388e3c"]}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 1 }}
//                       style={s.certBtn}
//                     >
//                       {pdfGenerating ? (
//                         <ActivityIndicator color="#fff" />
//                       ) : (
//                         <>
//                           <MaterialCommunityIcons name="file-certificate" size={18} color="#fff" />
//                           <Text style={s.certBtnText}>  Certificate Generate Karo</Text>
//                         </>
//                       )}
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <>
//                   <View style={s.countdownRow}>
//                     <Ionicons name="hourglass-outline" size={30} color="#0d47a1" />
//                     <View style={{ marginLeft: 12 }}>
//                       <Text style={s.countdownLabel}>Next certificate mein</Text>
//                       <Text style={s.countdownValue}>{msToHMS(countdown)}</Text>
//                     </View>
//                   </View>
//                   {/* progress bar */}
//                   <View style={s.progressBg}>
//                     <View
//                       style={[
//                         s.progressFill,
//                         {
//                           width: `${Math.min(
//                             100,
//                             ((43200000 - countdown) / 43200000) * 100
//                           )}%`,
//                         },
//                       ]}
//                     />
//                   </View>
//                   <Text style={s.certInfo}>
//                     12-ghante ka cycle complete hone par certificate generate hoga.
//                   </Text>
//                 </>
//               )}
//             </View>

//             {/* quick nav to Calculator */}
//             <TouchableOpacity
//               style={s.calcNavBtn}
//               onPress={() => navigation.navigate("Calculator")}
//               activeOpacity={0.85}
//             >
//               <Ionicons name="calculator-outline" size={18} color="#006400" />
//               <Text style={s.calcNavText}>  Trip Calculator kholo</Text>
//               <Ionicons name="chevron-forward" size={16} color="#006400" />
//             </TouchableOpacity>

//             <View style={{ height: 30 }} />
//           </Animated.View>
//         </ScrollView>

//         {/* ── PDF generating modal (same as Calculator) ── */}
//         <Modal transparent visible={pdfGenerating} animationType="fade">
//           <View style={s.modalOverlay}>
//             <View style={s.modalBox}>
//               <ActivityIndicator size="large" color="#006400" />
//               <Text style={s.modalText}>⏳ Certificate generate ho raha hai...</Text>
//             </View>
//           </View>
//         </Modal>
//       </ImageBackground>
//     </View>
//   );
// };

// export default VehicleDashboard;

// // ─── styles ───────────────────────────────────────────────────────────────────
// const s = StyleSheet.create({
//   root: { flex: 1 },
//   bg: { flex: 1 },
//   overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.55)" },
//   scroll: { flex: 1 },
//   scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

//   // header
//   header: {
//     width: "100%",
//     paddingTop: Platform.OS === "ios" ? 52 : 36,
//     paddingBottom: 18,
//     paddingHorizontal: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     marginBottom: 18,
//   },
//   headerGreet: { color: "#cdf5cd", fontSize: 12, fontWeight: "500" },
//   headerName: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
//   profileBtn: { padding: 6 },

//   // section label
//   sectionLabel: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
//   sectionLabelText: { fontSize: 12, fontWeight: "700", color: "#006400", textTransform: "uppercase", letterSpacing: 0.8 },

//   // loading / empty
//   loadingCard: { backgroundColor: "#fff", borderRadius: 14, padding: 20, alignItems: "center", elevation: 2 },
//   loadingText: { marginTop: 8, color: "#888", fontSize: 13 },
//   emptyCard: { backgroundColor: "#fff", borderRadius: 14, padding: 20, alignItems: "center" },
//   emptyText: { color: "#c0392b", fontSize: 13 },

//   // vehicle card
//   vehicleCard: {
//     borderRadius: 18,
//     padding: 20,
//     elevation: 6,
//     shadowColor: "#003300",
//     shadowOpacity: 0.3,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 8,
//   },
//   vcTopRow: { flexDirection: "row", alignItems: "center" },
//   vcIconWrap: {
//     width: 62, height: 62, borderRadius: 31,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     alignItems: "center", justifyContent: "center",
//   },
//   vcNumber: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 2 },
//   vcType: { color: "#cdf5cd", fontSize: 13, marginTop: 2 },
//   vcBadge: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.18)",
//     borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
//   },
//   vcBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
//   vcDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 14 },
//   vcChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
//   vcChip: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.12)",
//     borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, maxWidth: SCREEN_W - 80,
//   },
//   vcChipText: { color: "#cdf5cd", fontSize: 11, marginLeft: 4, flexShrink: 1 },

//   // location card
//   locationCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   lcStatusRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   liveDotWrap: { width: 18, height: 18, alignItems: "center", justifyContent: "center" },
//   liveDot: { width: 10, height: 10, borderRadius: 5, position: "absolute" },
//   liveDotPulse: {
//     width: 18, height: 18, borderRadius: 9,
//     backgroundColor: "#27ae60", position: "absolute",
//   },
//   liveLabel: { flex: 1, fontSize: 12, fontWeight: "700", marginLeft: 8 },
//   trackBtn: {
//     flexDirection: "row", alignItems: "center",
//     paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
//   },
//   trackBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
//   lcRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
//   lcAddress: { fontSize: 13, color: "#333", lineHeight: 18, flex: 1 },
//   lcCoords: {
//     fontSize: 11, color: "#888", marginTop: 2,
//     fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
//   },
//   lcTime: { fontSize: 11, color: "#aaa", marginTop: 2 },
//   retryBtn: { flexDirection: "row", alignItems: "center" },
//   retryText: { color: "#006400", fontSize: 13, fontWeight: "600" },
//   manualRefreshBtn: {
//     flexDirection: "row", alignItems: "center",
//     marginTop: 12, paddingTop: 10,
//     borderTopWidth: 1, borderTopColor: "#f0f0f0",
//   },
//   manualRefreshText: { color: "#006400", fontSize: 13, fontWeight: "600" },

//   // history card
//   historyCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 14,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   histRow: { flexDirection: "row", paddingVertical: 10 },
//   histRowBorder: { borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
//   histDotCol: { width: 18, alignItems: "center" },
//   histDot: { width: 10, height: 10, borderRadius: 5 },
//   histLine: { flex: 1, width: 2, backgroundColor: "#e0e0e0", marginTop: 2 },
//   histAddr: { fontSize: 13, color: "#333", fontWeight: "500" },
//   histTime: { fontSize: 11, color: "#aaa", marginTop: 2 },

//   // certificate card
//   certCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 18,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   certReadyRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   certReadyTitle: { fontSize: 16, fontWeight: "800", color: "#1b5e20" },
//   certReadySubtitle: { fontSize: 12, color: "#555", marginTop: 3 },
//   certBtn: {
//     flexDirection: "row", alignItems: "center", justifyContent: "center",
//     borderRadius: 12, paddingVertical: 14,
//     elevation: 3, shadowColor: "#1b5e20", shadowOpacity: 0.3,
//     shadowOffset: { width: 0, height: 3 }, shadowRadius: 5,
//   },
//   certBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   countdownRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
//   countdownLabel: { fontSize: 12, color: "#555" },
//   countdownValue: {
//     fontSize: 30, fontWeight: "900", color: "#0d47a1",
//     fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
//     letterSpacing: 2,
//   },
//   progressBg: {
//     height: 8, backgroundColor: "#e8f5e9", borderRadius: 4, overflow: "hidden", marginBottom: 10,
//   },
//   progressFill: { height: "100%", backgroundColor: "#27ae60", borderRadius: 4 },
//   certInfo: { fontSize: 12, color: "#888", lineHeight: 17 },

//   // quick nav
//   calcNavBtn: {
//     flexDirection: "row", alignItems: "center", justifyContent: "center",
//     backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 16,
//     borderWidth: 1.5, borderColor: "#006400",
//     elevation: 2,
//   },
//   calcNavText: { flex: 1, color: "#006400", fontSize: 14, fontWeight: "700", textAlign: "center" },

//   // modal
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
//   modalBox: { backgroundColor: "#fff", padding: 24, borderRadius: 14, alignItems: "center", minWidth: 220 },
//   modalText: { marginTop: 12, fontWeight: "600", fontSize: 14, color: "#333", textAlign: "center" },
// });