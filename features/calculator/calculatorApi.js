// ==========================
// calculatorApi.js
// ==========================

// export async function calculateResult(info) {
//   if (!info.mobileNumber) {
//     throw { error: "mobileNumber is required" };
//   }

//   try {
//     const response = await fetch(
//       `http://192.168.1.2:4500//api/vehicle/findCO2Emission`,
//       {
//         method: "POST",
//         body: JSON.stringify(info),
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     const data = await response.json();

//     if (response.ok) {
//       return { data };
//     } else {
//       console.error("Server error: ", data);
//       throw data;
//     }
//   } catch (error) {
//     console.error("Catch error: ", error);
//     throw { error: error.message || "Something went wrong" };
//   }
// }

export async function calculateResult(info) {
  console.log("Input info:", info); // Log the input

  if (!info.mobileNumber) {
    console.error("Error: mobileNumber is required");
    throw { error: "mobileNumber is required" };
  }

  try {
    console.log("Sending request to server...");

    const response = await fetch(
      `http://192.168.1.2:4500/api/vehicle/findCO2Emission`,
      {
        method: "POST",
        body: JSON.stringify(info),
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Raw response received:", response);

    const data = await response.json();
    console.log("Parsed JSON data:", data);

    if (response.ok) {
      console.log("Server responded OK. Returning data...");
      return { data };
    } else {
      console.error("Server returned an error:", data);
      throw data;
    }
  } catch (error) {
    console.error("Catch block triggered. Error:", error);
    throw { error: error.message || "Something went wrong" };
  }
}

export async function login(loginInfo) {
  try {
    const response = await fetch(`http://192.168.1.2:4500/api/auth/login`, {
      method: "POST",
      body: JSON.stringify(loginInfo),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (response.ok) {
      return { data };
    } else {
      throw { error: data.error || "Login failed" };
    }
  } catch (error) {
    throw { error: error?.message || "Login failed" };
  }
}

export async function signup(signupInfo) {
  try {
    const response = await fetch(`http://192.168.1.2:4500/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify(signupInfo),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (response.ok) {
      return { data };
    } else {
      throw { error: data.error || "Signup failed" };
    }
  } catch (error) {
    throw { error: error?.message || "Signup failed" };
  }
}

export async function verifyOtp(otpInfo) {
  try {
    const response = await fetch(`http://192.168.1.2:4500/api/otp/verify`, {
      method: "POST",
      body: JSON.stringify(otpInfo),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (response.ok) {
      return { data };
    } else {
      throw { error: data.error || "OTP verification failed" };
    }
  } catch (error) {
    throw { error: error?.message || "OTP verification failed" };
  }
}

export async function sendNumber(numberInfo) {
  try {
    const response = await fetch(`http://192.168.1.2:4500/api/otp/send`, {
      method: "POST",
      body: JSON.stringify(numberInfo),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (response.ok) {
      return { data };
    } else {
      throw { error: data.error || "Sending number failed" };
    }
  } catch (error) {
    throw { error: error?.message || "Sending number failed" };
  }
}

// ==========================
// PDF Generation
// ==========================
// export async function generatePdf({ userId, id, html }) {
//   try {
//     const response = await fetch(`http://192.168.1.2:4500//api/vehicle/savePdfFromFrontend`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId, id, html }),
//     });

//     const data = await response.json();

//     if (response.ok && data.success && data.url) {
//       return data.url; // ✅ URL of the PDF on S3
//     } else {
//       console.error("PDF generation failed:", data);
//       throw { error: data.error || "PDF generation failed" };
//     }
//   } catch (err) {
//     console.error("PDF API error:", err);
//     throw { error: err?.message || "PDF generation failed" };
//   }
// }

export async function generatePdf({ userId, id, html }) {
  try {
    const response = await fetch(`http://192.168.1.2:4500/api/vehicle/savePdfFromFrontend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, id, html }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // return both S3 URL and presigned URL
      return { url: data.url, signedUrl: data.signedUrl };
    } else {
      console.error("PDF generation failed:", data);
      throw { error: data.error || "PDF generation failed" };
    }
  } catch (err) {
    console.error("PDF API error:", err);
    throw { error: err?.message || "PDF generation failed" };
  }
}



// export function calculateResult(info) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       // Ensure mobileNumber exists
//       if (!info.mobileNumber) {
//         return reject({ error: "mobileNumber is required" });
//       }

//       const response = await fetch(
//         `http://192.168.1.2:4500//api/vehicle/findCO2Emission`,
//         {
//           method: "POST",
//           body: JSON.stringify(info),
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         resolve({ data });
//       } else {
//         const error = await response.json();
//         console.log("Server error: ", error);
//         reject(error);
//       }
//     } catch (error) {
//       console.log("Catch error: ", error);
//       reject({ error: error.message || "Something went wrong" });
//     }
//   });
// }

// export async function login(loginInfo) {
//   const response = await fetch(`http://192.168.1.2:4500//api/auth/login`, {
//     method: "POST",
//     body: JSON.stringify(loginInfo),
//     headers: { "Content-Type": "application/json" },
//   });

//   const data = await response.json();

//   if (response.ok) {
//     return { data };
//   } else {
//     // throw an object with 'error' key to be caught in thunk
//     throw { error: data.error || 'Login failed' };
//   }
// }


// export function signup(signupInfo) {
//   return new Promise(async (resolve, reject) => {
//     try{
//     const response = await fetch(`http://192.168.1.2:4500//api/auth/signup`, {
//       method: "POST",
//       body: JSON.stringify(signupInfo),
//       headers: { "content-type": "application/json" },
//     });
//     if (response.ok) {
//       const data = await response.json();
//       resolve({ data });
//     } else {
//       const error = await response.text();
//       reject(error);
//     }
//     }catch (error) {
//       reject(error);
//     }
// });
// }


// export function verifyOtp(otp) {
//   return new Promise(async (resolve, reject) => {
//     try{
//     const response = await fetch(`http://192.168.1.2:4500//api/otp/verify`, {
//       method: "POST",
//       body: JSON.stringify(otp),
//       headers: { "content-type": "application/json" },
//     });
//     if (response.ok) {
//       const data = await response.json();
//       resolve({ data });
//     } else {
//       const error = await response.text();
//       reject(error);
//     }
//     }catch (error) {
//       reject(error);
//     }
// });
// }

// export function sendNumber(number) {
//   return new Promise(async (resolve, reject) => {
//     try{
//     const response = await fetch(`http://192.168.1.2:4500//api/otp/send`, {
//       method: "POST",
//       body: JSON.stringify(number),
//       headers: { "content-type": "application/json" },
//     });
//     if (response.ok) {
//       const data = await response.json();
//       resolve({ data });
//     } else {
//       const error = await response.text();
//       reject(error);
//     }
//     }catch (error) {
//       reject(error);
//     }
// });
// }

// export async function generatePdf(userId, id) {
//   try {
//     const API_URL = "http://192.168.1.2:4500//api/vehicle/generatePdf";
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId, id }),
//     });

//     if (!response.ok) {
//       const text = await response.text();
//       console.error("❌ PDF API error response:", text);
//       throw new Error(text || "PDF generation failed");
//     }

//     const data = await response.json();
//     console.log("📦 PDF API Response:", data);

//     const pdfUrl = data.url || data.pdfUrl || data.link;
//     if (!pdfUrl) throw new Error("PDF URL not returned from server");

//     return pdfUrl; // ✅ return as string
//   } catch (err) {
//     console.error("❌ generatePdf helper error:", err);
//     throw err;
//   }
// }


// export function generatePdf(userId, id) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const response = await fetch('http://192.168.1.2:4500//api/vehicle/generatePdf', {
//         method: 'POST',
//         body: JSON.stringify({ userId, id }),
//         headers: { 'Content-Type': 'application/json' },
//       });

//       const data = await response.json();
//       console.log("📦 PDF API Response:", data); // 👈 add this

//       if (response.ok) {
//         resolve({ url: data.url || data.pdfUrl || data.link });
//       } else {
//         reject(data);
//       }
//     } catch (error) {
//       reject({ error: error.message || 'Something went wrong' });
//     }
//   });
// }

