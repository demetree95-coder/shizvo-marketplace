import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) {
    return JSON.parse(json);
  }
  return {
    type: "service_account",
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "web-to-put-sites",
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
}

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = getServiceAccount();
  return initializeApp({
    credential: cert(serviceAccount as Record<string, string>),
    projectId: serviceAccount.project_id,
  });
}

const adminApp = initAdmin();
export const adminAuth = getAuth(adminApp);
