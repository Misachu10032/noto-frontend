import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
  try {
    // Check session
    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      //  "@ts-expect-error" 
    const session = await getServerSession(authOptions);
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.userId;
    const body = await req.json();

    // Forward request to backend
    const res = await fetch(`${API_BASE}/notes/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, userId }),
    });

    const note = await res.json();
    return NextResponse.json(note, { status: res.status });
  } catch (err) {
    console.error("PUT /api/notes/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
