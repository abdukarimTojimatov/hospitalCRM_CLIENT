// src/utils/roles.ts
interface TokenPayload {
  id: string;
  role: "CEO" | "Admin" | "Reception";
}

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const payloadPart = token.split(".")[1];
    const decoded = JSON.parse(atob(payloadPart));
    return { id: decoded.id, role: decoded.role };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
