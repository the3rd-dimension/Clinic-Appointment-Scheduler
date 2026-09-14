import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ doctorId: string }>;
};

type DoctorRow = {
  id: string;
  name: string;
  specialization: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { doctorId } = await params;

    if (!doctorId.trim()) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 },
      );
    }

    const rows = await prisma.$queryRawUnsafe<DoctorRow[]>(
      `
        SELECT "id", "name", "specialization", "createdAt", "updatedAt"
        FROM "Doctor"
        WHERE "id" = $1
      `,
      doctorId,
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Failed to fetch doctor:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 },
    );
  }
}