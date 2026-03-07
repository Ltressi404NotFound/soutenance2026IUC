import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const AddPatient = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    sexe: 'M',
    age: '',
    matrice: `PAT-${Math.floor(1000 + Math.random() * 9000)}` // Génère un matricule type PAT-1234
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateNewMatrice = () => {
    setFormData({ ...formData, matrice: `PAT-${Math.floor(1000 + Math.random() * 9000)}` });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ajout dans la collection 'utilisateurs' avec le rôle 'patient'
      await addDoc(collection(db, "utilisateurs"), {
        ...formData,
        rôle: "patient", // Important pour le filtrage
        createdAt: serverTimestamp(),
        createdBy: "reception"
      });

      setSuccess(true);
      // Reset du formulaire après 2 secondes
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          nom: '',
          prenom: '',
          telephone: '',
          sexe: 'M',
          age: '',
          matrice: `PAT-${Math.floor(1000 + Math.random() * 9000)}`
        });
      }, 2000);
    } catch (error) {
      console.error("Erreur d'ajout:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        
        {/* BANNIÈRE HAUTE */}
        <div className="bg-[#0056b3] p-10 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              <UserPlus size={32} /> Nouveau Patient
            </h2>
            <p className="text-blue-100 font-medium">Enregistrement manuel pour les patients sans compte mobile.</p>
          </div>
          {success && (
            <div className="bg-green-400 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 animate-bounce">
              <CheckCircle size={20} /> ENREGISTRÉ !
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* NOM */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Nom de famille</label>
            <input 
              required name="nom" value={formData.nom} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
              placeholder="Ex: MBARGA"
            />
          </div>

          {/* PRÉNOM */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Prénom</label>
            <input 
              required name="prenom" value={formData.prenom} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
              placeholder="Ex: Jean"
            />
          </div>

          {/* MATRICE (AUTO) */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Matricule Patient</label>
            <div className="relative">
              <input 
                readOnly name="matrice" value={formData.matrice}
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 text-blue-700 rounded-2xl font-black outline-none"
              />
              <button type="button" onClick={generateNewMatrice} className="absolute right-4 top-4 text-blue-400 hover:rotate-180 transition-all">
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* TELEPHONE */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Téléphone (Optionnel)</label>
            <input 
              name="telephone" value={formData.telephone} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
              placeholder="Ex: 6xx xxx xxx"
            />
          </div>

          {/* SEXE */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Sexe</label>
            <select 
              name="sexe" value={formData.sexe} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          {/* AGE */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Âge</label>
            <input 
              type="number" required name="age" value={formData.age} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
              placeholder="Ex: 28"
            />
          </div>

          <div className="md:col-span-2 pt-6">
            <button 
              disabled={loading}
              className="w-full py-6 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-[#0056b3] disabled:bg-gray-200 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
            >
              {loading ? "Enregistrement en cours..." : "Valider l'inscription du patient"}
            </button>
          </div>

        </form>
      </div>
      
      <div className="mt-8 flex items-center gap-4 bg-orange-50 p-6 rounded-3xl border border-orange-100">
        <AlertCircle className="text-orange-500" size={24} />
        <p className="text-orange-800 text-sm font-medium">
          Note: Ce patient sera immédiatement visible dans l'onglet <strong>Orientation</strong> pour être assigné à un médecin.
        </p>
      </div>
    </div>
  );
};

export default AddPatient;