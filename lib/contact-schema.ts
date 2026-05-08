import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(10).max(4000),
  source: z.string().max(200).optional().or(z.literal("")),
  // honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal("")),
  locale: z.enum(["en", "es"]),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };
