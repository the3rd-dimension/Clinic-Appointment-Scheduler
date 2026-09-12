CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_doctor_time_no_overlap"
EXCLUDE USING gist (
  "doctorId" WITH =,
  tstzrange("startTime", "endTime", '[)') WITH &&
)
WHERE ("status" = 'SCHEDULED');