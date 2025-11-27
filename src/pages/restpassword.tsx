"use client"

import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import Cookies from "js-cookie"
import api from "@/lib/api"

import { Form, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const form = useForm({
    defaultValues: {
      password: "",
      password_confirmation: "",
      email: "",
    },
    mode: "onChange",
  })

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const emailFromQuery = new URLSearchParams(location.search).get("email")
  form.setValue("email", emailFromQuery || "")

  const onSubmit = async (values) => {
    try {
      setLoading(true)

      const token = Cookies.get("resetToken") // جلب التوكن من Cookie

      const payload = {
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        token: token,
      }

      const response = await api.post("/reset-password", payload, {
        headers: {
          Authorization: `Bearer ${token}`, // إرسال التوكن في Header
        }
      })

      toast({
        title: "Password Reset Successful",
        description: "You can now login with your new password.",
      })

      // بعد النجاح احذف التوكن
      Cookies.remove("resetToken")

      navigate("/login")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.message || "Failed to reset password.",
      })

      // لو فيه أخطاء Validation من السيرفر
      if (err?.response?.status === 422) {
        const errors = err.response.data.errors
        if (errors) {
          Object.keys(errors).forEach((key) => {
            form.setError(key, {
              type: "server",
              message: errors[key]?.[0],
            })
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Your Password</h1>

        <p className="text-center text-gray-500 mb-6">
          Set a new password for <span className="font-semibold">{emailFromQuery}</span>
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Password Field */}
            <FormItem>
              <FormControl>
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full h-11 px-3 border rounded-md"
                  {...form.register("password", { required: "Password is required" })}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.password?.message}</FormMessage>
            </FormItem>

            {/* Password Confirmation Field */}
            <FormItem>
              <FormControl>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full h-11 px-3 border rounded-md"
                  {...form.register("password_confirmation", { required: "Please confirm your password" })}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.password_confirmation?.message}</FormMessage>
            </FormItem>

            <Button className="w-full h-11 text-lg" type="submit" disabled={loading}>
              {loading ? "Processing..." : "Reset Password"}
            </Button>

          </form>
        </Form>
      </div>
    </div>
  )
}
