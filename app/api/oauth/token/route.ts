import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const grantType = formData.get("grant_type");
  const code = formData.get("code");
  const redirectUri = formData.get("redirect_uri");
  const clientId = formData.get("client_id");
  const clientSecret = formData.get("client_secret");

  // Validate required parameters
  if (!grantType || !code || !redirectUri || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 }
    );
  }

  // Verify client credentials
  const application = await prisma.application.findUnique({
    where: { clientId: clientId.toString() }
  });

  if (!application || application.clientSecret !== clientSecret.toString()) {
    return NextResponse.json(
      { error: "invalid_client" },
      { status: 401 }
    );
  }

  // Verify authorization code
  try {
    const decoded = jwt.verify(
      code.toString(),
      process.env.JWT_SECRET || "your-jwt-secret"
    ) as {
      clientId: string;
      userId: string;
      redirectUri: string;
    };

    // Verify the code was issued for this client and redirect URI
    if (
      decoded.clientId !== clientId.toString() ||
      decoded.redirectUri !== redirectUri.toString()
    ) {
      return NextResponse.json(
        { error: "invalid_grant" },
        { status: 400 }
      );
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "invalid_grant" },
        { status: 400 }
      );
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "your-jwt-secret",
      { expiresIn: "1h" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET || "your-jwt-secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "invalid_grant" },
      { status: 400 }
    );
  }
}