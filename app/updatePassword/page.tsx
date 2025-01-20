"use client";

import { Button } from "../components/button";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js"; // supabase import 수정
import { useRouter } from "next/navigation";

export default function UpdatePassword() {
  const [pw, setPW] = useState("");
  const [confirmPW, setConfirmPW] = useState("");
  const [noMatch, setNoMatch] = useState(false);
  const [invalidPW, setInvalidPW] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  // const searchParams = useSearchParams();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    const hash = window.location.hash; // URL의 해시 부분 가져오기
    const params = new URLSearchParams(hash.substring(1)); // '#' 이후의 부분 파싱
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });
    } else {
      setError("The link is invalid / has expired. Please try again.");
    }
  }, []);

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const onSubmit = async () => {
    if (pw !== confirmPW) {
      setNoMatch(true);
      return;
    }

    const isValid = validatePassword(pw);
    if (!isValid) {
      setInvalidPW(true);
      return;
    }

    setNoMatch(false);
    setInvalidPW(false);
    setLoading(true);
    setError(null);

    try {
      // 비밀번호 업데이트
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/"); // 업데이트 후 로그인 페이지로 이동
      }, 2000);
    } catch (error) {
      setError(
        (error as Error).message ||
          "An error occurred while updating the password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[500px] h-[500px] flex-col justify-between items-center">
        <div className="w-full flex justify-center">
          <p className="text-2xl font-bold">Password Update</p>
        </div>
        <div className="w-full flex justify-center mt-[50px]">
          <div className="w-[300px] h-[60px] border-gray-300 border-[1px] rounded-xl px-2 flex justify-center">
            <input
              type="password"
              className="w-[296px] h-[58px] outline-none rounded-xl"
              placeholder="Enter your new Password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPW(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="w-full flex justify-center mt-[20px]">
          <div className="w-[300px] h-[60px] border-gray-300 border-[1px] rounded-xl px-2 flex justify-center">
            <input
              type="password"
              className="w-[296px] h-[58px] outline-none rounded-xl"
              placeholder="Confirm Password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setConfirmPW(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="w-full flex justify-center mt-[30px]">
          <Button
            className="h-12 w-[300px] text-lg"
            color="blue"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </Button>
        </div>

        {invalidPW && (
          <div className="w-full flex justify-center mt-[20px]">
            <p className="text-red-500">
              Password must contain at least 8 characters, including an
              uppercase letter, a lowercase letter, a number, and a special
              character.
            </p>
          </div>
        )}

        {noMatch && (
          <div className="w-full flex justify-center mt-[10px]">
            <p className="text-red-500">
              Passwords do not match. Please try again.
            </p>
          </div>
        )}

        {error && (
          <div className="w-full flex justify-center mt-[20px]">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="w-full flex justify-center mt-[20px]">
            <p className="text-green-500">Password updated successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
