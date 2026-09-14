import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ doctorId: string }>;
};

type AppointmentRow = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
};

type DoctorIdRow = { id: string };

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { doctorId } = await params;

    const doctorResult = await prisma.$queryRawUnsafe<DoctorIdRow[]>(
      `SELECT "id" FROM "Doctor" WHERE "id" = $1`,
      doctorId,
    );

    if (doctorResult.length === 0) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 },
      );
    }

    const rows = await prisma.$queryRawUnsafe<AppointmentRow[]>(
      `
        SELECT "id", "startTime", "endTime", "status"
        FROM "Appointment"
        WHERE "doctorId" = $1
          AND "status" = 'SCHEDULED'
        ORDER BY "startTime" ASC
      `,
      doctorId,
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch doctor availability:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor availability" },
      { status: 500 },
    );
  }
}