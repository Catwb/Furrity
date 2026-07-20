import { createCipheriv, createHmac, pbkdf2Sync } from "node:crypto";

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function deriveBytes(key: string, context: string, length: number): Buffer {
	return createHmac("sha256", key).update(context).digest().subarray(0, length);
}

export function encryptContent(
	html: string,
	password: string,
	slug: string,
): string {
	const salt = deriveBytes(password, `salt:${slug}`, SALT_LENGTH);
	const iv = deriveBytes(password, `iv:${slug}`, IV_LENGTH);
	const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([cipher.update(html, "utf8"), cipher.final()]);
	const authTag = cipher.getAuthTag();
	const result = Buffer.concat([salt, iv, authTag, encrypted]);
	return result.toString("base64");
}
