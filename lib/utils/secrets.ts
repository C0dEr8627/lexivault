import crypto from "node:crypto";

const SECRET_PREFIX = "enc:v1:";

function getEncryptionKey() {
  const secret = process.env.CONFIG_ENCRYPTION_SECRET;

  if (!secret) {
    return null;
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function isEncryptedValue(value: string) {
  return value.startsWith(SECRET_PREFIX);
}

export function encryptSecretValue(value: string) {
  const key = getEncryptionKey();

  if (!key) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${SECRET_PREFIX}${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecretValue(value: string) {
  if (!isEncryptedValue(value)) {
    return value;
  }

  const key = getEncryptionKey();

  if (!key) {
    return value;
  }

  const [ivPart, authTagPart, encryptedPart] = value.slice(SECRET_PREFIX.length).split(".");

  if (!ivPart || !authTagPart || !encryptedPart) {
    return value;
  }

  try {
    const iv = Buffer.from(ivPart, "base64url");
    const authTag = Buffer.from(authTagPart, "base64url");
    const encrypted = Buffer.from(encryptedPart, "base64url");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return value;
  }
}
