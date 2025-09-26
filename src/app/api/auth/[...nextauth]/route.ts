import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // @ts-ignore
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
        user.userId = data.userId;
      } catch (err) {
        console.error("Failed to sync user to backend:", err);
        return false;
      }

      return true;
    },
// @ts-ignore
    async jwt({ token, user }) {
      if (user?.userId) token.userId = user.userId;
      return token;
    },
// @ts-ignore
    async session({ session, token }) {
      if (token?.userId) session.user.userId = token.userId;
      return session;
    },
  },

  session: { strategy: "jwt" },
};
// @ts-ignore
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
