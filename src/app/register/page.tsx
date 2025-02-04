"use client";

import AulasName from "@/components/AulasName";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerAction } from "@/lib/actions/login.action";
import React, { useState } from "react";

const RegisterPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100">
      <AulasName  />
      <form
        action={registerAction}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-indigo-900">Sign In</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block text-indigo-700">
            Name
          </label>
          <Input
            type="name"
            name="name"
            id="name"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
        <label htmlFor="email" className="block text-indigo-700">
            Role
          </label>
        <Select name="role" required >
          <SelectTrigger className="text-indigo-700">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="text-indigo-700 ">
              <SelectItem value="TEACHER" className="hover:text-indigo-700">Teacher</SelectItem>
              <SelectItem value="STUDENT" className="hover:text-indigo-700">Student</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select></div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-indigo-700">
            Email
          </label>
          <Input
            type="email"
            name="email"
            id="email"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-indigo-700">
            Password
          </label>
          <Input
            type="password"
            name="password"
            id="password"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <Button type="submit" className="bg-indigo-800">Sign In</Button>
        <p className="mt-4 text-sm text-neutral-500">
          Do you have an account?{" "}
          <a href="/login" className="text-blue-600">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
