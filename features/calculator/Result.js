import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import LottieView from "lottie-react-native";

const Result = () => {
  const presignedUrl = useSelector((state) => state.calculator.presignedUrl);
  const result = useSelector((state) => state.calculator.result);
  const userInfo = useSelector((state) => state.calculator.userInfo);
  const navigation = useNavigation();

  const [pdfUrl, setPdfUrl] = useState(presignedUrl || "");
  const [qrImageUri, setQrImageUri] = useState("");
  const [savedPdfUri, setSavedPdfUri] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const recommendedTrees = result?.co2Emission
    ? Math.ceil(result.co2Emission / 200)
    : 0;

  // 🔹 Animation for certificate card
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Lottie state
  const [showText, setShowText] = useState(false); // false -> show animation first

  useEffect(() => {
    if (showText) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showText]);

  useEffect(() => {
    if (presignedUrl && presignedUrl !== pdfUrl) setPdfUrl(presignedUrl);
  }, [presignedUrl]);

  useEffect(() => {
    if (!pdfUrl) {
      Alert.alert("Error", "No PDF URL found. Please try again.", [
        { text: "Go Back", onPress: () => navigation.goBack() },
      ]);
    } else {
      const qrLink = getQrApiUrl(pdfUrl);
      setQrImageUri(qrLink);
    }
  }, [pdfUrl]);

  const getQrApiUrl = (data, size = 300) => {
    try {
      const encoded = encodeURIComponent(data);
      return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
    } catch (err) {
      console.log("❌ QR encode error:", err);
      return "";
    }
  };

  // PDF functions (preview, download, share) remain same
  const getPdfHtml = () => {
    const qrUrl = qrImageUri || getQrApiUrl(pdfUrl, 200);
    return ` <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>CO₂ Emission Certificate</title>
      <style>
        @page { size: A4; margin: 0; }
        body { margin:0; padding:0; font-family: Arial, sans-serif; background:#f7f7f7; }
        .page { width: 210mm; height: 297mm; display: flex; justify-content: center; align-items: center; }
        .certificate { position: relative; width: 210mm; height: 297mm; background: #fff; border: 20px solid #0d47a1; padding: 60px 50px 120px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
    .header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 20px;
    }

    .header .left {
      font-size: 14px;
      text-align: left;
    }
        .header .center img { height: 120px; }
        .header .right img { display: block; margin: 8px auto; }
        .certificate-heading { text-align:center; margin:20px 0; }
        .certificate-heading h1 { font-size:32px; color:#0d47a1; margin:0; text-transform:uppercase; border-bottom:2px solid #0d47a1; display:inline-block; padding-bottom:5px; }
        .certificate-heading h2 { font-size:20px; color:#444; margin:10px 0 30px; letter-spacing:1px; }
        .certificate-body { flex-grow:1; text-align:center; }
        .certificate-body p { font-size:18px; line-height:1.7; }
     .highlight {
      color: #002060;
      font-weight: bold;
    }
        .details { display:flex; justify-content:center; gap:120px; margin-bottom:30px; }
        .detail-item { text-align:center; }
        .date { font-size:16px; font-weight:600; border-bottom:1px solid #c0a060; padding-bottom:3px; margin-bottom:5px; }
        .label { font-size:12px; font-weight:bold; color:#003366; text-transform:uppercase; letter-spacing:1px; }
        .footer { position:absolute; bottom:40px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:flex-end; }
        .signature { text-align:center; font-size:14px; }
        .signature img { height:60px; margin-bottom:5px; }
        .issuer { text-align:right; font-size:16px; font-weight:bold; color:#0d47a1; }
        .date-section { text-align:right; font-size:14px; margin-top:10px; }
        .qr { margin-top: 20px; text-align:center; }
        .qr img { width: 140px; height: 140px; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="certificate">
          <div class="header">
      <div class="left">
        <p><strong>CERTIFICATE NO:</strong><br>
          <span class="highlight" id="certificateNumber">${result && result.certificateNumber}</span>
        </p>
      </div>
      <div class="center">
        <img
          src="https://raw.githubusercontent.com/jagdish97897/exchange-backend/refs/heads/main/141237_a99dc7bf9310471cb7b315bf6b1f13ae%7Emv2.avif"
          alt="DPIIT Logo" style="height:280px;">
      </div>
  <div class="right" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <img src="https://raw.githubusercontent.com/nitish1899/Image/main/pureprukriti.png" alt="TSIL Logo"
          style="height:120px; display:block; align-items:center margin-bottom:10px;">
        <img src="https://github.com/nitish1899/Image/blob/main/Logo1.png?raw=true" alt="Startup India Logo"
          style="height:25px;">
      </div>
          </div>

          <div class="certificate-heading">
            <h1>GREEN CERTIFICATE</h1>
            <h2>CO₂ Emission Certification</h2>
          </div>

          <div class="certificate-body">
            <p>This is to certify that <span class="highlight">${userInfo?.userName || "Name"}</span>, 
               with vehicle number <span class="highlight">${result?.vehicleNumber || "N/A"}</span>, 
               has emitted <span class="highlight">${(result?.co2Emission / 1000).toFixed(1) || "0"}</span> unit CO₂.</p>
            <p>As part of our commitment to sustainability, it is recommended to offset this footprint by planting 
               <span class="highlight" style="color:green;">${recommendedTrees}</span> 🌳.</p>
          </div>

          <div class="details">
            <div class="detail-item">
              <p class="date">${result?.certificateIssueDate || new Date().toLocaleDateString()}</p>
              <p class="label">Date of Issue</p>
            </div>
            <div class="detail-item">
              <p class="date">31-12-2030</p>
              <p class="label">Valid Upto</p>
            </div>
          </div>

x
          <div class="footer">
            <div class="signature">
              <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature" />
              <p>Authorized Signature</p>
            </div>
            <div class="issuer">
              Issued by:<br>
              <span>Transvue Solution India Pvt. Ltd.</span>
              <div class="date-section">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
            </div>
          </div>
          
          <div class="qr">
            <img src="${qrUrl}" />
          </div>

        </div>
      </div>
    </body>
    </html>`; // existing html here
  };

    const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false; // cleanup
    };
  }, []);

 const previewPdf = async () => {
    try {
      if (!mounted.current) return;
      await Print.printAsync({ html: getPdfHtml() });
    } catch (err) {
      if (!mounted.current) return;
      console.log("❌ Preview error:", err);
      Alert.alert("Error", "Unable to preview PDF.");
    }
  };

  const downloadPdfWithQr = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: getPdfHtml() });
      const fileName = `CO2_Certificate_${Date.now()}.pdf`;
      const destPath = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({ from: uri, to: destPath });
      setSavedPdfUri(destPath);
      Alert.alert("Saved", `PDF saved permanently at:\n${destPath}`);
      return destPath;
    } catch (err) {
      console.log("❌ Download error:", err);
      Alert.alert("Error", "Unable to download PDF.");
      return null;
    }
  };

 const sharePdf = async () => {
    setIsSharing(true);
    try {
      if (!mounted.current) return;
      let uri = savedPdfUri || (await downloadPdfWithQr());
      if (!uri) return;

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Not supported", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share CO₂ Certificate",
        UTI: "com.adobe.pdf",
      });
    } catch (err) {
      if (!mounted.current) return;
      console.log("❌ Share error:", err);
      Alert.alert("Error", "Unable to share PDF.");
    } finally {
      if (mounted.current) setIsSharing(false);
    }
  };

  if (!pdfUrl) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#004d00" />
        <Text style={styles.loadingText}>Loading PDF...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CO₂ Emission Dashboard</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!showText ? (
          // 🔹 Show Lottie animation first
          <LottieView
            source={require("../../assets/images/animation3.json")}
            autoPlay
            loop={false}
            style={{ width: 180, height: 180, alignSelf: "center", marginBottom: 15 }}
            onAnimationFinish={() => setShowText(true)}
          />
        ) : (
          // 🔹 Show certificate after animation
          <Animated.View
            style={[
              styles.certificateCard,
              { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
            ]}
          >
            <Text style={styles.certificateText}>
              This is to certify that{" "}
              <Text style={styles.highlight}>{userInfo?.userName || "Name"}</Text>
              , with vehicle number{" "}
              <Text style={styles.highlight}>
                {result?.vehicleNumber || "N/A"}
              </Text>
              , has emitted{" "}
              <Text style={styles.highlight}>
                {result?.co2Emission
                  ? (result.co2Emission / 1000).toFixed(1)
                  : "0"}
              </Text>{" "}
              unit CO₂.
            </Text>

            <Text style={styles.certificateText}>
              As part of our commitment to sustainability, it is recommended to
              offset this footprint by planting{" "}
              <Text style={[styles.highlight, { color: "green" }]}>
                {recommendedTrees}
              </Text>{" "}
              🌳.
            </Text>

            {qrImageUri && (
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={{ marginBottom: 6, fontWeight: "600" }}>
                  Scan to Verify
                </Text>
                <Image
                  source={{ uri: qrImageUri }}
                  style={{ width: 140, height: 140 }}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.iconButton} onPress={previewPdf}>
                <Text style={styles.iconText}>👁 View</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={sharePdf}>
                <Text style={styles.iconText}>
                  {isSharing ? "⏳ Sharing..." : "📤 Share"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

// 🔹 Styles remain same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#006400",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  backText: { color: "#fff", fontSize: 16 },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 19, fontWeight: "bold" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  message: { fontSize: 16, fontWeight: "600", marginBottom: 25, color: "#333" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#777" },
  certificateCard: {
    backgroundColor: "#ffffff",
    padding: 22,
    borderRadius: 20,
    width: "92%",
    borderWidth: 1,
    borderColor: "#e0e6eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  certificateText: { fontSize: 15, color: "#444", textAlign: "center", marginBottom: 12, lineHeight: 22 },
  highlight: { fontWeight: "bold", color: "#1d3557" },
  actionRow: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 18 },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006400",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    shadowColor: "#006400",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconText: { color: "#fff", fontSize: 15, fontWeight: "600", letterSpacing: 0.5 },
});

export default Result;





// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Image,
//   Animated,
// } from "react-native";
// import { useSelector } from "react-redux";
// import { useNavigation } from "@react-navigation/native";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import * as Print from "expo-print";

// const Result = () => {
//   const presignedUrl = useSelector((state) => state.calculator.presignedUrl);
//   const result = useSelector((state) => state.calculator.result);
//   const userInfo = useSelector((state) => state.calculator.userInfo);
//   const navigation = useNavigation();

//   const [pdfUrl, setPdfUrl] = useState(presignedUrl || "");
//   const [qrImageUri, setQrImageUri] = useState("");
//   const [savedPdfUri, setSavedPdfUri] = useState("");
//   const [isSharing, setIsSharing] = useState(false);

//   const recommendedTrees = result?.co2Emission
//     ? Math.ceil(result.co2Emission / 200)
//     : 0;

//   // 🔹 Animation
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 5,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   useEffect(() => {
//     if (presignedUrl && presignedUrl !== pdfUrl) setPdfUrl(presignedUrl);
//   }, [presignedUrl]);

//   useEffect(() => {
//     if (!pdfUrl) {
//       Alert.alert("Error", "No PDF URL found. Please try again.", [
//         { text: "Go Back", onPress: () => navigation.goBack() },
//       ]);
//     } else {
//       const qrLink = getQrApiUrl(pdfUrl);
//       setQrImageUri(qrLink);
//     }
//   }, [pdfUrl]);

//   const getQrApiUrl = (data, size = 300) => {
//     try {
//       const encoded = encodeURIComponent(data);
//       return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
//     } catch (err) {
//       console.log("❌ QR encode error:", err);
//       return "";
//     }
//   };

//   const getPdfHtml = () => {
//     const qrUrl = qrImageUri || getQrApiUrl(pdfUrl, 200);
//     return `
//  <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <title>CO₂ Emission Certificate</title>
//       <style>
//         @page { size: A4; margin: 0; }
//         body { margin:0; padding:0; font-family: Arial, sans-serif; background:#f7f7f7; }
//         .page { width: 210mm; height: 297mm; display: flex; justify-content: center; align-items: center; }
//         .certificate { position: relative; width: 210mm; height: 297mm; background: #fff; border: 20px solid #0d47a1; padding: 60px 50px 120px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
//     .header {
//       display: grid;
//       grid-template-columns: 1fr auto 1fr;
//       align-items: center;
//       margin-bottom: 20px;
//     }

//     .header .left {
//       font-size: 14px;
//       text-align: left;
//     }
//         .header .center img { height: 120px; }
//         .header .right img { display: block; margin: 8px auto; }
//         .certificate-heading { text-align:center; margin:20px 0; }
//         .certificate-heading h1 { font-size:32px; color:#0d47a1; margin:0; text-transform:uppercase; border-bottom:2px solid #0d47a1; display:inline-block; padding-bottom:5px; }
//         .certificate-heading h2 { font-size:20px; color:#444; margin:10px 0 30px; letter-spacing:1px; }
//         .certificate-body { flex-grow:1; text-align:center; }
//         .certificate-body p { font-size:18px; line-height:1.7; }
//      .highlight {
//       color: #002060;
//       font-weight: bold;
//     }
//         .details { display:flex; justify-content:center; gap:120px; margin-bottom:30px; }
//         .detail-item { text-align:center; }
//         .date { font-size:16px; font-weight:600; border-bottom:1px solid #c0a060; padding-bottom:3px; margin-bottom:5px; }
//         .label { font-size:12px; font-weight:bold; color:#003366; text-transform:uppercase; letter-spacing:1px; }
//         .footer { position:absolute; bottom:40px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:flex-end; }
//         .signature { text-align:center; font-size:14px; }
//         .signature img { height:60px; margin-bottom:5px; }
//         .issuer { text-align:right; font-size:16px; font-weight:bold; color:#0d47a1; }
//         .date-section { text-align:right; font-size:14px; margin-top:10px; }
//         .qr { margin-top: 20px; text-align:center; }
//         .qr img { width: 140px; height: 140px; }
//       </style>
//     </head>
//     <body>
//       <div class="page">
//         <div class="certificate">
//           <div class="header">
//       <div class="left">
//         <p><strong>CERTIFICATE NO:</strong><br>
//           <span class="highlight" id="certificateNumber">${result && result.certificateNumber}</span>
//         </p>
//       </div>
//       <div class="center">
//         <img
//           src="https://raw.githubusercontent.com/jagdish97897/exchange-backend/refs/heads/main/141237_a99dc7bf9310471cb7b315bf6b1f13ae%7Emv2.avif"
//           alt="DPIIT Logo" style="height:280px;">
//       </div>
//   <div class="right" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
//         <img src="https://raw.githubusercontent.com/nitish1899/Image/main/pureprukriti.png" alt="TSIL Logo"
//           style="height:120px; display:block; align-items:center margin-bottom:10px;">
//         <img src="https://github.com/nitish1899/Image/blob/main/Logo1.png?raw=true" alt="Startup India Logo"
//           style="height:25px;">
//       </div>
//           </div>

//           <div class="certificate-heading">
//             <h1>GREEN CERTIFICATE</h1>
//             <h2>CO₂ Emission Certification</h2>
//           </div>

//           <div class="certificate-body">
//             <p>This is to certify that <span class="highlight">${userInfo?.userName || "Name"}</span>, 
//                with vehicle number <span class="highlight">${result?.vehicleNumber || "N/A"}</span>, 
//                has emitted <span class="highlight">${(result?.co2Emission / 1000).toFixed(1) || "0"}</span> unit CO₂.</p>
//             <p>As part of our commitment to sustainability, it is recommended to offset this footprint by planting 
//                <span class="highlight" style="color:green;">${recommendedTrees}</span> 🌳.</p>
//           </div>

//           <div class="details">
//             <div class="detail-item">
//               <p class="date">${result?.certificateIssueDate || new Date().toLocaleDateString()}</p>
//               <p class="label">Date of Issue</p>
//             </div>
//             <div class="detail-item">
//               <p class="date">31-12-2030</p>
//               <p class="label">Valid Upto</p>
//             </div>
//           </div>

//           <div class="footer">
//             <div class="signature">
//               <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature" />
//               <p>Authorized Signature</p>
//             </div>
//             <div class="issuer">
//               Issued by:<br>
//               <span>Transvue Solution India Pvt. Ltd.</span>
//               <div class="date-section">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
//             </div>
//           </div>

//           <div class="qr">
//             <img src="${qrUrl}" />
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
//   };

//   const previewPdf = async () => {
//     try {
//       await Print.printAsync({ html: getPdfHtml() });
//     } catch (err) {
//       console.log("❌ Preview error:", err);
//       Alert.alert("Error", "Unable to preview PDF.");
//     }
//   };

//   const downloadPdfWithQr = async () => {
//     try {
//       const { uri } = await Print.printToFileAsync({ html: getPdfHtml() });
//       const fileName = `CO2_Certificate_${Date.now()}.pdf`;
//       const destPath = FileSystem.documentDirectory + fileName;
//       await FileSystem.copyAsync({ from: uri, to: destPath });
//       setSavedPdfUri(destPath);
//       Alert.alert("Saved", `PDF saved permanently at:\n${destPath}`);
//       return destPath;
//     } catch (err) {
//       console.log("❌ Download error:", err);
//       Alert.alert("Error", "Unable to download PDF.");
//       return null;
//     }
//   };

//   const sharePdf = async () => {
//     setIsSharing(true);
//     try {
//       let uri = savedPdfUri || (await downloadPdfWithQr());
//       if (!uri) return;
//       const canShare = await Sharing.isAvailableAsync();
//       if (!canShare) {
//         Alert.alert("Not supported", "Sharing is not available on this device.");
//         return;
//       }
//       await Sharing.shareAsync(uri, {
//         mimeType: "application/pdf",
//         dialogTitle: "Share CO₂ Certificate",
//         UTI: "com.adobe.pdf",
//       });
//     } catch (err) {
//       console.log("❌ Share error:", err);
//       Alert.alert("Error", "Unable to share PDF.");
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   if (!pdfUrl) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#004d00" />
//         <Text style={styles.loadingText}>Loading PDF...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* 🔹 Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>CO₂ Emission Dashboard</Text>
//       </View>

//       {/* 🔹 Content */}
//       <View style={styles.content}>
//         <Text style={styles.message}>
//           Your CO₂ Emission Certificate is ready.
//         </Text>

//         {/* 🔹 Animated Certificate Card */}
//         <Animated.View
//           style={[
//             styles.certificateCard,
//             {
//               transform: [{ scale: scaleAnim }],
//               opacity: fadeAnim,
//             },
//           ]}
//         >
//           <Text style={styles.certificateText}>
//             This is to certify that{" "}
//             <Text style={styles.highlight}>{userInfo?.userName || "Name"}</Text>
//             , with vehicle number{" "}
//             <Text style={styles.highlight}>
//               {result?.vehicleNumber || "N/A"}
//             </Text>
//             , has emitted{" "}
//             <Text style={styles.highlight}>
//               {result?.co2Emission
//                 ? (result.co2Emission / 1000).toFixed(1)
//                 : "0"}
//             </Text>{" "}
//             unit CO₂.
//           </Text>

//           <Text style={styles.certificateText}>
//             As part of our commitment to sustainability, it is recommended to
//             offset this footprint by planting{" "}
//             <Text style={[styles.highlight, { color: "green" }]}>
//               {recommendedTrees}
//             </Text>{" "}
//             🌳.
//           </Text>

//           {/* 🔹 QR Code */}
//           {qrImageUri && (
//             <View style={{ marginTop: 16, alignItems: "center" }}>
//               <Text style={{ marginBottom: 6, fontWeight: "600" }}>
//                 Scan to Verify
//               </Text>
//               <Image
//                 source={{ uri: qrImageUri }}
//                 style={{ width: 140, height: 140 }}
//                 resizeMode="contain"
//               />
//             </View>
//           )}

//           {/* 🔹 Action Buttons */}
//           <View style={styles.actionRow}>
//             <TouchableOpacity style={styles.iconButton} onPress={previewPdf}>
//               <Text style={styles.iconText}>👁 View</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.iconButton} onPress={sharePdf}>
//               <Text style={styles.iconText}>
//                 {isSharing ? "⏳ Sharing..." : "📤 Share"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: "#f0f4f8" // lighter background for contrast
//   },

//   // 🔹 Header
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     backgroundColor: "#006400",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 6,
//   },
//   backText: { color: "#fff", fontSize: 16 },
//   headerTitle: {
//     flex: 1,
//     textAlign: "center",
//     color: "#fff",
//     fontSize: 19,
//     fontWeight: "bold",
//     letterSpacing: 0.5,
//   },

//   // 🔹 Main Content
//   content: {
//     flex: 1,
//     justifyContent: "center", 
//     alignItems: "center",
//     padding: 20,
//   },
//   message: { 
//     fontSize: 16, 
//     fontWeight: "600", 
//     marginBottom: 25, 
//     color: "#333" 
//   },
//   loaderContainer: { 
//     flex: 1, 
//     justifyContent: "center", 
//     alignItems: "center" 
//   },
//   loadingText: { 
//     marginTop: 10, 
//     fontSize: 16, 
//     color: "#777" 
//   },

//   // 🔹 Certificate Card
//   certificateCard: {
//     backgroundColor: "#ffffff",
//     padding: 22,
//     borderRadius: 20,
//     width: "92%",
//     borderWidth: 1,
//     borderColor: "#e0e6eb",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 8, // Android shadow
//   },
//   certificateText: {
//     fontSize: 15,
//     color: "#444",
//     textAlign: "center",
//     marginBottom: 12,
//     lineHeight: 22,
//   },
//   highlight: {
//     fontWeight: "bold",
//     color: "#1d3557",
//   },

//   // 🔹 Buttons Row
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 18,
//   },
//   iconButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#006400",
//     paddingVertical: 12,
//     paddingHorizontal: 22,
//     borderRadius: 10,
//     shadowColor: "#006400",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   iconText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//     letterSpacing: 0.5,
//   },
// });


// export default Result;


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Linking,
//   TextInput,
//   Keyboard,
//   Image,
// } from "react-native";
// import { useSelector } from "react-redux";
// import { useNavigation } from "@react-navigation/native";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import * as Print from "expo-print";

// const Result = () => {
//   const presignedUrl = useSelector((state) => state.calculator.presignedUrl);
//   const result = useSelector((state) => state.calculator.result);
//   const userInfo = useSelector((state) => state.calculator.userInfo);
//   const navigation = useNavigation();

//   const [isSharing, setIsSharing] = useState(false);
//   const [pdfUrl, setPdfUrl] = useState(presignedUrl || "");
//   const [qrImageUri, setQrImageUri] = useState("");
//   const [savedPdfUri, setSavedPdfUri] = useState("");

//   const recommendedTrees = result?.co2Emission
//     ? Math.ceil(result.co2Emission / 200)
//     : 0;

//   useEffect(() => {
//     if (presignedUrl && presignedUrl !== pdfUrl) setPdfUrl(presignedUrl);
//   }, [presignedUrl]);

//   useEffect(() => {
//     if (!pdfUrl) {
//       Alert.alert("Error", "No PDF URL found. Please try again.", [
//         { text: "Go Back", onPress: () => navigation.goBack() },
//       ]);
//     } else {
//       const qrLink = getQrApiUrl(pdfUrl);
//       setQrImageUri(qrLink);
//     }
//   }, [pdfUrl]);

//   const getQrApiUrl = (data, size = 400) => {
//     try {
//       const encoded = encodeURIComponent(data);
//       return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
//     } catch (err) {
//       console.log("❌ QR encode error:", err);
//       return "";
//     }
//   };

//   const getPdfHtml = () => {
//     const qrUrl = qrImageUri || getQrApiUrl(pdfUrl, 200);

//     return ` <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <title>CO₂ Emission Certificate</title>
//       <style>
//         @page { size: A4; margin: 0; }
//         body { margin:0; padding:0; font-family: Arial, sans-serif; background:#f7f7f7; }
//         .page { width: 210mm; height: 297mm; display: flex; justify-content: center; align-items: center; }
//         .certificate { position: relative; width: 210mm; height: 297mm; background: #fff; border: 20px solid #0d47a1; padding: 60px 50px 120px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
//     .header {
//       display: grid;
//       grid-template-columns: 1fr auto 1fr;
//       align-items: center;
//       margin-bottom: 20px;
//     }

//     .header .left {
//       font-size: 14px;
//       text-align: left;
//     }
//         .header .center img { height: 120px; }
//         .header .right img { display: block; margin: 8px auto; }
//         .certificate-heading { text-align:center; margin:20px 0; }
//         .certificate-heading h1 { font-size:32px; color:#0d47a1; margin:0; text-transform:uppercase; border-bottom:2px solid #0d47a1; display:inline-block; padding-bottom:5px; }
//         .certificate-heading h2 { font-size:20px; color:#444; margin:10px 0 30px; letter-spacing:1px; }
//         .certificate-body { flex-grow:1; text-align:center; }
//         .certificate-body p { font-size:18px; line-height:1.7; }
//      .highlight {
//       color: #002060;
//       font-weight: bold;
//     }
//         .details { display:flex; justify-content:center; gap:120px; margin-bottom:30px; }
//         .detail-item { text-align:center; }
//         .date { font-size:16px; font-weight:600; border-bottom:1px solid #c0a060; padding-bottom:3px; margin-bottom:5px; }
//         .label { font-size:12px; font-weight:bold; color:#003366; text-transform:uppercase; letter-spacing:1px; }
//         .footer { position:absolute; bottom:40px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:flex-end; }
//         .signature { text-align:center; font-size:14px; }
//         .signature img { height:60px; margin-bottom:5px; }
//         .issuer { text-align:right; font-size:16px; font-weight:bold; color:#0d47a1; }
//         .date-section { text-align:right; font-size:14px; margin-top:10px; }
//         .qr { margin-top: 20px; text-align:center; }
//         .qr img { width: 140px; height: 140px; }
//       </style>
//     </head>
//     <body>
//       <div class="page">
//         <div class="certificate">
//           <div class="header">
//       <div class="left">
//         <p><strong>CERTIFICATE NO:</strong><br>
//           <span class="highlight" id="certificateNumber">${result && result.certificateNumber}</span>
//         </p>
//       </div>
//       <div class="center">
//         <img
//           src="https://raw.githubusercontent.com/jagdish97897/exchange-backend/refs/heads/main/141237_a99dc7bf9310471cb7b315bf6b1f13ae%7Emv2.avif"
//           alt="DPIIT Logo" style="height:280px;">
//       </div>
//   <div class="right" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
//         <img src="https://raw.githubusercontent.com/nitish1899/Image/main/pureprukriti.png" alt="TSIL Logo"
//           style="height:120px; display:block; align-items:center margin-bottom:10px;">
//         <img src="https://github.com/nitish1899/Image/blob/main/Logo1.png?raw=true" alt="Startup India Logo"
//           style="height:25px;">
//       </div>
//           </div>

//           <div class="certificate-heading">
//             <h1>GREEN CERTIFICATE</h1>
//             <h2>CO₂ Emission Certification</h2>
//           </div>

//           <div class="certificate-body">
//             <p>This is to certify that <span class="highlight">${userInfo?.userName || "Name"}</span>, 
//                with vehicle number <span class="highlight">${result?.vehicleNumber || "N/A"}</span>, 
//                has emitted <span class="highlight">${(result?.co2Emission / 1000).toFixed(1) || "0"}</span> unit CO₂.</p>
//             <p>As part of our commitment to sustainability, it is recommended to offset this footprint by planting 
//                <span class="highlight" style="color:green;">${recommendedTrees}</span> 🌳.</p>
//           </div>

//           <div class="details">
//             <div class="detail-item">
//               <p class="date">${result?.certificateIssueDate || new Date().toLocaleDateString()}</p>
//               <p class="label">Date of Issue</p>
//             </div>
//             <div class="detail-item">
//               <p class="date">31-12-2030</p>
//               <p class="label">Valid Upto</p>
//             </div>
//           </div>

//           <div class="footer">
//             <div class="signature">
//               <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature" />
//               <p>Authorized Signature</p>
//             </div>
//             <div class="issuer">
//               Issued by:<br>
//               <span>Transvue Solution India Pvt. Ltd.</span>
//               <div class="date-section">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
//             </div>
//           </div>

//           <div class="qr">
//             <img src="${qrUrl}" />
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>`; // your existing HTML (unchanged)
//   };

//   const previewPdf = async () => {
//     try {
//       await Print.printAsync({ html: getPdfHtml() });
//     } catch (err) {
//       console.log("❌ Preview error:", err);
//       Alert.alert("Error", "Unable to preview PDF.");
//     }
//   };

//   const downloadPdfWithQr = async () => {
//     try {
//       const { uri } = await Print.printToFileAsync({ html: getPdfHtml() });
//       const fileName = `CO2_Certificate_${Date.now()}.pdf`;
//       const destPath = FileSystem.documentDirectory + fileName;
//       await FileSystem.copyAsync({ from: uri, to: destPath });
//       setSavedPdfUri(destPath);
//       Alert.alert("Saved", `PDF saved permanently at:\n${destPath}`);
//       return destPath;
//     } catch (err) {
//       console.log("❌ Download error:", err);
//       Alert.alert("Error", "Unable to download PDF.");
//       return null;
//     }
//   };

//   const sharePdf = async () => {
//     setIsSharing(true);
//     try {
//       let uri = savedPdfUri || (await downloadPdfWithQr());
//       if (!uri) return;
//       const canShare = await Sharing.isAvailableAsync();
//       if (!canShare) {
//         Alert.alert("Not supported", "Sharing is not available on this device.");
//         return;
//       }
//       await Sharing.shareAsync(uri, {
//         mimeType: "application/pdf",
//         dialogTitle: "Share CO₂ Certificate",
//         UTI: "com.adobe.pdf",
//       });
//     } catch (err) {
//       console.log("❌ Share error:", err);
//       Alert.alert("Error", "Unable to share PDF.");
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   if (!pdfUrl) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#004d00" />
//         <Text style={styles.loadingText}>Loading PDF...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* 🔹 Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>CO₂ Emission Dashboard</Text>
//       </View>

//       {/* 🔹 Main Content */}
//       <View style={styles.content}>
//         <Text style={styles.message}>Your CO₂ Emission Certificate is ready.</Text>

// <View style={styles.certificateCard}>
//   <Text style={styles.certificateText}>
//     This is to certify that{" "}
//     <Text style={styles.highlight}>{userInfo?.userName || "Name"}</Text>,
//     with vehicle number{" "}
//     <Text style={styles.highlight}>{result?.vehicleNumber || "N/A"}</Text>,
//     has emitted{" "}
//     <Text style={styles.highlight}>
//       {result?.co2Emission
//         ? (result.co2Emission / 1000).toFixed(1)
//         : "0"}
//     </Text>{" "}
//     unit CO₂.
//   </Text>
//   <Text style={styles.certificateText}>
//     As part of our commitment to sustainability, it is recommended to
//     offset this footprint by planting{" "}
//     <Text style={[styles.highlight, { color: "green" }]}>
//       {recommendedTrees}
//     </Text>{" "}
//     🌳.
//   </Text>

//           {/* 🔹 QR Code */}
//         {qrImageUri && (
//           <View style={{ marginTop: 24, alignItems: "center" }}>
//             <Text style={{ marginBottom: 8, fontWeight: "600" }}>
//               QR for this PDF
//             </Text>
//             <Image
//               source={{ uri: qrImageUri }}
//               style={{ width: 200, height: 200 }}
//               resizeMode="contain"
//             />
//           </View>
//         )}

//   {/* 🔹 Action Buttons inside card */}
//   <View style={styles.actionRow}>
//     <TouchableOpacity style={styles.iconButton} onPress={previewPdf}>
//       <Text style={styles.iconText}>👁 View</Text>
//     </TouchableOpacity>

//     <TouchableOpacity style={styles.iconButton} onPress={sharePdf}>
//       <Text style={styles.iconText}>📤 Share</Text>
//     </TouchableOpacity>
//   </View>
// </View>

//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9f9f9" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     backgroundColor: "#006400",
//   },
//   backText: { color: "#fff", fontSize: 16 },
//   headerTitle: {
//     flex: 1,
//     textAlign: "center",
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   content: {
//     flex: 1,
//     justifyContent: "flex-start",
//     alignItems: "center",
//     padding: 20,
//   },
//   message: { fontSize: 16, fontWeight: "500", marginBottom: 15 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     width: "90%",
//     padding: 10,
//     marginVertical: 20,
//   },
//   openButton: {
//     backgroundColor: "#004d00",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     width: "80%",
//     alignItems: "center",
//   },
//   openButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { marginTop: 10, fontSize: 16, color: "#555" },

//   // ✅ New styles for certificate card
//   certificateCard: {
//     backgroundColor: "#f9fff9",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#cce5cc",
//     width: "95%",
//   },
//   certificateText: {
//     fontSize: 15,
//     color: "#333",
//     textAlign: "center",
//     marginBottom: 8,
//     lineHeight: 22,
//   },
//   highlight: {
//     fontWeight: "bold",
//     color: "#002060",
//   },
//   actionRow: {
//   flexDirection: "row",
//   justifyContent: "space-around",
//   marginTop: 10,
// },
// iconButton: {
//   flexDirection: "row",
//   alignItems: "center",
//   backgroundColor: "#004d00",
//   paddingVertical: 8,
//   paddingHorizontal: 15,
//   borderRadius: 8,
// },
// iconText: {
//   color: "#fff",
//   fontSize: 14,
//   fontWeight: "600",
// },

// });

// export default Result;



// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Linking,
//   TextInput,
//   Keyboard,
//   Image,
// } from "react-native";
// import { useSelector } from "react-redux";
// import { useNavigation } from "@react-navigation/native";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import * as Print from "expo-print";

// const Result = () => {
//   const presignedUrl = useSelector((state) => state.calculator.presignedUrl);
//   const result = useSelector((state) => state.calculator.result);
//   const userInfo = useSelector((state) => state.calculator.userInfo);
//   const navigation = useNavigation();

//   const [isSharing, setIsSharing] = useState(false);
//   const [pdfUrl, setPdfUrl] = useState(presignedUrl || "");
//   const [qrImageUri, setQrImageUri] = useState("");
//   const [savedPdfUri, setSavedPdfUri] = useState("");
//   console.log("result", result)
//   useEffect(() => {
//     if (presignedUrl && presignedUrl !== pdfUrl) setPdfUrl(presignedUrl);
//   }, [presignedUrl]);

//   useEffect(() => {
//     if (!pdfUrl) {
//       Alert.alert("Error", "No PDF URL found. Please try again.", [
//         { text: "Go Back", onPress: () => navigation.goBack() },
//       ]);
//     } else {
//       const qrLink = getQrApiUrl(pdfUrl);
//       setQrImageUri(qrLink);
//     }
//   }, [pdfUrl]);

//   const getQrApiUrl = (data, size = 400) => {
//     try {
//       const encoded = encodeURIComponent(data);
//       return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
//     } catch (err) {
//       console.log("❌ QR encode error:", err);
//       return "";
//     }
//   };

//   const getPdfHtml = () => {
//     const qrUrl = qrImageUri || getQrApiUrl(pdfUrl, 200);
//     const recommendedTrees = Math.ceil(result?.co2Emission / 200 || 0);

//     return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <title>CO₂ Emission Certificate</title>
//       <style>
//         @page { size: A4; margin: 0; }
//         body { margin:0; padding:0; font-family: Arial, sans-serif; background:#f7f7f7; }
//         .page { width: 210mm; height: 297mm; display: flex; justify-content: center; align-items: center; }
//         .certificate { position: relative; width: 210mm; height: 297mm; background: #fff; border: 20px solid #0d47a1; padding: 60px 50px 120px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
//     .header {
//       display: grid;
//       grid-template-columns: 1fr auto 1fr;
//       align-items: center;
//       margin-bottom: 20px;
//     }

//     .header .left {
//       font-size: 14px;
//       text-align: left;
//     }
//         .header .center img { height: 120px; }
//         .header .right img { display: block; margin: 8px auto; }
//         .certificate-heading { text-align:center; margin:20px 0; }
//         .certificate-heading h1 { font-size:32px; color:#0d47a1; margin:0; text-transform:uppercase; border-bottom:2px solid #0d47a1; display:inline-block; padding-bottom:5px; }
//         .certificate-heading h2 { font-size:20px; color:#444; margin:10px 0 30px; letter-spacing:1px; }
//         .certificate-body { flex-grow:1; text-align:center; }
//         .certificate-body p { font-size:18px; line-height:1.7; }
//      .highlight {
//       color: #002060;
//       font-weight: bold;
//     }
//         .details { display:flex; justify-content:center; gap:120px; margin-bottom:30px; }
//         .detail-item { text-align:center; }
//         .date { font-size:16px; font-weight:600; border-bottom:1px solid #c0a060; padding-bottom:3px; margin-bottom:5px; }
//         .label { font-size:12px; font-weight:bold; color:#003366; text-transform:uppercase; letter-spacing:1px; }
//         .footer { position:absolute; bottom:40px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:flex-end; }
//         .signature { text-align:center; font-size:14px; }
//         .signature img { height:60px; margin-bottom:5px; }
//         .issuer { text-align:right; font-size:16px; font-weight:bold; color:#0d47a1; }
//         .date-section { text-align:right; font-size:14px; margin-top:10px; }
//         .qr { margin-top: 20px; text-align:center; }
//         .qr img { width: 140px; height: 140px; }
//       </style>
//     </head>
//     <body>
//       <div class="page">
//         <div class="certificate">
//           <div class="header">
//       <div class="left">
//         <p><strong>CERTIFICATE NO:</strong><br>
//           <span class="highlight" id="certificateNumber">${result && result.certificateNumber}</span>
//         </p>
//       </div>
//       <div class="center">
//         <img
//           src="https://raw.githubusercontent.com/jagdish97897/exchange-backend/refs/heads/main/141237_a99dc7bf9310471cb7b315bf6b1f13ae%7Emv2.avif"
//           alt="DPIIT Logo" style="height:280px;">
//       </div>
//   <div class="right" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
//         <img src="https://raw.githubusercontent.com/nitish1899/Image/main/pureprukriti.png" alt="TSIL Logo"
//           style="height:120px; display:block; align-items:center margin-bottom:10px;">
//         <img src="https://github.com/nitish1899/Image/blob/main/Logo1.png?raw=true" alt="Startup India Logo"
//           style="height:25px;">
//       </div>
//           </div>

//           <div class="certificate-heading">
//             <h1>GREEN CERTIFICATE</h1>
//             <h2>CO₂ Emission Certification</h2>
//           </div>

//           <div class="certificate-body">
//             <p>This is to certify that <span class="highlight">${userInfo?.userName || "Name"}</span>, 
//                with vehicle number <span class="highlight">${result?.vehicleNumber || "N/A"}</span>, 
//                has emitted <span class="highlight">${(result?.co2Emission / 1000).toFixed(1) || "0"}</span> unit CO₂.</p>
//             <p>As part of our commitment to sustainability, it is recommended to offset this footprint by planting 
//                <span class="highlight" style="color:green;">${recommendedTrees}</span> 🌳.</p>
//           </div>

//           <div class="details">
//             <div class="detail-item">
//               <p class="date">${result?.certificateIssueDate || new Date().toLocaleDateString()}</p>
//               <p class="label">Date of Issue</p>
//             </div>
//             <div class="detail-item">
//               <p class="date">31-12-2030</p>
//               <p class="label">Valid Upto</p>
//             </div>
//           </div>

//           <div class="footer">
//             <div class="signature">
//               <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature" />
//               <p>Authorized Signature</p>
//             </div>
//             <div class="issuer">
//               Issued by:<br>
//               <span>Transvue Solution India Pvt. Ltd.</span>
//               <div class="date-section">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
//             </div>
//           </div>

//           <div class="qr">
//             <img src="${qrUrl}" />
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>`;
//   };

//   const previewPdf = async () => {
//     try {
//       await Print.printAsync({ html: getPdfHtml() });
//     } catch (err) {
//       console.log("❌ Preview error:", err);
//       Alert.alert("Error", "Unable to preview PDF.");
//     }
//   };

//   const downloadPdfWithQr = async () => {
//     try {
//       const { uri } = await Print.printToFileAsync({ html: getPdfHtml() });
//       const fileName = `CO2_Certificate_${Date.now()}.pdf`;
//       const destPath = FileSystem.documentDirectory + fileName;
//       await FileSystem.copyAsync({ from: uri, to: destPath });
//       setSavedPdfUri(destPath);
//       Alert.alert("Saved", `PDF saved permanently at:\n${destPath}`);
//       return destPath;
//     } catch (err) {
//       console.log("❌ Download error:", err);
//       Alert.alert("Error", "Unable to download PDF.");
//       return null;
//     }
//   };

//   const sharePdf = async () => {
//     setIsSharing(true);
//     try {
//       let uri = savedPdfUri || (await downloadPdfWithQr());
//       if (!uri) return;
//       const canShare = await Sharing.isAvailableAsync();
//       if (!canShare) {
//         Alert.alert("Not supported", "Sharing is not available on this device.");
//         return;
//       }
//       await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share CO₂ Certificate", UTI: "com.adobe.pdf" });
//     } catch (err) {
//       console.log("❌ Share error:", err);
//       Alert.alert("Error", "Unable to share PDF.");
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   if (!pdfUrl) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#004d00" />
//         <Text style={styles.loadingText}>Loading PDF...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>CO₂ Emission Dashboard</Text>
//       </View>

//       <View style={styles.content}>
//         <Text style={styles.message}>Your CO₂ Emission Certificate is ready.</Text>

//         <TextInput
//           style={styles.input}
//           placeholder="Enter or scan PDF URL"
//           value={pdfUrl}
//           onChangeText={setPdfUrl}
//           onSubmitEditing={() => Keyboard.dismiss()}
//           autoCapitalize="none"
//           keyboardType="url"
//         />

//         <TouchableOpacity style={styles.openButton} onPress={previewPdf}>
//           <Text style={styles.openButtonText}>👁 Preview PDF with QR</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={[styles.openButton, { marginTop: 10 }]} onPress={downloadPdfWithQr}>
//           <Text style={styles.openButtonText}>💾 Download PDF Permanently</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.openButton, { marginTop: 10 }]}
//           onPress={sharePdf}
//           disabled={isSharing}
//         >
//           {isSharing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.openButtonText}>📤 Share PDF with QR</Text>}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.openButton, { marginTop: 10 }]}
//           onPress={() => Linking.openURL(pdfUrl)}
//         >
//           <Text style={styles.openButtonText}>🌐 Open Original PDF</Text>
//         </TouchableOpacity>

//         {qrImageUri && (
//           <View style={{ marginTop: 24, alignItems: "center" }}>
//             <Text style={{ marginBottom: 8, fontWeight: "600" }}>QR for this PDF</Text>
//             <Image source={{ uri: qrImageUri }} style={{ width: 200, height: 200 }} resizeMode="contain" />
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9f9f9" },
//   header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#006400" },
//   backText: { color: "#fff", fontSize: 16 },
//   headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "bold" },
//   content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
//   message: { fontSize: 16, fontWeight: "500", marginBottom: 10 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, width: "90%", padding: 10, marginBottom: 20 },
//   openButton: { backgroundColor: "#004d00", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: "80%", alignItems: "center" },
//   openButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { marginTop: 10, fontSize: 16, color: "#555" },
// });

// export default Result;

