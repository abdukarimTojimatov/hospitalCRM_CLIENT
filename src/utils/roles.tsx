import * as jwtDecode from "jwt-decode";

interface TokenPayload {
  id: string;
  role: "CEO" | "Admin" | "Reception";
  exp: number; // Expiration time in seconds
}

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwtDecode.default<TokenPayload>(token); // Use .default
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.error("Token expired");
      return null;
    }
    return decoded;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};
