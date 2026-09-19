const nodemailer = require("nodemailer");

const REQUIRED_EMAIL_VARIABLES = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "EMAIL_FROM",
  "FRONTEND_URL",
];

class EmailConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "EmailConfigurationError";
    this.statusCode = 503;
  }
}

function getEmailConfig() {
  const missing = REQUIRED_EMAIL_VARIABLES.filter(
    (variable) => !process.env[variable]
  );

  if (missing.length > 0) {
    throw new EmailConfigurationError(
      "Authentication email delivery is not configured."
    );
  }

  const port = Number(process.env.EMAIL_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new EmailConfigurationError(
      "Authentication email delivery is not configured correctly."
    );
  }

  return {
    host: process.env.EMAIL_HOST,
    port,
    secure:
      process.env.EMAIL_SECURE === "true" || port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM,
    frontendUrl: process.env.FRONTEND_URL.replace(/\/+$/, ""),
  };
}

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildFrontendLink(path, token) {
  const config = getEmailConfig();
  return `${config.frontendUrl}${path}/${encodeURIComponent(token)}`;
}

async function sendVerificationEmail({ recipient, name, token }) {
  const config = getEmailConfig();
  const verificationUrl = buildFrontendLink("/verify-email", token);
  const safeName = escapeHtml(name || "there");

  await createTransporter(config).sendMail({
    from: config.from,
    to: recipient,
    subject: "Verify your Hubsafari account",
    text: [
      `Hi ${name || "there"},`,
      "",
      "Please verify your Hubsafari account using this link:",
      verificationUrl,
      "",
      "This link expires in 1 hour.",
    ].join("\n"),
    html: `<p>Hi ${safeName},</p><p>Please verify your Hubsafari account using the link below:</p><p><a href="${verificationUrl}">Verify your email address</a></p><p>This link expires in 1 hour.</p>`,
  });
}

async function sendPasswordResetEmail({ recipient, name, token }) {
  const config = getEmailConfig();
  const resetUrl = buildFrontendLink("/reset-password", token);
  const safeName = escapeHtml(name || "there");

  await createTransporter(config).sendMail({
    from: config.from,
    to: recipient,
    subject: "Reset your Hubsafari password",
    text: [
      `Hi ${name || "there"},`,
      "",
      "Reset your Hubsafari password using this link:",
      resetUrl,
      "",
      "This link expires in 15 minutes. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `<p>Hi ${safeName},</p><p>Reset your Hubsafari password using the link below:</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>`,
  });
}

module.exports = {
  EmailConfigurationError,
  getEmailConfig,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
