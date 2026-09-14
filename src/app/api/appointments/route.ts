import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the booking details.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { doctorId, patientName, patientEmail, startTime, endTime } =
    parsed.data;

  try {
    const appointment = await prisma.$transaction(
      async (transaction) => {
        const doctor = await transaction.doctor.findUnique({
          where: { id: doctorId },
        });

        if (!doctor) {
          throw new Error("DOCTOR_NOT_FOUND");
        }

        const patient = await transaction.patient.upsert({
          where: { email: patientEmail },
          update: { name: patientName },
          create: {
            name: patientName,
            email: patientEmail,
          },
        });

        return transaction.appointment.create({
          data: {
            doctorId,
            patientId: patient.id,
            startTime,
            endTime,
          },
          include: {
            doctor: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return NextResponse.json(
      {
        id: appointment.id,
        doctor: appointment.doctor.name,
        startTime: appointment.startTime,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "DOCTOR_NOT_FOUND") {
      return NextResponse.json(
        { error: "Doctor not found." },
        { status: 404 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email is already being used by another patient." },
        { status: 409 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P2004", "P2034"].includes(error.code)
    ) {
      return NextResponse.json(
        { error: "That slot was just booked. Please choose another time." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "We could not create the appointment. Please try again." },
      { status: 500 },
    );
  }
}