import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
      },
    });

    // Transform sessions to include device info and current session flag
    const currentSessionId = session.sessionToken;
    const formattedSessions = userSessions.map((s) => ({
      id: s.id,
      device: "Device Info Not Available",
      lastActive: s.expires.toISOString(),
      ip: "IP Not Available",
      current: s.id === currentSessionId
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return new NextResponse("Session ID is required", { status: 400 });
    }

    // Prevent revoking current session
    if (sessionId === session.sessionToken) {
      return new NextResponse("Cannot revoke current session", { status: 400 });
    }

    // Delete the session
    await prisma.session.delete({
      where: {
        id: sessionId,
        userId: session.user.id, // Ensure user can only delete their own sessions
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error revoking session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}