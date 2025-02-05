"use client";

import { FormEvent, useContext, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Input from "@/components/Input";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [error, setError] = useState<{ [key: string]: string }>({});
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email) {
      setError({ email: "Please enter email" });
      return;
    }

    if (!password) {
      setError({ password: "Please enter password" });
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();
    login(data.accessToken, data.user);
    router.replace("/chat");
  };

  return (
    <div className=" rounded-3xl min-h-[80vh] relative p-6 md:p-12">
      <div className="text-[#294B29] w-full md:w-3/5 lg:w-1/2 relative z-10">
        <p className="text-md">Welcome back!</p>
        <h1 className="text-3xl md:text-4xl py-4 md:py-8 font-bold">Login</h1>

        <form className="space-y-6 w-full" onSubmit={handleLogin}>
          <Input
            label="Your Email"
            widthClass="w-full md:w-4/5 lg:w-3/4"
            type="email"
            name="email"
            error={error.email}
          />
          <Input
            label="Your Password"
            widthClass="w-full md:w-4/5 lg:w-3/4"
            type="password"
            name="password"
            error={error.password}
          />
          <button
            type="submit"
            className="bg-[#294B29] text-white px-8 py-3 rounded-3xl hover:bg-[#1e3b1e] transition-colors w-full md:w-4/5 lg:w-3/4">
            Let's Roll! &nbsp; →
          </button>
        </form>
      </div>

      <div className="absolute top-0 right-0 h-full w-1/2 hidden md:block">
        <Image
          className="h-full w-full rounded-r-3xl object-cover"
          alt="Illustration"
          src="/illustration3.jpg"
          width={400}
          height={400}
          priority
        />
        <div className="absolute inset-0 rounded-r-3xl bg-gradient-to-r from-[#DBE7C9]/90 via-[#DBE7C9]/50 to-transparent" />
      </div>
    </div>
  );
}
