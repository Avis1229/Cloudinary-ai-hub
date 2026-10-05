import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

import dbConnect from './dbConnect';
import env from './env';
import UserModel from './models/UserModel';

export const config = {
  trustHost: true, // Allow all hosts in production
  debug: process.env.AUTH_DEBUG === 'true',
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-render-deployment-please-set-proper-secret',
  basePath: '/api/auth',
  // Add explicit URL configuration for Render
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      allowDangerousEmailAccountLinking: true, // Allow linking Google email to existing credentials account
    }),
    CredentialsProvider({
      credentials: {
        email: {
          type: 'email',
        },
        password: {
          type: 'password',
        },
        otp: {
          type: 'text',
        },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          if (credentials === null) return null;

          const user = await UserModel.findOne({ email: credentials.email });

          if (user && user.password) {
            // Verify password
            const isMatch = await bcrypt.compare(
              credentials.password as string,
              user.password,
            );
            
            if (!isMatch) return null;

            if (isMatch) {
              return {
                id: user._id.toString(),
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                avatar: user.avatar || null,
              };
            }
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  // Enhanced session configuration for security and speed
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 5 * 60, // Update every 5 minutes for faster refresh
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // custom pages for sign in and register
  pages: {
    signIn: '/signin',
    newUser: '/register',
    error: '/error',
  },
  callbacks: {
    async jwt({ user, token, trigger, session, account }: any) {
      // If user is signing in, add user data to token
      if (user) {
        await dbConnect();
        // Always fetch the latest user from DB to ensure we get the correct MongoDB _id
        // because GoogleProvider returns the Google Account ID in user.id
        const dbUser = await UserModel.findOne({ email: user.email });
        
        if (dbUser) {
          const idStr = dbUser._id.toString();
          token.user = {
            id: idStr,
            _id: idStr,
            email: dbUser.email,
            name: dbUser.name,
            isAdmin: dbUser.isAdmin,
            avatar: dbUser.avatar || null,
          };
        } else {
          // Fallback if somehow not in DB yet
          const idStr = typeof user._id === 'string' 
            ? user._id 
            : user._id?.toString() || user.id;
          
          token.user = {
            id: idStr,
            _id: idStr,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            avatar: (user as any).avatar || user.image || null,
          };
        }
      }
      // Handle session updates (e.g. after avatar upload via update())
      if (trigger === 'update' && session?.user) {
        token.user = {
          ...token.user,
          ...session.user,
        };
      }
      return token;
    },
    session: async ({ session, token }: any) => {
      if (token?.user) {
        session.user = {
          id: token.user.id,
          _id: token.user._id,
          email: token.user.email,
          name: token.user.name,
          isAdmin: token.user.isAdmin,
          avatar: token.user.avatar || null,
        };
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          const existingUser = await UserModel.findOne({ email: user.email });
          
          if (!existingUser) {
            // Get referral code from cookie if present
            const cookieStore = await cookies();
            const referralCode = cookieStore.get('referral_code')?.value;

            // Create new social user
            const newUser = await UserModel.create({
              name: user.name || profile?.name || 'Archive Member',
              email: user.email,
              avatar: user.image || profile?.picture,
              isAdmin: false,
              referredBy: referralCode || undefined, // Link referral if exists
            });
            
            // Update the user object with the DB ID for the JWT callback
            user.id = newUser._id.toString();
            user._id = newUser._id.toString();
            user.isAdmin = false;
          } else {
            // Update user object with existing DB info
            user.id = existingUser._id.toString();
            user._id = existingUser._id.toString();
            user.isAdmin = existingUser.isAdmin;
            
            // Sync avatar/name if it's missing or updated
            let hasChanges = false;
            if (!existingUser.avatar && (user.image || profile?.picture)) {
              existingUser.avatar = user.image || profile?.picture;
              hasChanges = true;
            }
            if (existingUser.name === 'Archive Member' && (user.name || profile?.name)) {
              existingUser.name = user.name || profile?.name;
              hasChanges = true;
            }
            
            if (hasChanges) {
              await existingUser.save();
            }
          }
          return true;
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      
      if (user?.email) {
        console.log(`Successful credentials login for: ${user.email.substring(0, 3)}***`);
        return true;
      }
      return false;
    },
  },
  // Enhanced security settings
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Don't set domain for Render deployment - let it auto-detect
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
  },
  // Security events logging
  events: {
    async signIn({ user, account, profile, isNewUser }: any) {
      console.log(`User signed in: ${user?.email?.substring(0, 3)}***`);
    },
    async signOut({ session, token }: any) {
      console.log(`User signed out: ${token?.user?.email?.substring(0, 3)}***`);
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config);
