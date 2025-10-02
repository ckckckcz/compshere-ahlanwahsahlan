"use client";

import type React from "react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Hash, User2 } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export function ProfileSummary({ userData }: { userData: UserData }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-4">
          <Avatar className="size-16 md:size-20">
            <AvatarImage
              src={userData.avatar || "/public/placeholder-user.jpg"}
              alt="User avatar"
            />
            <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold leading-tight">
              {userData.name}
            </h2>
          </div>
        </div>

        {/* Right: user info */}
        <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
          <KeyField
            icon={<Mail className="size-4" />}
            label="Email"
            value={userData.email}
          />
          <KeyField
            icon={<Phone className="size-4" />}
            label="Phone"
            value={userData.phone}
          />
          <KeyField
            icon={<Hash className="size-4" />}
            label="Employee ID"
            value={userData.id}
          />
        </div>
      </div>
    </Card>
  );
}

function KeyField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-md border p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
