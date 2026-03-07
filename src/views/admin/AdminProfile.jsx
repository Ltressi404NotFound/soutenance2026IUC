import React, { useState, useRef, useEffect } from 'react';
import { Camera, Lock, Palette, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from '../../firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const AdminProfile = () => {
  const fileInputRef = useRef(null); // Pour l'explorateur de fichiers
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');
  const [profileImg, setProfileImg] = useState("https://ui-avatars.com/api/?name=Admin+Loum&background=0056b3&color=fff&size=128");
  
  // États pour le mot de passe
  const [passwords, setPasswords] = useState({ old: '', new: '' });
  const [status, setStatus] = useState({ loading: false, msg: '', type: '' });

  // --- LOGIQUE PHOTO ---
  const handlePhotoClick = () => {
    fileInputRef.current.click(); // Simule le clic sur l'input caché
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImg(reader.result); // Affiche la photo choisie
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIQUE THÈME ---
  useEffect(() => {
    // Applique le thème au démarrage et à chaque changement
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // --- LOGIQUE MOT DE PASSE ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: 'Vérification...', type: 'info' });

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwords.old);
      
      // 1. Re-authentification obligatoire par Firebase
      await reauthenticateWithCredential(user, credential);
      
      // 2. Mise à jour
      await updatePassword(user, passwords.new);
      setStatus({ loading: false, msg: 'Mot de passe mis à jour !', type: 'success' });
      setPasswords({ old: '', new: '' });
    } catch (error) {
      setStatus({ loading: false, msg: 'Ancien mot de passe incorrect.', type: 'error' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER : PHOTO ET IDENTITÉ */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-10">
        <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
          <img 
            src={profileImg} 
            alt="Profil" 
            className="w-40 h-40 rounded-full border-8 border-gray-50 object-cover shadow-inner transition group-hover:opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera size={40} className="text-white drop-shadow-lg" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-black text-gray-800">Administrateur Loum</h2>
          <p className="text-gray-400 font-medium">Gestionnaire du système FirstAid</p>
          <div className="flex gap-3 justify-center md:justify-start pt-2">
            <span className="px-4 py-1.5 bg-blue-50 text-[#0056b3] rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">Super-Admin</span>
            <span className="px-4 py-1.5 bg-green-50 text-[#28a745] rounded-full text-xs font-black uppercase tracking-widest border border-green-100">Compte Vérifié</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* CARTE SÉCURITÉ */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><Lock className="text-red-500" size={20} /></div>
            Sécurité de l'accès
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ancien Mot de Passe</label>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500"
                value={passwords.old}
                onChange={e => setPasswords({...passwords, old: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nouveau Mot de Passe</label>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500"
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
              />
            </div>

            {status.msg && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {status.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                {status.msg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={status.loading}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-lg"
            >
              {status.loading ? "Traitement..." : "Sauvegarder"}
            </button>
          </form>
        </div>

        {/* CARTE THÈME */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Palette className="text-[#0056b3]" size={20} /></div>
            Personnalisation
          </h3>

          <div className="grid gap-4">
            {[
              { id: 'light', name: 'Clair Loum', color: 'bg-white', border: 'border-gray-200' },
              { id: 'dark', name: 'Mode Sombre', color: 'bg-gray-900', border: 'border-gray-800' },
              { id: 'dim', name: 'Vert Nature', color: 'bg-[#28a745]', border: 'border-green-700' }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setCurrentTheme(t.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${currentTheme === t.id ? 'border-[#0056b3] bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full ${t.color} ${t.border} border-2 shadow-sm`}></div>
                  <span className="font-bold text-gray-700">{t.name}</span>
                </div>
                {currentTheme === t.id && <CheckCircle className="text-[#0056b3]" size={20} />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;