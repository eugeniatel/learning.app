const PASSWORD_HASH = "4f7c6e3c5c9f3e8068aa32652d4478ed821d6f6689e8cedb006ea7e3169329a5";

export async function verifyPassword(input: string): Promise<boolean> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hex === PASSWORD_HASH;
}
