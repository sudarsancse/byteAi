import { initializeApp, cert } from "firebase-admin";

import serviceAccount from "../byteai-serviceAccountKey.json" with { type: "json" };

const fireBase = initializeApp({
  credential: cert(serviceAccount),
});

export default fireBase;
