import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function EmailPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: { email: "" },
    mode: "onChange", // تديك خطأ مباشرة بدون submit
  });

  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await api.post("/send-otp", {
        email: values.email
      });

      console.log("Email Sent:", response.data);

      toast({
        title: "OTP Sent Successfully",
        description: "Please check your email inbox.",
      });

      navigate(`/otp?email=${values.email}`);

    } catch (err) {
      console.log("Error sending email:", err);

      // لو السيرفر رد برسالة خطأ
      const message =
        err?.response?.data?.message ||
        "Failed to send OTP. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });

      // لو API رجع validation error
      if (err?.response?.status === 422) {
        form.setError("email", {
          type: "server",
          message: err.response.data.errors?.email?.[0],
        });
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">
          Verify Your Email
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Enter your email address to receive a verification code.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Email field is required",
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: "Please enter a valid email address",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@gmail.com"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>

                  {/* Error message (client + server) */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-lg font-semibold"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>

          </form>
        </Form>
      </div>

    </div>
  );
}
