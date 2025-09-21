import sodium from 'libsodium-wrappers';

export async function initSodium(){ await sodium.ready; return sodium; }

export async function generateKeypair(){
  await sodium.ready;
  const kp = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(kp.publicKey, sodium.base64_variants.ORIGINAL),
    privateKey: sodium.to_base64(kp.privateKey, sodium.base64_variants.ORIGINAL)
  };
}

export async function deriveSharedKey(ourPrivateB64, theirPublicB64){
  await sodium.ready;
  const ourPriv = sodium.from_base64(ourPrivateB64, sodium.base64_variants.ORIGINAL);
  const theirPub = sodium.from_base64(theirPublicB64, sodium.base64_variants.ORIGINAL);
  const shared = sodium.crypto_scalarmult(ourPriv, theirPub);
  const key = sodium.crypto_generichash(32, shared);
  return sodium.to_base64(key, sodium.base64_variants.ORIGINAL);
}

export async function encryptMessage(sharedKeyB64, messageText){
  await sodium.ready;
  const key = sodium.from_base64(sharedKeyB64, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(sodium.from_string(messageText), nonce, key);
  return { ciphertext: sodium.to_base64(cipher, sodium.base64_variants.ORIGINAL), nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL) };
}

export async function decryptMessage(sharedKeyB64, ciphertextB64, nonceB64){
  await sodium.ready;
  const key = sodium.from_base64(sharedKeyB64, sodium.base64_variants.ORIGINAL);
  const cipher = sodium.from_base64(ciphertextB64, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.from_base64(nonceB64, sodium.base64_variants.ORIGINAL);
  const plain = sodium.crypto_secretbox_open_easy(cipher, nonce, key);
  return sodium.to_string(plain);
}
