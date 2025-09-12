import React from "react";
import { useState } from "react";
import axios from "axios";
import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";

// const RECAPTCHA_SITE_KEY = "6LfwLlMrAAAAAIFtLSnFxwGP_xfkeDU7xuz69sLa";

const RECAPTCHA_SITE_KEY = "6Lf9T8YrAAAAAAJYzVTEFyijUkQJ5BY4zg2AEHxn";

const Login = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subscribeToPushNotifications = async (userId, token) => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Service Worker and Push Notification Subscription
      await navigator.serviceWorker.register("/service-worker.js");
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "YOUR_PUBLIC_VAPID_KEY",
      });

      try {
        const response = await fetch("YOUR_BACKEND_URL", {
          method: "POST",
          body: JSON.stringify({ userId, subscription }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save subscription");
        }
      } catch (error) {
        console.error("Failed to save subscription:", error);
      }
    }
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     if (!captchaToken) {
//       Swal.fire({
//         icon: "warning",
//         title: "reCAPTCHA Required",
//         text: "Please verify the reCAPTCHA before signing in.",
//         confirmButtonColor: "#6366F1",
//       });
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.post("https://taskbe.sharda.co.in/api/employees/login", {
//         ...formData,
//         captchaToken,
//       });

//       const { token, _id, name, role } = response.data;

//       // Store user data and token in local storage
//       localStorage.setItem("authToken", token);
//       localStorage.setItem("user", JSON.stringify({ _id, name, role }));

//       // Subscribe to push notifications
//       subscribeToPushNotifications(_id, token).finally(() => {
//         window.location.href = "/"; // Redirect to home
//       });
//     } catch (err) {
//       alert("Failed to log in. Please check your credentials.");
//       console.error(err);
//       setCaptchaToken(null);
//     } finally {
//       setLoading(false);
//     }
//   };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      Swal.fire({
        icon: "warning",
        title: "reCAPTCHA Required",
        text: "Please verify the reCAPTCHA before signing in.",
        confirmButtonColor: "#6366F1",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://taskbe.sharda.co.in/api/employees/login", {
        ...formData,
       
      });

      const { token, _id, name, role, email, position, department, userId, birthdate, isBirthdayToday } =
        response.data;

      // Check if the logged-in user is an admin
      if (role !== "admin") {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "You can not access.",
          confirmButtonColor: "#6366F1",
        });
        setLoading(false);
        return; // Prevent further processing if not admin
      }

      // const birthdayFlag =
      //   typeof isBirthdayToday === "boolean"
      //     ? isBirthdayToday
      //     : computeIsToday(birthdate);

      const loginExpiryHours = 10;
      const loginExpiryTime = Date.now() + loginExpiryHours * 60 * 60 * 1000;

      const userData = {
        _id,
        name,
        email,
        position,
        department,
        userId,
        role,
        birthdate: birthdate || "",
        // isBirthdayToday: birthdayFlag,
      };

      localStorage.setItem("authToken", token);
      localStorage.setItem("loginExpiry", loginExpiryTime);
      localStorage.setItem("tokenLocal", token);
      localStorage.setItem("triggerLoginReminder", "true");

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", _id);
      localStorage.setItem("birthdate", birthdate || "");
      // localStorage.setItem("isBirthdayToday", JSON.stringify(!!birthdayFlag));

      // Redirect to the dashboard or home page
      window.location.href = "/view-invoice"; // Redirect to the admin dashboard
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Please check your credentials and try again.",
        confirmButtonColor: "#6366F1",
      });
      console.error(err);
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-slate-800 to-slate-600 py-4 px-6 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-start space-x-5">
            <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <img
                src="/SALOGO.png"
                alt="ASA Logo"
                className="h-14 w-14 object-contain drop-shadow-lg"
              />
            </div>

            <div className="border-l border-white/20 h-14 flex items-center pl-2">
              <div>
                <h1 className="text-2xl font-medium text-white tracking-tight leading-none">
                  Anunay Sharda & Associates
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl  text-gray-800 mb-2 font-sans">
              Invoicing Software
            </h2>
            <p className="text-gray-500 mb-8 font-sans">Please enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  placeholder="Enter your user ID"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {passwordVisible ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
            />

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Anunay Sharda Associates. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;













