import { NextResponse } from "next/server";
import { pool } from "@/lib/prisma";
import { doctorQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const parsedQuery = doctorQuerySchema.safeParse({
      specialization: url.searchParams.get("specialization") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.issues },
        { status: 400 },
      );
    }

    const { specialization } = parsedQuery.data;

    const values: string[] = [];
    let query = `
      SELECT "id", "name", "specialization", "createdAt", "updatedAt"
      FROM "Doctor"
    `;

    if (specialization) {
      values.push(specialization);
      query += ` WHERE "specialization" ILIKE $1`;
    }

    query += ` ORDER BY "name" ASC`;

    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch doctors:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 },
    );
  }
}