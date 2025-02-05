"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Input from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Register() {
  const nameRegex = /^[a-zA-Z\s]{3,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

  const [error, setError] = useState<{ [key: string]: string }>({});
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const profilePic = formData.get("profilePic") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!nameRegex.test(name)) {
      setError({
        name: "Name must be at least 3 characters long and contain only letters and spaces.",
      });
      return;
    }

    if (!emailRegex.test(email)) {
      setError({ email: "Please enter a valid email address." });
      return;
    }

    if (!passwordRegex.test(password)) {
      setError({
        password:
          "Password must be at least 6 characters long, contain at least one uppercase letter, one symbol, and one number.",
      });

      return;
    }

    if (password !== confirmPassword) {
      setError({
        confirmPassword:
          "Password must be at least 6 characters long, contain at least one uppercase letter, one symbol, and one number.",
      });
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, profilePic, password }),
      }
    );

    const data = await res.json();
    login(data.accessToken, data.user);
    router.replace("/chat");
  };

  return (
    <div className="rounded-3xl min-h-[80vh] relative p-6 md:p-12 flex flex-row-reverse">
      <div className="text-[#294B29] w-full md:w-3/5 lg:w-1/2 relative z-10">
        <h1 className="text-3xl md:text-4xl pb-4 md:pb-8 font-bold text-left pl-0  md:pl-24 lg:pl-32">
          Sign Up
        </h1>

        <form
          className="space-y-6 w-full flex flex-col items-end"
          onSubmit={handleRegister}>
          <Input
            label="Your Name"
            widthClass="w-full md:w-4/5 lg:w-3/4"
            type="text"
            name="name"
            error={error.name}
          />
          <Input
            label="Your Email"
            widthClass="w-full md:w-4/5 lg:w-3/4"
            type="email"
            name="email"
            error={error.email}
          />
          <Input
            label="Your Profile picture url"
            widthClass="w-full md:w-4/5 lg:w-3/4"
            type="url"
            name="profilePic"
            error={error.profilePic}
          />
          <Input
            label="Your Password"
            widthClass="w-full md:w-4/5 lg:w-3/4"
            type="password"
            name="password"
            error={error.password}
          />
          <Input
            label="Confirm Password"
            widthClass="w-full md:w-4/5 lg:w-3/4"
            type="password"
            name="confirmPassword"
            error={error.confirmPassword}
          />
          <button
            type="submit"
            className="bg-[#294B29] text-white px-8 py-3 rounded-3xl hover:bg-[#1e3b1e] transition-colors w-full md:w-4/5 lg:w-3/4">
            Create Account &nbsp; →
          </button>
        </form>
      </div>

      <div className="absolute top-0 left-0 h-full w-1/2 hidden md:block">
        <Image
          className="h-full w-full rounded-l-3xl object-cover"
          alt="Illustration"
          src="/illustration3.jpg"
          width={400}
          height={400}
          priority
        />
        <div className="absolute inset-0 rounded-l-3xl bg-gradient-to-l from-[#DBE7C9]/90 via-[#DBE7C9]/50 to-transparent" />
      </div>
    </div>
  );
}
