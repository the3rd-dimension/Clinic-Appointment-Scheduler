import { z } from "zod";

export const bookingSchema = z.object({
  doctorId: z.string().min(1), patientName: z.string().trim().min(2).max(100),
  patientEmail: z.string().trim().email().max(200), startTime: z.coerce.date(), endTime: z.coerce.date(),
}).refine((value) => value.endTime > value.startTime, { message: "End time must be after start time", path: ["endTime"] });

export const doctorQuerySchema = z.object({ specialization: z.string().trim().max(80).optional() });