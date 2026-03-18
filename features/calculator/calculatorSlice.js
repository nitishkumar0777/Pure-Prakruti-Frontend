import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  calculateResult,
  fetchCount,
  login,
  sendNumber,
  signup,
  verifyOtp,
  generatePdf 
} from './calculatorApi';

// Initial state
const initialState = {
 value: 0,
  status: 'idle',
  result: null,
  error: null,
  pdfUrl: null,
  presignedUrl: null,
  isAuthenticated: false,
  userInfo: null,
  isOtpVerified: false,
  isNumberReceived: false,
  userExist: null,
};

// ==========================
// Async Thunks
// ==========================

// Fetch count (example)
export const incrementAsync = createAsyncThunk(
  'calculator/fetchCount',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await fetchCount(amount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Calculate CO2
export const calculateResultAsync = createAsyncThunk(
  'calculator/calculateResult',
  async (info, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!info.mobileNumber && state.calculator.userInfo) {
        info.mobileNumber = state.calculator.userInfo.mobileNumber;
      }
      const response = await calculateResult(info);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.error || error?.message || 'Calculation failed');
    }
  }
);

// Signup
export const signupAsync = createAsyncThunk(
  'calculator/signup',
  async (signupInfo, { rejectWithValue }) => {
    try {
      const response = await signup(signupInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Login
export const loginAsync = createAsyncThunk(
  'calculator/login',
  async (loginInfo, { rejectWithValue }) => {
    try {
      const response = await login(loginInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.error || error?.message || 'Login failed');
    }
  }
);

// Send number
export const sendNumberAsync = createAsyncThunk(
  'calculator/sendNumber',
  async (sendNumberInfo, { rejectWithValue }) => {
    try {
      const response = await sendNumber(sendNumberInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Verify OTP
export const verifyOtpAsync = createAsyncThunk(
  'calculator/verifyOtp',
  async (verifyOtpInfo, { rejectWithValue }) => {
    try {
      const response = await verifyOtp(verifyOtpInfo);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generatePdfAsync = createAsyncThunk(
  'calculator/generatePdf',
  async ({ userId, id, html }, { rejectWithValue }) => {
    try {
      const response = await generatePdf({ userId, id, html });

      // ✅ Safely extract URL and signed URL
      const url = response?.url || null;
      const signedUrl = response?.signedUrl || null;

      if (!url || !signedUrl) {
        return rejectWithValue('Invalid PDF response from server');
      }

      return { url, signedUrl };
    } catch (error) {
      return rejectWithValue(error?.response?.data || error?.message || 'PDF generation failed');
    }
  }
);

// export const generatePdfAsync = createAsyncThunk(
//   'calculator/generatePdf',
//   async ({ userId, id, html }, { rejectWithValue }) => {
//     try {
//       const { url, signedUrl } = await generatePdf({ userId, id, html });
//       return { url, signedUrl }; // ✅ now Redux will have both
//     } catch (error) {
//       return rejectWithValue(error.error || "PDF generation failed");
//     }
//   }
// );

// export const generatePdfAsync = createAsyncThunk(
//   'calculator/generatePdf',
//   async ({ userId, id, html }, { rejectWithValue }) => {
//     try {
//       const pdfUrl = await generatePdf({ userId, id, html });
//       return pdfUrl;
//     } catch (error) {
//       return rejectWithValue(error.error || "PDF generation failed");
//     }
//   }
// );

// ==========================
// Slice
// ==========================
const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    setPdfUrl: (state, action) => { state.pdfUrl = action.payload; },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.result = null;
      state.error = null;
      state.pdfUrl = null;
      state.presignedUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Increment
      .addCase(incrementAsync.pending, (state) => { state.status = 'loading'; })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value += action.payload;
      })
      .addCase(incrementAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })

      // Calculate CO2
      .addCase(calculateResultAsync.pending, (state) => { state.status = 'loading'; })
      .addCase(calculateResultAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.result = action.payload;
        state.error = null;
      })
      .addCase(calculateResultAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
        state.result = null;
      })

      // Signup
      .addCase(signupAsync.pending, (state) => { state.status = 'loading'; })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.userInfo = action.payload?.data || action.payload;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Login
      .addCase(loginAsync.pending, (state) => { state.status = 'loading'; })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.userInfo = action.payload?.data || action.payload;
        state.userExist = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.isAuthenticated = false;
        state.error = action.payload;
        state.userExist = false;
      })

      // Send Number
      .addCase(sendNumberAsync.pending, (state) => { state.status = 'loading'; })
      .addCase(sendNumberAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.isNumberReceived = action.payload?.data || true;
      })
      .addCase(sendNumberAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtpAsync.pending, (state) => { state.status = 'loading'; })
      .addCase(verifyOtpAsync.fulfilled, (state) => {
        state.status = 'idle';
        state.isOtpVerified = true;
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.isOtpVerified = false;
        state.error = action.payload;
      })

      // Generate PDF
.addCase(generatePdfAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generatePdfAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.pdfUrl = action.payload.url;
        state.presignedUrl = action.payload.signedUrl;
      })
      .addCase(generatePdfAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload || 'PDF generation failed';
      });
  },
});

// ==========================
// Exports
// ==========================
export const { increment, setPdfUrl, setUserInfo, logout } = calculatorSlice.actions;

export const selectCount = (state) => state.calculator.value;
export const selectCalculatorResult = (state) => state.calculator.result;
export const selectPdfUrl = (state) => state.calculator.pdfUrl;
export const selectPresignedUrl = (state) => state.calculator.presignedUrl;
export const selectIsAuthenticated = (state) => state.calculator.isAuthenticated;
export const selectUserInfo = (state) => state.calculator.userInfo;
export const selectCalculatorStatus = (state) => state.calculator.status;
export const selectCalculatorError = (state) => state.calculator.error;
export const selectIsOtpVerified = (state) => state.calculator.isOtpVerified;

export default calculatorSlice.reducer;


// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import {
//   calculateResult,
//   fetchCount,
//   login,
//   sendNumber,
//   signup,
//   verifyOtp,
// } from './calculatorApi';

// const initialState = {
//   value: 0,
//   status: 'idle',
//   result: null,
//   error: null,
//   pdfUrl: null,
//   isAuthenticated: false,
//   userInfo: null,
//   isOtpVerified: false,
//   isNumberReceived: false, // ✅ fixed typo (was Recieved)
//   userExist: null,
// };

// // Async thunks
// export const incrementAsync = createAsyncThunk(
//   'calculator/fetchCount',
//   async (amount, { rejectWithValue }) => {
//     try {
//       const response = await fetchCount(amount);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

// export const calculateResultAsync = createAsyncThunk(
//   'calculator/calculateResult',
//   async (info, { getState, rejectWithValue }) => {
//     try {
//       // Add mobileNumber from Redux state if not included
//       const state = getState();
//       if (!info.mobileNumber && state.calculator.userInfo) {
//         info.mobileNumber = state.calculator.userInfo.mobileNumber;
//       }

//       const response = await calculateResult(info);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error?.error || error?.message || 'Calculation failed');
//     }
//   }
// );

// export const signupAsync = createAsyncThunk(
//   'calculator/signup',
//   async (signupInfo, { rejectWithValue }) => {
//     try {
//       const response = await signup(signupInfo);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// export const loginAsync = createAsyncThunk(
//   'calculator/login',
//   async (loginInfo, { rejectWithValue }) => {
//     try {
//       const response = await login(loginInfo);
//       return response.data; // { data: existingUser } if successful
//     } catch (error) {
//       // fetch rejects with whatever you passed to `reject()`, which is already JSON
//       return rejectWithValue(error?.error || error?.message || 'Login failed');
//     }
//   }
// );



// export const verifyOtpAsync = createAsyncThunk(
//   'calculator/verifyOtp',
//   async (verifyOtpInfo, { rejectWithValue }) => {
//     try {
//       const response = await verifyOtp(verifyOtpInfo);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// export const sendNumberAsync = createAsyncThunk(
//   'calculator/sendNumber',
//   async (sendNumberInfo, { rejectWithValue }) => {
//     try {
//       const response = await sendNumber(sendNumberInfo);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// export const generatePdfAsync = createAsyncThunk(
//   'calculator/generatePdf',
//   async ({ userId, id }, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`http://192.168.1.2:4500/api/vehicle/generatePdf`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, id }),
//       });

//       const data = await response.json();
//       if (!response.ok || !data.success || !data.url) {
//         console.error("❌ PDF API error:", data);
//         return rejectWithValue(data.error || "PDF URL not returned from server");
//       }

//       console.log("✅ PDF URL received from API:", data.url);
//       return data.url;
//     } catch (err) {
//       console.error("❌ PDF thunk error:", err);
//       return rejectWithValue(err.message || "PDF generation failed");
//     }
//   }
// );


// // export const generatePdfAsync = createAsyncThunk(
// //   'calculator/generatePdf',
// //   async (payload, { rejectWithValue }) => {
// //     try {
// //       const { userId, id } = payload;
// //       const pdfUrl = await generatePdfHelper(userId, id); // call helper
// //       console.log("✅ PDF URL received in thunk:", pdfUrl);
// //       return pdfUrl; // this will be stored in Redux as a string
// //     } catch (err) {
// //       return rejectWithValue(err.message || "PDF generation failed");
// //     }
// //   }
// // );
// // Slice
// export const calculatorSlice = createSlice({
//   name: 'calculator',
//   initialState,
//   reducers: {
//     increment: (state) => {
//       state.value += 1;
//     },
//     setPdfUrl: (state, action) => {
//       state.pdfUrl = action.payload;
//     },
//     setUserInfo: (state, action) => {
//       state.userInfo = action.payload;
//       state.isAuthenticated = true;
//     },
//     logout: (state) => {
//       state.userInfo = null;
//       state.isAuthenticated = false;
//       state.result = null;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Increment
//       .addCase(incrementAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(incrementAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.value += action.payload;
//       })
//       .addCase(incrementAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//       })

//       // Calculate
//       .addCase(calculateResultAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(calculateResultAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.result = action.payload;
//         state.error = null;
//       })
//       .addCase(calculateResultAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//         state.result = null;
//       })

//       // Signup
//       .addCase(signupAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(signupAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.isAuthenticated = true;
//         state.userInfo = action.payload?.data || action.payload;
//       })
//       .addCase(signupAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//         state.isAuthenticated = false;
//       })

//       // Login
//       .addCase(loginAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(loginAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.isAuthenticated = true;
//         state.userInfo = action.payload?.data || action.payload;
//         state.userExist = true;
//       })
//       .addCase(loginAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.isAuthenticated = false;
//         state.error = action.payload;
//         state.userExist = false;
//       })

//       // Send number
//       .addCase(sendNumberAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(sendNumberAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.isNumberReceived = action.payload?.data || true;
//       })
//       .addCase(sendNumberAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//       })

//       // Verify OTP
//       .addCase(verifyOtpAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(verifyOtpAsync.fulfilled, (state) => {
//         state.status = 'idle';
//         state.isOtpVerified = true;
//       })
//       .addCase(verifyOtpAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//         state.isOtpVerified = false;
//       })
//       // Generate PDF
// .addCase(generatePdfAsync.pending, (state) => {
//   state.status = 'loading';
// })
// .addCase(generatePdfAsync.fulfilled, (state, action) => {
//   state.status = 'idle';
//   state.pdfUrl = action.payload;   // ✅ guaranteed to be a URL
//   console.log("📄 PDF URL saved in Redux:", action.payload);
// })
// .addCase(generatePdfAsync.rejected, (state, action) => {
//   state.status = 'idle';
//   state.error = action.payload;
// });

//   },
// });

// // Export actions
// export const { increment, setPdfUrl,setUserInfo, logout } = calculatorSlice.actions;

// // Selectors
// export const selectCount = (state) => state.calculator.value;
// export const selectCalculator = (state) => state.calculator.result;
// export const selectPdfUrl = (state) => state.calculator.pdfUrl;
// export const selectIsAuthenticated = (state) => state.calculator.isAuthenticated;
// export const selectIsNumberReceived = (state) => state.calculator.isNumberReceived;
// export const selectIsOtpVerified = (state) => state.calculator.isOtpVerified;
// export const selectUserInfo = (state) => state.calculator.userInfo;
// export const selectCalculatorError = (state) => state.calculator.error;
// export const selectUserExist = (state) => state.calculator.userExist;

// export const selectCalculatorResult = (state) => state.calculator.result;
// export const selectCalculatorStatus = (state) => state.calculator.status;


// // Export reducer
// export default calculatorSlice.reducer;


// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { calculateResult, fetchCount, login, sendNumber, signup, verifyOtp } from './calculatorApi';

// const initialState = {
//   value: 0,
//   status: 'idle',
//   result: null,
//   error: null, // fixed typo
//   pdfUrl: null,
//   isAuthenticated: false,
//   userInfo: null,
//   isOtpVerified: false,
//   isNumberRecieved: false,
//   userExist: null,
// };

// // Async thunks
// export const incrementAsync = createAsyncThunk(
//   'calculator/fetchCount',
//   async (amount) => {
//     const response = await fetchCount(amount);
//     return response.data;
//   }
// );

// export const calculateResultAsync = createAsyncThunk(
//   'calculator/calculateResult',
//   async (info, { rejectWithValue }) => {
//     try {
//       const response = await calculateResult(info);
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const signupAsync = createAsyncThunk(
//   'calculator/signup',
//   async (signupInfo, { rejectWithValue }) => {
//     try {
//       const response = await signup(signupInfo);
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const loginAsync = createAsyncThunk(
//   'calculator/login',
//   async (loginInfo, { rejectWithValue }) => {
//     try {
//       const response = await login(loginInfo);
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const verifyOtpAsync = createAsyncThunk(
//   'calculator/verifyOtp',
//   async (verifyOtpInfo, { rejectWithValue }) => {
//     try {
//       const response = await verifyOtp(verifyOtpInfo);
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const sendNumberAsync = createAsyncThunk(
//   'calculator/sendNumber',
//   async (sendNumberInfo, { rejectWithValue }) => {
//     try {
//       const response = await sendNumber(sendNumberInfo);
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// // Slice
// export const calculatorSlice = createSlice({
//   name: 'calculator', // fixed name
//   initialState,
//   reducers: {
//     increment: (state) => {
//       state.value += 1;
//     },
//     setPdfUrl: (state, action) => {
//       state.pdfUrl = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(incrementAsync.pending, (state) => { state.status = 'loading'; })
//       .addCase(incrementAsync.fulfilled, (state, action) => { state.status = 'idle'; state.value += action.payload; })
      
//       .addCase(calculateResultAsync.pending, (state) => { state.status = 'loading'; })
//       .addCase(calculateResultAsync.fulfilled, (state, action) => { state.status = 'idle'; state.result = action.payload; state.error = null; })
//       .addCase(calculateResultAsync.rejected, (state, action) => { state.status = 'idle'; state.error = action.payload; state.result = null; })
      
//       .addCase(signupAsync.pending, (state) => { state.status = 'loading'; })
//       .addCase(signupAsync.fulfilled, (state, action) => { state.status = 'idle'; state.isAuthenticated = true; state.userInfo = action.payload.data; })
//       .addCase(signupAsync.rejected, (state, action) => { state.status = 'idle'; state.error = action.payload; state.isAuthenticated = false; })
      
//       .addCase(loginAsync.pending, (state) => { state.status = 'loading'; })
//       .addCase(loginAsync.fulfilled, (state, action) => { state.status = 'idle'; state.isAuthenticated = true; state.userInfo = action.payload.data; })
//       .addCase(loginAsync.rejected, (state, action) => { state.status = 'idle'; state.isAuthenticated = false; state.error = action.payload; state.userExist = false; })
      
//       .addCase(sendNumberAsync.pending, (state) => { state.status = 'loading'; })
//       .addCase(sendNumberAsync.fulfilled, (state, action) => { state.status = 'idle'; state.isNumberRecieved = action.payload.data; })
//       .addCase(sendNumberAsync.rejected, (state, action) => { state.status = 'idle'; state.error = action.payload; })
      
//       .addCase(verifyOtpAsync.pending, (state) => { state.status = 'loading'; })
//       .addCase(verifyOtpAsync.fulfilled, (state, action) => { state.status = 'idle'; state.isOtpVerified = true; })
//       .addCase(verifyOtpAsync.rejected, (state, action) => { state.status = 'idle'; state.error = action.payload; state.isOtpVerified = false; });
//   },
// });

// // Export actions
// export const { increment, setPdfUrl } = calculatorSlice.actions;

// // Selectors
// export const selectCount = (state) => state.calculator.value;
// export const selectCalculator = (state) => state.calculator.result;
// export const selectPdfUrl = (state) => state.calculator.pdfUrl;
// export const selectIsAuthenticated = (state) => state.calculator.isAuthenticated;
// export const selectIsNumberRecieved = (state) => state.calculator.isNumberRecieved;
// export const selectIsOtpVerified = (state) => state.calculator.isOtpVerified;
// export const selectUserInfo = (state) => state.calculator.userInfo;
// export const selectCalculatorError = (state) => state.calculator.error;
// export const selectUserExist = (state) => state.calculator.userExist;

// // Export reducer
// export default calculatorSlice.reducer;


// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { calculateResult, fetchCount, login, sendNumber, signup, verifyOtp } from './calculatorApi';

// const initialState = {
//   value: 0,
//   status: 'idle',
//   result: null,
//   er: null,
//   isAuthenticated: false,
//   userInfo: null,
//   isOtpVerified: false,
//   isNumberRecieved : false,
//   userExist: null
// };

// export const incrementAsync = createAsyncThunk(
//   'counter/fetchCount',
//   async (amount) => {
//     const response = await fetchCount(amount);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//   }
// );
// export const calculateResultAsync = createAsyncThunk(
//   'calculator/calculateResult',
//   async (info, { rejectWithValue } ) => {
//     try{
//       const response = await calculateResult(info);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//     }catch(error){
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const signupAsync = createAsyncThunk(
//   'calculator/signup',
//   async (signupInfo ) => {
//     try{
//       const response = await signup(signupInfo);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//     }catch(error){
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const loginAsync = createAsyncThunk(
//   'calculator/login',
//   async (loginInfo, { rejectWithValue } ) => {
//     try{
//       const response = await login(loginInfo);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//     }catch(error){
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const verifyOtpAsync = createAsyncThunk(
//   'calculator/verifyOtp',
//   async (verifyOtpInfo ) => {
//     try{
//       const response = await verifyOtp(verifyOtpInfo);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//     }catch(error){
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const sendNumberAsync = createAsyncThunk(
//   'calculator/sendNumber',
//   async (sendNumberInfo ) => {
//     try{
//       const response = await sendNumber(sendNumberInfo);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//     }catch(error){
//       console.log(error);
//       return rejectWithValue(error);
//     }
//   }
// );

// export const calculatorSlice = createSlice({
//   name: 'counter',
//   initialState,
//   reducers: {
//     increment: (state) => {
//       state.value += 1;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(incrementAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(incrementAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.value += action.payload;
//       })
//       .addCase(calculateResultAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(calculateResultAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.result = action.payload;
//         state.error = null;
//         // console.log(action.payload);
//       })
//       .addCase(calculateResultAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload.error;
//         state.result = null;
//         console.log(action.payload.error);
//       })
//       .addCase(signupAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(signupAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.isAuthenticated = true;
//         state.userInfo = action.payload.data;
//         // console.log(action.payload.data)
//       })
//       .addCase(signupAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//         state.isAuthenticated = false;
//       })
//       .addCase(loginAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(loginAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.isAuthenticated = true;
//         state.userInfo = action.payload.data;
//         // console.log(action.payload);
//       })
//       .addCase(loginAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.isAuthenticated = false;
//         state.error = action.payload.error;
//         console.log(action.payload.error);
//         // console.log(state.isAuthenticated);
//         state.userExist = false;
//       })
//       .addCase(sendNumberAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(sendNumberAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.isNumberRecieved = action.payload.data;
//         // console.log(action.payload);
//       })
//       .addCase(sendNumberAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//       })
//       .addCase(verifyOtpAsync.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(verifyOtpAsync.fulfilled, (state, action) => {
//         state.status = 'idle';
//         state.isOtpVerified = true;
//         // console.log(action.payload.success);
//       })
//       .addCase(verifyOtpAsync.rejected, (state, action) => {
//         state.status = 'idle';
//         state.error = action.payload;
//         state.isOtpVerified = false;
//       })
//       ;
//   },
// });

// // export const { increment } = counterSlice.actions;

// export const selectCount = (state) => state.counter.value;
// export const selectCalculator = (state)=>state.calculator.result;
// export const selectIsAuthenticated = (state)=>state.calculator.isAuthenticated;
// export const selectIsNumberRecieved = (state)=>state.calculator.isNumberRecieved;
// export const selectIsOtpVerified = (state)=>state.calculator.isOtpVerified;
// export const selectUserInfo = (state)=>state.calculator.userInfo;
// export const selectCalculatorError = (state)=>state.calculator.error;
// export const selectUserExist = (state)=>state.calculator.userExist;

// export default calculatorSlice.reducer;