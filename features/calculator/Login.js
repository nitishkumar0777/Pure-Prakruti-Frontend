import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loginAsync, selectIsAuthenticated } from './calculatorSlice';

const phoneRegex = /^\d{10}$/;
const signUpSchema = yup.object().shape({
  mobileNumber: yup
    .string()
    .matches(phoneRegex, 'Enter a valid 10-digit phone number')
    .required('Phone number is required'),
  pin: yup
    .string()
    .min(4, 'Length should be 4')
    .max(4, 'Length should be 4')
    .required('PIN is required'),
});

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector((state) => state.calculator.error);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

useEffect(() => {
  if (isAuthenticated) {
    setIsLoading(false);
    navigation.navigate('Calculator');
  } else if (error) {
    setIsLoading(false);
    const errorMsg = typeof error === 'string' ? error : JSON.stringify(error);
    Alert.alert('Error', errorMsg);
  }
}, [isAuthenticated, error]);


const handleSubmit = async (values) => {
  setIsLoading(true);
  dispatch(loginAsync({
    mobileNumber: values.mobileNumber.trim(),
    pin: values.pin.trim()
  }));
};

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require('../../assets/images/Pure Prakriti bg img.jpg')}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>

            {/* Logo + Heading */}
            <View style={styles.centerContent}>
              <Image
                source={require('../../assets/images/pureP.png')}
                style={styles.logo}
              />
              <Text style={styles.title}>Log in or Sign up</Text>
              <Text style={styles.subtitle}>Login with your WhatsApp Number</Text>
            </View>

            {/* Login Form */}
            <Formik
              initialValues={{ mobileNumber: '', pin: '' }}
              validationSchema={signUpSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.formWrapper}>

                  {/* Mobile Number */}
                  <Text style={styles.label}>Mobile Number</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      onChangeText={handleChange('mobileNumber')}
                      onBlur={handleBlur('mobileNumber')}
                      value={values.mobileNumber}
                      placeholder="Enter mobile number"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                  {errors.mobileNumber && touched.mobileNumber && (
                    <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                  )}

                  {/* PIN */}
                  <Text style={styles.label}>PIN</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      onChangeText={handleChange('pin')}
                      onBlur={handleBlur('pin')}
                      value={values.pin}
                      placeholder="Enter 4-digit PIN"
                      keyboardType="numeric"
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                  {errors.pin && touched.pin && (
                    <Text style={styles.errorText}>{errors.pin}</Text>
                  )}

                  {/* Gradient Login Button */}
                  <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#0d47a1', '#1976d2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>Login</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Signup Link */}
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Signup')}
                    style={styles.signupContainer}
                  >
                    <Text style={styles.signupText}>New User?</Text>
                    <Text style={styles.signupLink}> Signup</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer Text */}
        {!isKeyboardVisible && (
          <View style={styles.footerContainer}>
            <Text style={styles.termsText}>
              By logging in, you agree to our{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('TermsScreen')}
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageBackground: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B0000',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginTop: 5,
  },
  formWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 42,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
  submitButton: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#0d47a1',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  signupText: {
    fontSize: 12,
    color: '#555',
  },
  signupLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d47a1',
  },
  footerContainer: {
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  termsText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  linkText: {
    color: '#0d47a1',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default App;

