"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../forms/Login";
import Register from "../forms/Register";
import { useAuth } from "@/context/AuthContext";

export default function Authenticate() {
  const [isLogin, setIsLogin] = useState(true);
  const { authState } = useAuth();

  return authState.user ? (
    <></>
  ) : (
    <div className="bg-[#DBE7C9] h-dvh">
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="flex bg-white rounded-full p-2 relative">
          <motion.div
            className="absolute top-2 left-2 bg-[#294B29] rounded-full"
            initial={false}
            animate={{
              x: isLogin ? "0%" : "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            style={{
              width: "calc(50% - 8px)",
              height: "calc(100% - 16px)",
            }}
          />
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 p-2 rounded-full text-center cursor-pointer relative z-10 transition-colors duration-300 ${
              isLogin ? "text-white" : "text-[#294B29]"
            }`}>
            Log In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 p-2 rounded-full text-center cursor-pointer relative z-10 transition-colors duration-300 ${
              !isLogin ? "text-white" : "text-[#294B29]"
            }`}>
            Sign Up
          </button>
        </div>

        <div className="mt-6 relative overflow-hidden">
          <div className="relative">
            <AnimatePresence initial={false} mode="popLayout">
              {isLogin ? (
                <motion.div
                  key="login"
                  className="w-full"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{
                    type: "tween",
                    duration: 0.4,
                    ease: "easeInOut",
                  }}>
                  <Login />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  className="w-full"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{
                    type: "tween",
                    duration: 0.4,
                    ease: "easeInOut",
                  }}>
                  <Register />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
