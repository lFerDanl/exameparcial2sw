"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "../actions/auth";

export default function Page() {
  const [errorMessage, formAction, isPending] = useActionState(
    register,
    undefined,
  );
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-2">
          <img src="/figma-logo.svg" alt="Figma logo" className="h-8 w-8" />
          <h1 className="text-center text-xl font-semibold text-gray-900">
            Create an account
          </h1>
        </div>
        <form action={formAction} className="space-y-4">
          <div className="relative h-fit">
            <input
              className="peer w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-transparent focus:border-black focus:outline-none"
              type="email"
              name="email"
              placeholder="Email"
              required
            />
            <label className="pointer-events-none absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">
              Email
            </label>
          </div>

          <div className="relative h-fit">
            <input
              className="peer w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-transparent focus:border-black focus:outline-none"
              type="password"
              name="password"
              placeholder="Password"
              required
              minLength={8}
            />
            <label className="pointer-events-none absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">
              Password
            </label>
          </div>

          <button
            disabled={isPending}
            className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isPending ? "Registering..." : "Register"}
          </button>

          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="text-blue-500 hover:text-blue-600" href="/signin">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}