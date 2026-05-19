import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const REQUIRED_ENV = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
];

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export async function POST(request: Request) {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email service is not configured yet. Please add SMTP env vars.",
      },
      { status: 500 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = payload;
  if (!name || !email || !subject || !message || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please fill all fields with valid data." },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: process.env.CONTACT_TO_EMAIL ?? "denissa7@yahoo.es",
    replyTo: email,
    subject: `[Denylashes] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  return NextResponse.json({ ok: true });
}


