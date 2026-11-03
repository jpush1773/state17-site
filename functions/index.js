// Cloud Functions for Firebase (2nd gen). Firebase Hosting rewrites
// /api/contact to the `contact` function; see firebase.json.
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { handleContact } from "./contact.js";

setGlobalOptions({ region: "us-central1", maxInstances: 5 });

export const contact = onRequest(
  { secrets: ["RESEND_API_KEY"] },
  (req, res) => handleContact(req, res, process.env),
);
