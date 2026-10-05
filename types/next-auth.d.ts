import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string | null;
      isAdmin?: boolean;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id?: string;
    isAdmin?: boolean;
    avatar?: string | null;
  }
}

declare module "next/server" {
  interface NextRequest {
    auth?: {
      user?: {
        _id?: string;
        id?: string;
        isAdmin?: boolean;
        avatar?: string | null;
      } & DefaultSession["user"];
      [key: string]: any;
    };
  }
}
