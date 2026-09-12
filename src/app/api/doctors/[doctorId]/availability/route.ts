import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SLOT_MINUTES = 45;
const OPENING_HOUR = 8;
const CLOSING_HOUR = 17;

export async function GET(request: Request, { params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = await params;
  const date = new URL(request.url).searchParams.get("date");
  if (!date || Number.isNaN(Date.parse(date))) return NextResponse.json({ error: "A valid date is required." }, { status: 400 });

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const appointments = await prisma.appointment.findMany({
    where: { doctorId, status: "SCHEDULED", startTime: { lt: dayEnd }, endTime: { gt: dayStart } },
    select: { startTime: true, endTime: true },
  });
  const slots: string[] = [];
  for (let minutes = OPENING_HOUR * 60; minutes + SLOT_MINUTES <= CLOSING_HOUR * 60; minutes += SLOT_MINUTES) {
    const start = new Date(dayStart.getTime() + minutes * 60 * 1000);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
    if (!appointments.some((appointment) => appointment.startTime < end && appointment.endTime > start)) slots.push(start.toISOString());
  }
  return NextResponse.json({ date, slots });
}