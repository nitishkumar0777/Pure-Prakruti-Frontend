// import React, { useEffect, useRef, useState } from 'react';
// import { 
//   ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, 
//   Text, TouchableOpacity, View, ActivityIndicator, Alert, Keyboard, Platform, TextInput, Image 
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { Formik } from 'formik';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   calculateResultAsync, 
//   selectUserInfo, 
//   generatePdfAsync,  
// } from './calculatorSlice';

// import mantraImage from "../../assets/images/mantra.jpg";
// import makeInIndiaLogo from "../../assets/images/make-in-India-logo.png";

// const Calculator = () => {
//   const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
//   const [box2, setBox2] = useState('');
//   const [box3, setBox3] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const [pdfGenerating, setPdfGenerating] = useState(false);

//   const box2Ref = useRef(null);
//   const box3Ref = useRef(null);

//   const userInfo = useSelector(selectUserInfo);
//   const result = useSelector(state => state.calculator.result);
//   const resultStatus = useSelector(state => state.calculator.status);
//   const error = useSelector(state => state.calculator.error);

//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   // Keyboard visibility
//   useEffect(() => {
//     const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
//     const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
//     return () => { showSub.remove(); hideSub.remove(); };
//   }, []);

//   // Handle calculation result & PDF generation
//   useEffect(() => {
//     if (resultStatus === 'idle' && result && pdfGenerating) {
//       if (!userInfo?.userId) return;

//       const htmlContent = `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Certificate of CO₂ Emission</title>
//         <style>
//           @page { size: A4; margin: 0; }
//           body { margin:0; padding:0; }
//           .page { width: 210mm; height: 297mm; background:#f7f7f7; display:flex; justify-content:center; align-items:center; }
//           .certificate { position:relative; width:210mm; height:297mm; margin:auto; background:#fff; border:20px solid #0d47a1; box-sizing:border-box; padding:60px 50px 120px 50px; display:flex; flex-direction:column; justify-content:space-between; }
//     .header {
//       display: grid;
//       grid-template-columns: 1fr auto 1fr;
//       align-items: center;
//       margin-bottom: 20px;
//     }
//           .header .left { font-size:14px; text-align:left; }
//           .header .center img { height:120px; }
//           .header .right { text-align:right; display:flex; flex-direction:column; align-items:center; justify-content:center; }
//           .header .right img { display:block; margin:8px auto; }
//           .certificate-heading { text-align:center; margin:20px 0; }
//           .certificate-heading h1 { font-size:32px; color:#0d47a1; margin:0; text-transform:uppercase; border-bottom:2px solid #0d47a1; display:inline-block; padding-bottom:5px; }
//           .certificate-heading h2 { font-size:20px; color:#444; margin:10px 0 30px; letter-spacing:1px; }
//           .certificate-body { flex-grow:1; text-align:center; }
//           .certificate-body p { font-size:18px; line-height:1.7; }
//           .highlight { color:#002060; font-weight:bold; }
//           .details { display:flex; justify-content:center; gap:120px; margin-bottom:30px; }
//           .detail-item { text-align:center; }
//           .date { font-size:16px; font-weight:600; border-bottom:1px solid #c0a060; padding-bottom:3px; margin-bottom:5px; }
//           .label { font-size:12px; font-weight:bold; color:#003366; text-transform:uppercase; letter-spacing:1px; }
//           .footer { position:absolute; bottom:40px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:flex-end; }
//           .signature { text-align:center; font-size:14px; }
//           .signature img { height:60px; margin-bottom:5px; }
//           .issuer { text-align:right; font-size:16px; font-weight:bold; color:#0d47a1; }
//           .date-section { text-align:right; font-size:14px; margin-top:10px; }
//         </style>
//       </head>
//       <body>
//         <div class="page">
//           <div class="certificate">
//             <div class="header">
//  <div class="left">
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
//             </div>
//             <div class="certificate-heading">
//               <h1>Green Certificate</h1>
//               <h2>CO₂ Emission Certification</h2>
//             </div>
//             <div class="certificate-body">
//               <p>This is to certify that <span class="highlight">${userInfo.userName}</span>, with vehicle number <span class="highlight">${result.vehicleNumber}</span>, has emitted <span class="highlight">${(result.co2Emission/1000).toFixed(1)}</span> unit CO₂.</p>
//               <p>It is recommended to offset this footprint by planting <span style="color:green; font-weight:bold;">${Math.ceil((result.co2Emission/1000)*12)}</span> 🌳.</p>
//             </div>
//             <div class="details">
//               <div class="detail-item">
//                 <p class="date">${result.certificateIssueDate}</p>
//                 <p class="label">Date of Issue</p>
//               </div>
//               <div class="detail-item">
//                 <p class="date">31-12-2030</p>
//                 <p class="label">Valid Upto</p>
//               </div>
//             </div>
//             <div class="footer">
//               <div class="signature">
//                 <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature">
//                 <p>Authorized Signature</p>
//               </div>
//               <div class="issuer">
//                 Issued by:<br>Transvue Solution India Pvt. Ltd.
//                 <div class="date-section">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//       `;

//       dispatch(generatePdfAsync({ userId: userInfo.userId, id: result.id || result._id, html: htmlContent }))
//         .unwrap()
//         .then((data) => {
//           console.log('📄 PDF URL:', data.signedUrl);
//           setPdfGenerating(false);
//           setIsLoading(false);
//           navigation.navigate('Result');
//         })
//         .catch((err) => {
//           console.log('❌ PDF generation error:', err);
//           setPdfGenerating(false);
//           setIsLoading(false);
//           Alert.alert('PDF Error', err.error || 'Failed to generate PDF');
//         });
//     } else if (resultStatus === 'idle' && error) {
//       setIsLoading(false);
//       Alert.alert('Error', error);
//     }
//   }, [resultStatus, result, error, pdfGenerating, dispatch, navigation, userInfo]);

//   const handleBox2Change = (text) => { 
//     if (text.length <= 6) { 
//       setBox2(text); 
//       if (text.length === 6) box3Ref.current?.focus(); 
//     } 
//   };
//   const handleBox3Change = (text) => { if (text.length <= 4) setBox3(text); };
//   const handleBox3Blur = () => {
//     const totalDigits = box2.length + box3.length;
//     if (totalDigits === 9) {
//       const newBox2 = box2.slice(0, -1);
//       const newBox3 = box2.slice(-1) + box3;
//       setBox2(newBox2);
//       setBox3(newBox3);
//     }
//   };

//   const toggleAdditionalDetails = () => setShowAdditionalDetails(!showAdditionalDetails);

//   return (
//     <View style={styles.mainContainer}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>नमस्ते {userInfo ? userInfo.userName : "Name"}</Text>
//           <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.iconContainer}>
//             <FontAwesome name="user-o" size={22} color="#004d00" />
//           </TouchableOpacity>
//         </View>

//         {/* Form */}
//         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             <Formik
//               initialValues={{
//                 VechileNumber: "",
//                 SourcePincode: "",
//                 DestinationPincode: "",
//                 LoadedWeight: "",
//                 MobilisationDistance: "",
//                 DeMobilisationDistance: "",
//                 gstin: userInfo?.gstin || "",
//                 userId: userInfo?.userId || "",
//               }}
//               onSubmit={(values, { resetForm }) => {
//                 if (!userInfo?.userId) return Alert.alert('Error', 'User info not available');
//                 setIsLoading(true);
//                 setPdfGenerating(true);
//                 values.VechileNumber = box2 + box3;
//                 values.userId = userInfo.userId;
//                 dispatch(calculateResultAsync(values));
//               }}
//             >
//               {({ handleChange, handleBlur, handleSubmit, values, resetForm }) => {
//                 // Reset form when screen refocuses
//                 useFocusEffect(
//                   React.useCallback(() => {
//                     resetForm();
//                     setBox2("");
//                     setBox3("");
//                   }, [resetForm])
//                 );

//                 return (
//                   <View style={styles.formWrapper}>
//                     {/* Vehicle Number */}
//                     <Text style={styles.label}>Vehicle Number</Text>
//                     <View style={styles.vehicleRow}>
//                       <TextInput 
//                         value={box2} 
//                         onChangeText={handleBox2Change} 
//                         maxLength={6} 
//                         ref={box2Ref} 
//                         style={styles.inputHalf} 
//                         placeholder="AB12" 
//                       />
//                       <TextInput 
//                         value={box3} 
//                         onChangeText={handleBox3Change} 
//                         onBlur={handleBox3Blur} 
//                         maxLength={4} 
//                         ref={box3Ref} 
//                         style={styles.inputHalf} 
//                         placeholder="1234" 
//                       />
//                     </View>

//                     {/* Source Pincode */}
//                     <Text style={styles.label}>Source Pincode</Text>
//                     <TextInput 
//                       onChangeText={handleChange("SourcePincode")} 
//                       onBlur={handleBlur("SourcePincode")} 
//                       value={values.SourcePincode} 
//                       placeholder="Source Pincode" 
//                       keyboardType="numeric" 
//                       maxLength={6} 
//                       style={styles.input} 
//                     />

//                     {/* Destination Pincode */}
//                     <Text style={styles.label}>Destination Pincode</Text>
//                     <TextInput 
//                       onChangeText={handleChange("DestinationPincode")} 
//                       onBlur={handleBlur("DestinationPincode")} 
//                       value={values.DestinationPincode} 
//                       placeholder="Destination Pincode" 
//                       keyboardType="numeric" 
//                       maxLength={6} 
//                       style={styles.input} 
//                     />

//                     {/* Loaded Weight */}
//                     <Text style={styles.label}>Loaded Weight (kg)</Text>
//                     <TextInput 
//                       onChangeText={handleChange("LoadedWeight")} 
//                       onBlur={handleBlur("LoadedWeight")} 
//                       value={values.LoadedWeight} 
//                       placeholder="Loaded Weight" 
//                       keyboardType="numeric" 
//                       style={styles.input} 
//                     />

//                     {/* GSTIN */}
//                     <Text style={styles.label}>GSTIN</Text>
//                     <TextInput 
//                       onChangeText={handleChange("gstin")} 
//                       onBlur={handleBlur("gstin")} 
//                       value={values.gstin ? values.gstin.toUpperCase() : ""} 
//                       placeholder="GSTIN" 
//                       maxLength={16} 
//                       style={styles.input} 
//                     />

//                     {/* Optional details toggle */}
//                     <TouchableOpacity onPress={toggleAdditionalDetails}>
//                       <Text style={styles.toggleText}>
//                         Additional Details (optional) {showAdditionalDetails ? "▲" : "▼"}
//                       </Text>
//                     </TouchableOpacity>

//                     {showAdditionalDetails && (
//                       <>
//                         <TextInput 
//                           placeholder="Mobilisation Distance" 
//                           value={values.MobilisationDistance} 
//                           onChangeText={handleChange("MobilisationDistance")} 
//                           style={styles.input} 
//                           keyboardType="numeric" 
//                         />
//                         <TextInput 
//                           placeholder="DeMobilisation Distance" 
//                           value={values.DeMobilisationDistance} 
//                           onChangeText={handleChange("DeMobilisationDistance")} 
//                           style={styles.input} 
//                           keyboardType="numeric" 
//                         />
//                       </>
//                     )}

//                     {/* Submit */}
//                     <TouchableOpacity onPress={handleSubmit}>
//                       <View style={styles.submitButton}>
//                         {isLoading 
//                           ? <ActivityIndicator size="small" color="#fff" /> 
//                           : <Text style={styles.submitButtonText}>Submit</Text>
//                         }
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 );
//               }}
//             </Formik>
//           </ScrollView>
//         </KeyboardAvoidingView>

//         {/* Footer */}
//         {!isKeyboardVisible && (
//           <View style={styles.footerContainer}>
//             <Image source={mantraImage} style={styles.footerImage1} />
//             <Image source={makeInIndiaLogo} style={styles.footerImage2} />
//           </View>
//         )}

//         {/* PDF Generating Overlay */}
//         {pdfGenerating && (
//           <View style={styles.overlayLoader}>
//             <ActivityIndicator size="large" color="#004d00" />
//             <Text style={{ color:'#004d00', marginTop:10 }}>Generating PDF, please wait...</Text>
//           </View>
//         )}
//       </ImageBackground>
//     </View>
//   );
// };

// export default Calculator;

// const styles = StyleSheet.create({
//   mainContainer: { flex: 1 },
//   imageBackground: { flex: 1 },
//   overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
//   overlayLoader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent:'center', alignItems:'center', zIndex:10 },
//   headerContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
//   headerText: { fontSize: 20, color: '#004d00', fontWeight: 'bold' },
//   iconContainer: { padding: 8 },
//   formContainer: { flex: 1, paddingHorizontal: 16 },
//   formWrapper: { marginVertical: 16 },
//   subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
//   label: { marginTop: 12, marginBottom: 4 },
//   vehicleRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   iconInputWrapper: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
//   inputHalf: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, height: 40, marginHorizontal: 4 },
//   input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, height: 40 },
//   toggleText: { color: '#004d00', marginVertical: 8 },
//   submitButton: { backgroundColor: '#004d00', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
//   submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   footerContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
//   footerImage1: { width: 100, height: 50, resizeMode: 'contain' },
//   footerImage2: { width: 100, height: 50, resizeMode: 'contain' },
// });




import React, { useEffect, useRef, useState } from 'react';
import { 
  ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, 
  Text, TouchableOpacity, View, ActivityIndicator, Alert, Keyboard, Platform, TextInput, Image, Modal 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Formik } from 'formik';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  calculateResultAsync, 
  selectUserInfo, 
  generatePdfAsync, 
  selectPdfUrl 
} from './calculatorSlice';

import mantraImage from "../../assets/images/mantra.jpg";
import makeInIndiaLogo from "../../assets/images/make-in-India-logo.png";

const Calculator = () => {
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [box2, setBox2] = useState('');
  const [box3, setBox3] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const box2Ref = useRef(null);
  const box3Ref = useRef(null);

  const userInfo = useSelector(selectUserInfo);
  const result = useSelector(state => state.calculator.result);
  const resultStatus = useSelector(state => state.calculator.status);
  const error = useSelector(state => state.calculator.error);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Handle calculation result & PDF generation
  useEffect(() => {
    if (resultStatus === 'idle' && result && pdfGenerating) {
      if (!userInfo?.userId) return;

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of CO₂ Emission</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin:0; padding:0; }
          .page { width: 210mm; height: 297mm; background:#f7f7f7; display:flex; justify-content:center; align-items:center; }
          .certificate { position:relative; width:210mm; height:297mm; margin:auto; background:#fff; border:20px solid #0d47a1; box-sizing:border-box; padding:60px 50px 120px 50px; display:flex; flex-direction:column; justify-content:space-between; }
    .header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 20px;
    }
          .header .left { font-size:14px; text-align:left; }
          .header .center img { height:120px; }
          .header .right { text-align:right; display:flex; flex-direction:column; align-items:center; justify-content:center; }
          .header .right img { display:block; margin:8px auto; }
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
          .date-section { text-align:right; font-size:14px; margin-top:10px; }
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
              <h1>Green Certificate</h1>
              <h2>CO₂ Emission Certification</h2>
            </div>
            <div class="certificate-body">
              <p>This is to certify that <span class="highlight">${userInfo.userName}</span>, with vehicle number <span class="highlight">${result.vehicleNumber}</span>, has emitted <span class="highlight">${(result.co2Emission/1000).toFixed(1)}</span> unit CO₂.</p>
              <p>It is recommended to offset this footprint by planting <span style="color:green; font-weight:bold;">${Math.ceil((result.co2Emission/1000)*12)}</span> 🌳.</p>
            </div>
            <div class="details">
              <div class="detail-item">
                <p class="date">${result.certificateIssueDate}</p>
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
                <div class="date-section">Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      dispatch(generatePdfAsync({ userId: userInfo.userId, id: result.id || result._id, html: htmlContent }))
        .unwrap()
        .then((data) => {
          console.log('📄 Presigned PDF URL:', data.signedUrl);
          setPdfGenerating(false);
          navigation.navigate('Result');
        })
        .catch((err) => {
          console.log('❌ PDF generation error:', err);
          setPdfGenerating(false);
          Alert.alert('PDF Error', err.error || 'Failed to generate PDF');
        });
    } else if (resultStatus === 'idle' && error) {
      setPdfGenerating(false);
      Alert.alert('Error', error);
    }
  }, [resultStatus, result, error, pdfGenerating, dispatch, navigation, userInfo]);

  const handleBox2Change = (text) => { 
    if (text.length <= 6) { 
      setBox2(text); 
      if (text.length === 6) box3Ref.current?.focus(); 
    } 
  };
  const handleBox3Change = (text) => { if (text.length <= 4) setBox3(text); };
  const handleBox3Blur = () => {
    const totalDigits = box2.length + box3.length;
    if (totalDigits === 9) {
      const newBox2 = box2.slice(0, -1);
      const newBox3 = box2.slice(-1) + box3;
      setBox2(newBox2);
      setBox3(newBox3);
    }
  };

  const toggleAdditionalDetails = () => setShowAdditionalDetails(!showAdditionalDetails);

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../../assets/images/Pure Prakriti bg img.jpg")}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <View style={styles.overlay} />

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>नमस्ते {userInfo ? userInfo.userName : "Name"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.iconContainer}>
            <FontAwesome name="user-o" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Formik
              initialValues={{
                VechileNumber: "",
                SourcePincode: "",
                DestinationPincode: "",
                LoadedWeight: "",
                MobilisationDistance: "",
                DeMobilisationDistance: "",
                gstin: userInfo?.gstin || "",
                userId: userInfo?.userId || "",
              }}
              onSubmit={(values, { resetForm }) => {
                if (!userInfo?.userId) return Alert.alert('Error', 'User info not available');
                setPdfGenerating(true);
                values.VechileNumber = box2 + box3;
                values.userId = userInfo.userId;
                dispatch(calculateResultAsync(values));
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, resetForm }) => {
                useFocusEffect(
                  React.useCallback(() => {
                    resetForm();
                    setBox2("");
                    setBox3("");
                  }, [resetForm])
                );

                return (
                  <View style={styles.formWrapper}>
                    <Text style={styles.subtitle}>Trip Details</Text>
                    <Text style={styles.label}>Vehicle Number</Text>
                    <View style={styles.vehicleRow}>
                      <TextInput 
                        value={box2} 
                        onChangeText={handleBox2Change} 
                        maxLength={6} 
                        ref={box2Ref} 
                        style={styles.inputHalf} 
                        placeholder="AB12" 
                      />
                      <TextInput 
                        value={box3} 
                        onChangeText={handleBox3Change} 
                        onBlur={handleBox3Blur} 
                        maxLength={4} 
                        ref={box3Ref} 
                        style={styles.inputHalf} 
                        placeholder="1234" 
                      />
                    </View>

                    <Text style={styles.label}>Source Pincode</Text>
                    <TextInput 
                      onChangeText={handleChange("SourcePincode")} 
                      onBlur={handleBlur("SourcePincode")} 
                      value={values.SourcePincode} 
                      placeholder="Source Pincode" 
                      keyboardType="numeric" 
                      maxLength={6} 
                      style={styles.input} 
                    />

                    <Text style={styles.label}>Destination Pincode</Text>
                    <TextInput 
                      onChangeText={handleChange("DestinationPincode")} 
                      onBlur={handleBlur("DestinationPincode")} 
                      value={values.DestinationPincode} 
                      placeholder="Destination Pincode" 
                      keyboardType="numeric" 
                      maxLength={6} 
                      style={styles.input} 
                    />

                    <Text style={styles.label}>Loaded Weight (kg)</Text>
                    <TextInput 
                      onChangeText={handleChange("LoadedWeight")} 
                      onBlur={handleBlur("LoadedWeight")} 
                      value={values.LoadedWeight} 
                      placeholder="Loaded Weight" 
                      keyboardType="numeric" 
                      style={styles.input} 
                    />

                    <Text style={styles.label}>GSTIN</Text>
                    <TextInput 
                      onChangeText={handleChange("gstin")} 
                      onBlur={handleBlur("gstin")} 
                      value={values.gstin ? values.gstin.toUpperCase() : ""} 
                      placeholder="GSTIN" 
                      maxLength={16} 
                      style={styles.input} 
                    />

                    <TouchableOpacity onPress={toggleAdditionalDetails}>
                      <Text style={styles.toggleText}>
                        Additional Details (optional) {showAdditionalDetails ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                    {showAdditionalDetails && (
                      <>
                        <TextInput 
                          placeholder="Mobilisation Distance" 
                          value={values.MobilisationDistance} 
                          onChangeText={handleChange("MobilisationDistance")} 
                          style={styles.input} 
                          keyboardType="numeric" 
                        />
                        <TextInput 
                          placeholder="DeMobilisation Distance" 
                          value={values.DeMobilisationDistance} 
                          onChangeText={handleChange("DeMobilisationDistance")} 
                          style={styles.input} 
                          keyboardType="numeric" 
                        />
                      </>
                    )}

                    <TouchableOpacity onPress={handleSubmit}>
                      <View style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              }}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        {!isKeyboardVisible && (
          <View style={styles.footerContainer}>
            <Image source={mantraImage} style={styles.footerImage1} />
            <Image source={makeInIndiaLogo} style={styles.footerImage2} />
          </View>
        )}

        {/* PDF Generating Overlay */}
        <Modal transparent visible={pdfGenerating} animationType="fade">
          <View style={styles.overlayModal}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#004d00" />
              <Text style={{ marginTop: 10, fontWeight: 'bold' }}>⏳ Generating PDF, please wait...</Text>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default Calculator;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  imageBackground: {
    flex: 1,
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  headerContainer: {
    width: "100%",
    height: "14%",
    backgroundColor: "#006400",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  iconContainer: { padding: 8 },
  formContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 18,
  },
 formWrapper: {
    padding: 20,
  },
    subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "500",
  },
  vehicleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputHalf: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, height: 40, marginHorizontal: 4 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, height: 40, marginVertical: 4 },
  toggleText: { color: '#004d00', marginVertical: 8 },
  submitButton: { backgroundColor: '#004d00', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
    width: '100%',
  },
  footerImage1: {
    width: 50,
    height: 40,
    resizeMode: 'contain',
  },
  footerImage2: {
    width: 70,
    height: 60,
    resizeMode: 'contain',
  },
  overlayModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  loadingBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
});


// import React, { useEffect, useRef, useState } from 'react';
// import { 
//   ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, 
//   Text, TouchableOpacity, View, ActivityIndicator, Alert, Keyboard, Platform, TextInput, Image, Modal 
// } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { Formik } from 'formik';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   calculateResultAsync, 
//   selectUserInfo, 
//   generatePdfAsync, 
//   selectPdfUrl 
// } from './calculatorSlice';

// import mantraImage from "../../assets/images/mantra.jpg";
// import makeInIndiaLogo from "../../assets/images/make-in-India-logo.png";

// const Calculator = () => {
//   const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
//   const [box2, setBox2] = useState('');
//   const [box3, setBox3] = useState('');
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const [pdfGenerating, setPdfGenerating] = useState(false);

//   const box2Ref = useRef(null);
//   const box3Ref = useRef(null);

//   const userInfo = useSelector(selectUserInfo);
//   const result = useSelector(state => state.calculator.result);
//   const resultStatus = useSelector(state => state.calculator.status);
//   const error = useSelector(state => state.calculator.error);

//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   // Keyboard visibility
//   useEffect(() => {
//     const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
//     const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
//     return () => { showSub.remove(); hideSub.remove(); };
//   }, []);

//   // Handle calculation result & PDF generation
//   useEffect(() => {
//     if (resultStatus === 'idle' && result && pdfGenerating) {
//       if (!userInfo?.userId) return;

//       const htmlContent = `<!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <meta name="viewport" content="width=device-width, initial-scale=1.0">
// <title>Certificate of CO2 Emission</title>
// <style>
// @font-face { font-family: 'Magnolia Script'; src: url('https://raw.githubusercontent.com/nitish1899/Image/main/MagnoliaScript.ttf') format('truetype'); }
// body { font-family: 'Playfair Display', serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8f9fa; margin: 0; }
// .certificate { border: 10px solid #D4AF37; padding: 30px; width: 700px; text-align: center; background-color: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.2); position: relative; background: url('https://www.toptal.com/designers/subtlepatterns/patterns/symphony.png'); }
// .certificate h1 { font-size: 36px; margin-bottom: 20px; font-style: italic; font-family: 'Magnolia Script', cursive; color: #D4AF37; }
// .certificate p { font-size: 18px; margin: 10px 0; }
// .certificate .highlight { font-weight: bold; color: #2c3e50; }
// .top-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
// .top-section p { margin: 0; font-size: 16px; }
// .logos { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
// .logos-left, .logos-right { display: flex; flex-direction: column; }
// .logos-left a img { height: 20px; margin-bottom: 5px; }
// .logos-right img { height: 60px; width: 60px; margin-right: 5px; margin-bottom: 5px; }
// .info-section p { text-align: left; margin: 5px 0; font-size: 7px; }
// .signature-section { margin-top: 40px; text-align: right; }
// .signature-line { margin-top: 20px; border-top: 1px solid #000; width: 250px; margin-left: auto; margin-right: 0; }
// .issuer-section { margin-top: 40px; text-align: center; }
// </style>
// </head>
// <body>
// <div class="certificate">
//   <div class="logos">
//     <div class="logos-left">
//       <a target="_blank" href="https://dpiit.gov.in"><img src="https://github.com/nitish1899/Image/blob/main/DPIIT-1719464112334.png?raw=true" alt="DPIIT Logo" /></a>
//       <a target="_blank" href="https://www.startupindia.gov.in"><img src="https://github.com/nitish1899/Image/blob/main/Logo1.png?raw=true" alt="Startup India Logo" /></a>
//     </div>
//     <div class="logos-right">
//       <img src="https://raw.githubusercontent.com/nitish1899/Image/main/pureprukriti.png" alt="TSIL Logo" />
//     </div>
//   </div>
//   <div class="top-section">
//     <p>Certificate Number: <span class="highlight">${result.certificateNumber}</span></p>
//     <p>Date: <span class="highlight">${result.certificateIssueDate}</span></p>
//   </div>
//   <h1>Certificate of CO2 Emission</h1>
//   <p>This is to certify that the vehicle owned/hired by</p>
//   <p class="highlight">${userInfo.userName}</p>
//   <p>with vehicle number</p>
//   <p class="highlight">${result.vehicleNumber}</p>
//   <p>has emitted</p>
//   <p><span class="highlight">${(result.co2Emission/1000).toFixed(1)}</span> unit CO2</p>

//   <div class="signature-section">
//     <img src="https://raw.githubusercontent.com/nitish1899/Image/main/sign1.png" alt="Signature" height="50" width="200" />
//     <p>Authorized Signature</p>
//   </div>

//   <div class="issuer-section">
//     <p>Issued by:</p>
//     <p class="highlight">Transvue Solution India Pvt. Ltd.</p>
//   </div>

//   <div style="display: flex;">
//     <div class="info-section">
//       <p>* The above result is based on user input.</p>
//       <p>* Additional details are based on US/UK research.</p>
//     </div>
//     <div style="margin-left: auto;">
//       <p>Time: <span class="highlight">${new Date().toLocaleTimeString()}</span></p>
//     </div>
//   </div>
// </div>
// </body>
// </html>`;

//       dispatch(generatePdfAsync({ userId: userInfo.userId, id: result.id || result._id, html: htmlContent }))
//         .unwrap()
//         .then((data) => {
//           console.log('📄 Presigned PDF URL:', data.signedUrl);
//           setPdfGenerating(false);
//           navigation.navigate('Result');
//         })
//         .catch((err) => {
//           console.log('❌ PDF generation error:', err);
//           setPdfGenerating(false);
//           Alert.alert('PDF Error', err.error || 'Failed to generate PDF');
//         });
//     } else if (resultStatus === 'idle' && error) {
//       setPdfGenerating(false);
//       Alert.alert('Error', error);
//     }
//   }, [resultStatus, result, error, pdfGenerating, dispatch, navigation, userInfo]);

//   const handleBox2Change = (text) => { 
//     if (text.length <= 6) { 
//       setBox2(text); 
//       if (text.length === 6) box3Ref.current?.focus(); 
//     } 
//   };
//   const handleBox3Change = (text) => { if (text.length <= 4) setBox3(text); };
//   const handleBox3Blur = () => {
//     const totalDigits = box2.length + box3.length;
//     if (totalDigits === 9) {
//       const newBox2 = box2.slice(0, -1);
//       const newBox3 = box2.slice(-1) + box3;
//       setBox2(newBox2);
//       setBox3(newBox3);
//     }
//   };

//   const toggleAdditionalDetails = () => setShowAdditionalDetails(!showAdditionalDetails);

//   return (
//     <View style={styles.mainContainer}>
//       <ImageBackground
//         source={require("../../assets/images/Pure Prakriti bg img.jpg")}
//         resizeMode="cover"
//         style={styles.imageBackground}
//       >
//         <View style={styles.overlay} />

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>नमस्ते {userInfo ? userInfo.userName : "Name"}</Text>
//           <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.iconContainer}>
//             <FontAwesome name="user-o" size={22} color="#004d00" />
//           </TouchableOpacity>
//         </View>

//         {/* Form */}
//         <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             <Formik
//               initialValues={{
//                 VechileNumber: "",
//                 SourcePincode: "",
//                 DestinationPincode: "",
//                 LoadedWeight: "",
//                 MobilisationDistance: "",
//                 DeMobilisationDistance: "",
//                 gstin: userInfo?.gstin || "",
//                 userId: userInfo?.userId || "",
//               }}
//               onSubmit={(values, { resetForm }) => {
//                 if (!userInfo?.userId) return Alert.alert('Error', 'User info not available');
//                 setPdfGenerating(true);
//                 values.VechileNumber = box2 + box3;
//                 values.userId = userInfo.userId;
//                 dispatch(calculateResultAsync(values));
//               }}
//             >
//               {({ handleChange, handleBlur, handleSubmit, values, resetForm }) => {
//                 useFocusEffect(
//                   React.useCallback(() => {
//                     resetForm();
//                     setBox2("");
//                     setBox3("");
//                   }, [resetForm])
//                 );

//                 return (
//                   <View style={styles.formWrapper}>
//                     <Text style={styles.label}>Vehicle Number</Text>
//                     <View style={styles.vehicleRow}>
//                       <TextInput 
//                         value={box2} 
//                         onChangeText={handleBox2Change} 
//                         maxLength={6} 
//                         ref={box2Ref} 
//                         style={styles.inputHalf} 
//                         placeholder="AB12" 
//                       />
//                       <TextInput 
//                         value={box3} 
//                         onChangeText={handleBox3Change} 
//                         onBlur={handleBox3Blur} 
//                         maxLength={4} 
//                         ref={box3Ref} 
//                         style={styles.inputHalf} 
//                         placeholder="1234" 
//                       />
//                     </View>

//                     <Text style={styles.label}>Source Pincode</Text>
//                     <TextInput 
//                       onChangeText={handleChange("SourcePincode")} 
//                       onBlur={handleBlur("SourcePincode")} 
//                       value={values.SourcePincode} 
//                       placeholder="Source Pincode" 
//                       keyboardType="numeric" 
//                       maxLength={6} 
//                       style={styles.input} 
//                     />

//                     <Text style={styles.label}>Destination Pincode</Text>
//                     <TextInput 
//                       onChangeText={handleChange("DestinationPincode")} 
//                       onBlur={handleBlur("DestinationPincode")} 
//                       value={values.DestinationPincode} 
//                       placeholder="Destination Pincode" 
//                       keyboardType="numeric" 
//                       maxLength={6} 
//                       style={styles.input} 
//                     />

//                     <Text style={styles.label}>Loaded Weight (kg)</Text>
//                     <TextInput 
//                       onChangeText={handleChange("LoadedWeight")} 
//                       onBlur={handleBlur("LoadedWeight")} 
//                       value={values.LoadedWeight} 
//                       placeholder="Loaded Weight" 
//                       keyboardType="numeric" 
//                       style={styles.input} 
//                     />

//                     <Text style={styles.label}>GSTIN</Text>
//                     <TextInput 
//                       onChangeText={handleChange("gstin")} 
//                       onBlur={handleBlur("gstin")} 
//                       value={values.gstin ? values.gstin.toUpperCase() : ""} 
//                       placeholder="GSTIN" 
//                       maxLength={16} 
//                       style={styles.input} 
//                     />

//                     <TouchableOpacity onPress={toggleAdditionalDetails}>
//                       <Text style={styles.toggleText}>
//                         Additional Details (optional) {showAdditionalDetails ? "▲" : "▼"}
//                       </Text>
//                     </TouchableOpacity>

//                     {showAdditionalDetails && (
//                       <>
//                         <TextInput 
//                           placeholder="Mobilisation Distance" 
//                           value={values.MobilisationDistance} 
//                           onChangeText={handleChange("MobilisationDistance")} 
//                           style={styles.input} 
//                           keyboardType="numeric" 
//                         />
//                         <TextInput 
//                           placeholder="DeMobilisation Distance" 
//                           value={values.DeMobilisationDistance} 
//                           onChangeText={handleChange("DeMobilisationDistance")} 
//                           style={styles.input} 
//                           keyboardType="numeric" 
//                         />
//                       </>
//                     )}

//                     <TouchableOpacity onPress={handleSubmit}>
//                       <View style={styles.submitButton}>
//                         <Text style={styles.submitButtonText}>Submit</Text>
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 );
//               }}
//             </Formik>
//           </ScrollView>
//         </KeyboardAvoidingView>

//         {/* Footer */}
//         {!isKeyboardVisible && (
//           <View style={styles.footerContainer}>
//             <Image source={mantraImage} style={styles.footerImage1} />
//             <Image source={makeInIndiaLogo} style={styles.footerImage2} />
//           </View>
//         )}

//         {/* PDF Generating Overlay */}
//         <Modal transparent visible={pdfGenerating} animationType="fade">
//           <View style={styles.overlayModal}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color="#004d00" />
//               <Text style={{ marginTop: 10, fontWeight: 'bold' }}>⏳ Generating PDF, please wait...</Text>
//             </View>
//           </View>
//         </Modal>
//       </ImageBackground>
//     </View>
//   );
// };

// export default Calculator;

// const styles = StyleSheet.create({
//   mainContainer: { flex: 1 },
//   imageBackground: { flex: 1 },
//   overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
//   headerContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
//   headerText: { fontSize: 20, color: '#004d00', fontWeight: 'bold' },
//   iconContainer: { padding: 8 },
//   formContainer: { flex: 1, paddingHorizontal: 16 },
//   formWrapper: { marginVertical: 16 },
//   label: { marginTop: 12, marginBottom: 4 },
//   vehicleRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   inputHalf: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, height: 40, marginHorizontal: 4 },
//   input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 8, height: 40, marginVertical: 4 },
//   toggleText: { color: '#004d00', marginVertical: 8 },
//   submitButton: { backgroundColor: '#004d00', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
//   submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   footerContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
//   footerImage1: { width: 100, height: 50, resizeMode: 'contain' },
//   footerImage2: { width: 100, height: 50, resizeMode: 'contain' },
//   overlayModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
//   loadingBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
// });


