"use client"

import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"
import Cookies from "js-cookie"

import { Form, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export default function OTPPage() {
  const form = useForm({ defaultValues: { otp: "" } })
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const email = new URLSearchParams(location.search).get("email")

  const onSubmit = async (values) => {
    try {
      setLoading(true)

      const response = await api.post("/verify-otp", {
        email,
        otp: values.otp
      })

      console.log("OTP Verified:", response.data)

      const token = response.data.token
      if (token) {
        // 🔐 حفظ التوكن في Cookies لمدة قصيرة (مثلاً 15 دقيقة)
        Cookies.set("resetToken", token, { expires: 1/96, sameSite: "strict" }) 
        // 1/96 يوم = 15 دقيقة
      }

      toast({
        title: "OTP Verified",
        description: "You can now reset your password.",
      })

      navigate(`/reset-password?email=${email}`)

    } catch (err) {
      console.log("OTP Error:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.message || "Failed to verify OTP.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Enter Verification Code</h1>
        <p className="text-center text-gray-500 mb-6">
          We sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormItem className="flex justify-center">
              <FormControl>
                <InputOTP
                  maxLength={6}
                  value={form.watch("otp")}
                  onChange={(value) => form.setValue("otp", value)}
                  className="scale-110"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>

            <Button className="w-full h-11 text-lg" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
