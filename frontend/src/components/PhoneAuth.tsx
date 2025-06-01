import React, { useState } from "react";
import { auth } from "../../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Extend global window object
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

interface PhoneAuthProps {
  onVerified: (phone: string) => void;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ onVerified }) => {
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // do nothing; OTP trigger handles it
          },
        },
      );
    }
  };

  const handleSendOtp = async () => {
    if (!phone.startsWith("+") || phone.length < 10) {
      setMessage("Please enter a valid phone number with country code.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setMessage("OTP sent successfully!");
    } catch (err: any) {
      setMessage(`Error sending OTP: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await confirmationResult?.confirm(otp);

      setMessage("✅ Phone verified successfully!");

      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const phoneNumber = user.phoneNumber;

      setMessage("✅ Phone verified successfully!");
      onVerified(phoneNumber);
      
    } catch (err: any) {
      setMessage(`❌ Verification failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Phone Verification</h2>

      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter phone (e.g. +11234567890)"
        style={styles.input}//update in the Styles below
        disabled={!!confirmationResult}
      />
      <button
        onClick={handleSendOtp}
        disabled={loading || !!confirmationResult}
        className="bg-neon-purple hover:bg-neon-purple/90"
        style={styles.button}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>

      {confirmationResult && (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            style={styles.input}
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

      <div id="recaptcha-container" />

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "500px",
    margin: "2rem auto",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    // fontFamily: "Arial, sans-serif",
  },
  input: {
    padding: "10px",
    border: "1px #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
    color:"white",
    background:"#1e1f21",
  },
  button: {
    padding: "10px",
    // backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: "10px",
    color: "#333",
    fontSize: "0.9rem",
  },
};

export default PhoneAuth;
