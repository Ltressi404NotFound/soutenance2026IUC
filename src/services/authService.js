import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const loginPersonnel = async (email, password) => {
  try {
    // 1. Authentification Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2. Vérification du rôle dans Firestore pour s'assurer que c'est du personnel
    const userDoc = await getDoc(doc(db, "utilisateurs", uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // On vérifie que l'utilisateur n'est pas un simple patient
      if (userData.role === "admin" || userData.role === "medecin") {
        return { success: true, user: userData };
      } else {
        throw new Error("Accès refusé : Cette interface est réservée au personnel.");
      }
    } else {
      throw new Error("Profil utilisateur introuvable.");
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};