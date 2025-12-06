import z from "zod";

export function validateInput(value: unknown) {
  const schema = z.string().trim().min(1, "minimum length is required");
  schema.parse(value);
  return true;
}
