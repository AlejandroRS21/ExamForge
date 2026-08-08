// ExamForge — Auth.js type augmentation

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    hearts?: number;
    maxHearts?: number;
    lastHeartRegen?: Date;
    xpMultiplier?: number;
    weeklyXp?: number;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      hearts?: number;
      maxHearts?: number;
      lastHeartRegen?: Date;
      xpMultiplier?: number;
      weeklyXp?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    hearts?: number;
    maxHearts?: number;
    lastHeartRegen?: Date;
    xpMultiplier?: number;
    weeklyXp?: number;
  }
}
