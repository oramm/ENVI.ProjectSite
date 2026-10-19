import { constants, generateKeyPairSync, privateDecrypt, webcrypto, type KeyObject } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { SbPublicKeyJwk } from "../sbManageApi";
import { encryptSecretForKey } from "../sbSecretCrypto";

// Para kluczy jak w instalatorze SB (RSA 2048, e = AQAB); odszyfrowanie tak jak RSACng: OAEP SHA-256.
function keyPair(): { jwk: SbPublicKeyJwk; privateKey: KeyObject } {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const jwk = publicKey.export({ format: "jwk" }) as { n: string };
    return { jwk: { kty: "RSA", n: jwk.n, e: "AQAB" }, privateKey };
}
const decrypt = (privateKey: KeyObject, ciphertext: string) => privateDecrypt(
    { key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, Buffer.from(ciphertext, "base64")).toString("utf8");

// Środowisko testów to jsdom; WebCrypto bierzemy z Node (ten sam standard W3C co w przeglądarce).
const subtle = webcrypto.subtle as unknown as SubtleCrypto;

describe("szyfrowanie hasła w przeglądarce (SBD-2)", () => {
    const owner = keyPair(), stranger = keyPair();

    it("próba pozytywna: szyfrogram tej samej funkcji co ekran otwiera klucz prywatny pracownika", async () => {
        const password = "Zażółć-gęślą#2026 ok";
        const ciphertext = await encryptSecretForKey(owner.jwk, password, subtle);
        expect(ciphertext).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
        expect(Buffer.from(ciphertext, "base64")).toHaveLength(256);
        expect(ciphertext).not.toContain(password);
        expect(decrypt(owner.privateKey, ciphertext)).toBe(password);
    });

    it("kontrola negatywna: inny klucz prywatny nie odszyfrowuje", async () => {
        const ciphertext = await encryptSecretForKey(owner.jwk, "tajne", subtle);
        expect(() => decrypt(stranger.privateKey, ciphertext)).toThrow();
    });

    it("ten sam tekst daje za każdym razem inny szyfrogram (OAEP losowe)", async () => {
        expect(await encryptSecretForKey(owner.jwk, "x", subtle)).not.toBe(await encryptSecretForKey(owner.jwk, "x", subtle));
    });
});
