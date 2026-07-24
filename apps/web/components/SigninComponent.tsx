"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFormSchema, AuthForm, SigninResponse } from "@/types";
import { apiClient } from "@/lib/AxiosHandling";
import { useAuthStore } from "@/stores/authStore";

function SigninComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AuthForm>({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const router = useRouter();
  const { setAuth } = useAuthStore();

  async function onSubmit(data: AuthForm) {
    try {
      const res = await apiClient.post<SigninResponse>("/user/signin", data);

      localStorage.setItem("authorization", res.data.jwt);
      localStorage.setItem("user", JSON.stringify({ name: data.username }));

      setAuth(res.data.jwt, { name: data.username });

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input
                {...form.register("username")}
                placeholder="Enter username"
              />
              {form.formState.errors.username && (
                <FieldError>{form.formState.errors.username.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <div className="relative">
                <Input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <FieldError>{form.formState.errors.password.message}</FieldError>
              )}
            </Field>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full mt-8"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => router.push("/signup")}
            >
              Don&apos;t have an account? Sign Up
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default SigninComponent;
