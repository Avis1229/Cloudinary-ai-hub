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
      clientId: process.env.GOOGLE_CLIENT_ID?.trim() || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || 'placeholder',
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
    error: '/signin',
  },
  callbacks: {
    async jwt({ user, token, trigger, session, account }: any) {
      // If user is signing in, add user data to token
      if (user) {
        try {
          await dbConnect();
          const userEmail = (user.email || '').toLowerCase().trim();
          const dbUser = await UserModel.findOne({ email: userEmail });
          
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
            const idStr = typeof user._id === 'string' 
              ? user._id 
              : user._id?.toString() || user.id;
            
            token.user = {
              id: idStr,
              _id: idStr,
              email: user.email,
              name: user.name,
              isAdmin: user.isAdmin || false,
              avatar: (user as any).avatar || user.image || null,
            };
          }
        } catch (dbErr) {
          console.error('Error in JWT callback db query:', dbErr);
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
          const userEmail = (user?.email || profile?.email || '').toLowerCase().trim();
          if (!userEmail) return true;

          const existingUser = await UserModel.findOne({ email: userEmail });
          
          if (!existingUser) {
            let referralCode: string | undefined;
            try {
              const cookieStore = await cookies();
              referralCode = cookieStore?.get('referral_code')?.value;
            } catch {
              // Ignore cookie access failures in edge/auth handlers
            }

            const newUser = await UserModel.create({
              name: user.name || profile?.name || 'BeautyP Member',
              email: userEmail,
              avatar: user.image || profile?.picture,
              isAdmin: false,
              referredBy: referralCode || undefined,
            });
            
            user.id = newUser._id.toString();
            user._id = newUser._id.toString();
            user.isAdmin = false;
          } else {
            user.id = existingUser._id.toString();
            user._id = existingUser._id.toString();
            user.isAdmin = existingUser.isAdmin;
            
            let hasChanges = false;
            if (!existingUser.avatar && (user.image || profile?.picture)) {
              existingUser.avatar = user.image || profile?.picture;
              hasChanges = true;
            }
            if ((existingUser.name === 'Archive Member' || existingUser.name === 'BeautyP Member') && (user.name || profile?.name)) {
              existingUser.name = user.name || profile?.name;
              hasChanges = true;
            }
            
            if (hasChanges) {
              await existingUser.save();
            }
          }
          return true;
        } catch (error) {
          console.error('Handled non-fatal error during Google sign-in:', error);
          return true;
        }
      }
      
      if (user?.email) {
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
