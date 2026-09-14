import { NextResponse } from "next/server";
import { pool } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ doctorId: string }>;
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

    const { rows } = await pool.query(
      `
        SELECT "id", "name", "specialization", "createdAt", "updatedAt"
        FROM "Doctor"
        WHERE "id" = $1
      `,
      [doctorId],
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