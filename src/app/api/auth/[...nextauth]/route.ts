import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create handler and export as GET and POST
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
