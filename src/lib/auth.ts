import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, name: user.name }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        (user as any).userId = data.userId; // keep ts-ignore for custom field
      } catch (err) {
        console.error("Failed to sync user to backend:", err);
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.userId) (token as any).userId = (user as any).userId;
      return token;
    },

    async session({ session, token }) {
      if ((token as any)?.userId) (session.user as any).userId = (token as any).userId;
      return session;
    },
  },

  session: { strategy: "jwt" },
};
