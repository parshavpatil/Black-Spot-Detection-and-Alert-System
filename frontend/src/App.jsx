import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import ReportForm from "./components/ReportForm.jsx";
import MapPage from "./pages/MapPage.jsx";
import BlackspotDetail from "./pages/BlackspotDetail.jsx";
import Statistics from "./pages/Statistics.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

function ReportPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Report Blackspot</h1>
      <ReportForm />
    </div>
  );
}

function StatisticsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Statistics</h1>
      <p>Analytics and charts will appear here.</p>
    </div>
  );
}

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  function PrivateRoute({ element }) {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<PrivateRoute element={<ReportPage />} />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/blackspots/:id" element={<BlackspotDetail />} />
              <Route path="/statistics" element={<PrivateRoute element={<Statistics />} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer position="top-right" closeOnClick newestOnTop pauseOnHover theme="colored" />
    </div>
  );
}

export default App;
