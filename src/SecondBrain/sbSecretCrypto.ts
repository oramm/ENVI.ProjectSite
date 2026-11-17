import type { SbPublicKeyJwk } from "./sbManageApi";

/**
 * Szyfrowanie hasła w przeglądarce admina (plan SBD, SBD-2): RSA-OAEP z SHA-256 kluczem publicznym
 * komputera pracownika (JWK z PS). Wynik to base64 (256 bajtów dla klucza 2048 bit) - tylko on
 * wychodzi do serwera. Odszyfrować może wyłącznie instalator SB na komputerze pracownika
 * (RSACng, OAEP SHA-256). Jawne hasło nie jest nigdzie zapisywane ani logowane.
 */
const OAEP = { name: "RSA-OAEP", hash: "SHA-256" } as const;

export async function encryptSecretForKey(jwk: SbPublicKeyJwk, plaintext: string, subtle: SubtleCrypto = globalThis.crypto.subtle): Promise<string> {
    const key = await subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RSA-OAEP-256", ext: true }, OAEP, false, ["encrypt"]);
    const bytes = new Uint8Array(await subtle.encrypt(OAEP, key, new TextEncoder().encode(plaintext)));
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}
