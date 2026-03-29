async function encryptValue(profileObj) {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(profileObj));

  const keyBytes = crypto.getRandomValues(new Uint8Array(16));
  const ctrBytes = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CTR" },
    false,
    ["encrypt"]
  );

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-CTR", counter: ctrBytes, length: 128 },
      key,
      plaintext
    )
  );

  const result = new Uint8Array(16 + 16 + ciphertext.length);
  result.set(ctrBytes, 0);
  result.set(keyBytes, 16);
  result.set(ciphertext, 32);

  return result;
}

async function decryptValue(uint8) {
  const nonce = uint8.slice(0, 16);
  const keyBytes = uint8.slice(16, 32);
  const ciphertext = uint8.slice(32);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CTR" },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-CTR",
      counter: nonce,
      length: 128
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

export default {
  decryptValue,
  encryptValue
};
