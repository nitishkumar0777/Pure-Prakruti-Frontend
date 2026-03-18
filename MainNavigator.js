import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Calculator from './features/calculator/Calculator';
import Calculator2 from './features/calculator/Calculator2';
import Login from './features/calculator/Login';
import Result from './features/calculator/Result';
import Test from './features/calculator/Test';
import Test2 from './features/calculator/Test2';
import Signup from './features/calculator/Signup';
import Profile from './features/calculator/Profile';
import Printer from './features/calculator/Printer';
import Splash1 from './screens/Splash1';
import Splash2 from './screens/Splash2';
import { selectIsAuthenticated } from './features/calculator/calculatorSlice';
import { useSelector } from 'react-redux';
import TermsScreen from './features/calculator/TermsScreen ';
import VehicleRegistrationScreen from './features/calculator/Vehicleregistrationscreen';

const Stack = createNativeStackNavigator();

export default () => {
  const [splash1Visible, setSplash1Visible] = useState(true);
  const [splash2Visible, setSplash2Visible] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setSplash1Visible(false);
      setSplash2Visible(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setSplash2Visible(false);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      {splash2Visible && <Splash2 />}
      {!splash1Visible && !splash2Visible && (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Calculator"           component={Calculator} />
              <Stack.Screen name="Calculator2"          component={Calculator2} />
              <Stack.Screen name="Printer"              component={Printer} />
              <Stack.Screen name="Result"               component={Result} />
              <Stack.Screen name="Test"                 component={Test} />
              <Stack.Screen name="Test2"                component={Test2} />
              <Stack.Screen name="Profile"              component={Profile} />
              {/* ✅ VehicleRegistration here — signup ke baad
                  isAuthenticated true hone par bhi navigate ho sake */}
              <Stack.Screen name="VehicleRegistration"  component={VehicleRegistrationScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login"                component={Login} />
              <Stack.Screen name="TermsScreen"          component={TermsScreen} />
              <Stack.Screen name="Splash1"              component={Splash1} />
              <Stack.Screen name="Splash2"              component={Splash2} />
              <Stack.Screen name="Signup"               component={Signup} />
              {/* ✅ VehicleRegistration here too — agar isAuthenticated
                  false rahe tab bhi kaam kare */}
              <Stack.Screen name="VehicleRegistration"  component={VehicleRegistrationScreen} />
            </>
          )}
        </Stack.Navigator>
      )}
    </>
  );
};

// // import { createStackNavigator } from '@react-navigation/stack';
// import React, { useState, useEffect } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Calculator from './features/calculator/Calculator';
// import Calculator2 from './features/calculator/Calculator2';
// import Login from './features/calculator/Login';
// import Result from './features/calculator/Result';
// import Test from './features/calculator/Test';
// import Test2 from './features/calculator/Test2';
// import Signup from './features/calculator/Signup';
// import Profile from './features/calculator/Profile';
// import Printer from './features/calculator/Printer';
// import Splash1 from './screens/Splash1';
// import Splash2 from './screens/Splash2';
// import { selectIsAuthenticated } from './features/calculator/calculatorSlice';
// import { useSelector } from 'react-redux';
// import TermsScreen from './features/calculator/TermsScreen ';
// const Stack = createNativeStackNavigator();

// export default () => {

//    const [splash1Visible, setSplash1Visible] = useState(true);
//   const [splash2Visible, setSplash2Visible] = useState(false);
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   useEffect(() => {
//     const timer1 = setTimeout(() => {
//       setSplash1Visible(false);
//       setSplash2Visible(true);
//     }, 2000); 

//     const timer2 = setTimeout(() => {
//       setSplash2Visible(false);
//     }, 4000); // Set duration for Splash2 (in milliseconds)

//     return () => {
//       clearTimeout(timer1);
//       clearTimeout(timer2);
//     };
//   }, []);

//    return (
//       <>
//       {/* {splash1Visible && <Splash1 />} */}
//       {splash2Visible && <Splash2 />}
//       {!splash1Visible && !splash2Visible && (
       

//    <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
//      {isAuthenticated ? (
//       <>
//       <Stack.Screen name="Calculator" component={Calculator} />
//       <Stack.Screen name="Calculator2" component={Calculator2} />
//       <Stack.Screen name="Printer" component={Printer} />
//       <Stack.Screen name="Result" component={Result} />
//       <Stack.Screen name="Test" component={Test} />
//       <Stack.Screen name="Test2" component={Test2} />
      
//       <Stack.Screen name="Profile" component={Profile} />
//       </>
//      ) : (
//       <>
//    <Stack.Screen name="Login" component={Login} />
//    <Stack.Screen name="TermsScreen" component={TermsScreen} />
//    <Stack.Screen name="Splash1" component={Splash1} />
//    <Stack.Screen name="Splash2" component={Splash2} />
//    <Stack.Screen name="Signup" component={Signup} />
//    </>
//      )}
// </Stack.Navigator>
//    )}  
//  </>
// );

// }