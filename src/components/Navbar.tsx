"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import AulasName from "./AulasName";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { logoutAction } from "@/lib/actions/login.action";

interface NavbarProps {
  serverUserName: string | null;
}

export default function Navbar({ serverUserName }: NavbarProps) {
  // Now you already have the userName from the server
  const userName = serverUserName || "User";

  async function handleLogout() {
    try {
      await logoutAction();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 border-b bg-white z-[90] ">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <AulasName />
          </div>

          <div className="flex items-center gap-4">
            

            <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-fit px-2 rounded-full hover:bg-accent">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 border-2 border-muted">
                  <AvatarImage
                    src=""
                    alt={userName}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {userName[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">{userName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline-block" />
              </div>
            </Button>
          </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 z-[99]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
