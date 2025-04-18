import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Helper function to generate random string
function generateRandomString(length: number) {
  return crypto.randomBytes(length).toString('hex');
}

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const applications = await prisma.application.findMany();
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { name, redirectUris } = await request.json();

    // Validate input
    if (!name || !Array.isArray(redirectUris) || redirectUris.length === 0) {
      return NextResponse.json(
        { error: "Invalid input. Name and redirectUris are required" },
        { status: 400 }
      );
    }

    // Generate client ID and secret
    const clientId = generateRandomString(16);
    const clientSecret = generateRandomString(32);

    // Create application
    const application = await prisma.application.create({
      data: {
        name,
        clientId,
        clientSecret,
        redirectUris,
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Delete application
    await prisma.application.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}