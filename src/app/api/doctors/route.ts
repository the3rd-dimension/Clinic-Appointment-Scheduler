import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { doctorQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = doctorQuerySchema.safeParse({ specialization: searchParams.get("specialization") ?? undefined });
  if (!parsed.success) return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
  const doctors = await prisma.doctor.findMany({
    where: parsed.data.specialization ? { specialization: parsed.data.specialization } : undefined,
    orderBy: { name: "asc" }, select: { id: true, name: true, specialization: true },
  });
  return NextResponse.json(doctors);
}