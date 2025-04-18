import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type");
  const state = searchParams.get("state");
  const consent = searchParams.get("consent");
  const scope = searchParams.get("scope");

  // Validate required parameters
  if (!clientId || !redirectUri || responseType !== "code") {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 }
    );
  }

  // Verify client and redirect URI
  const application = await prisma.application.findUnique({
    where: { clientId }
  });

  if (!application || !application.redirectUris.includes(redirectUri)) {
    return NextResponse.json(
      { error: "unauthorized_client" },
      { status: 401 }
    );
  }

  // Check if user is authenticated
  const session = await getServerSession();
  if (!session || !session.user) {
    // Redirect to login page with return URL
    const returnUrl = `/api/oauth/authorize?${searchParams.toString()}`;
    redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // If consent is not explicitly given, redirect to consent page
  if (consent !== "true") {
    const consentUrl = new URL("/consent", request.nextUrl.origin);
    searchParams.forEach((value, key) => {
      consentUrl.searchParams.append(key, value);
    });
    redirect(consentUrl.toString());
  }

  // Generate authorization code
  const code = jwt.sign(
    {
      clientId,
      userId: session.user.id,
      redirectUri,
      scope: scope || "",
    },
    process.env.JWT_SECRET || "your-jwt-secret",
    { expiresIn: "10m" }
  );

  // Redirect back to client with code
  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.append("code", code);
  if (state) {
    redirectUrl.searchParams.append("state", state);
  }

  redirect(redirectUrl.toString());
}