import React, { useState, useEffect } from 'react';
import { Send, Phone, User } from 'lucide-react';
import { db } from '../../firebaseConfig'; 
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const MedicalChat = () => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // On récupère tous les messages triés par date
    const q = query(collection(db, "chats"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Groupement par patientId
      const groups = allMsgs.reduce((acc, message) => {
        const pId = message.patientId;
        if (!pId) return acc; // Sécurité si patientId est manquant

        if (!acc[pId]) {
          acc[pId] = {
            id: pId,
            name: message.patientEmail || "Patient Anonyme",
            lastMsg: message.text,
            // Gestion du temps pour le dernier message
            time: message.createdAt ? new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "...",
            messages: []
          };
        }
        
        // Mise à jour du dernier message de la liste
        acc[pId].lastMsg = message.text;
        acc[pId].messages.push(message);
        return acc;
      }, {});

      // Convertir l'objet en liste et trier par le message le plus récent pour la barre latérale
      const list = Object.values(groups).sort((a, b) => {
        const timeA = a.messages[a.messages.length - 1]?.createdAt?.seconds || 0;
        const timeB = b.messages[b.messages.length - 1]?.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setDiscussions(list);

      // Garder la discussion active synchronisée
      if (selectedChat) {
        const updated = list.find(c => c.id === selectedChat.id);
        if (updated) setSelectedChat(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedChat?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !selectedChat) return;

    try {
      await addDoc(collection(db, "chats"), {
        patientId: selectedChat.id,
        patientEmail: selectedChat.name,
        text: msg,
        isFromAdmin: true,
        createdAt: serverTimestamp(),
      });
      setMsg("");
    } catch (err) {
      console.error("Erreur d'envoi:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
      
      {/* Liste des discussions */}
      <div className="w-1/3 bg-white rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col border border-gray-50">
        <div className="p-6 border-b font-black text-gray-800 flex justify-between items-center">
          <span>Patients Connectés</span>
          <span className="bg-blue-100 text-blue-600 text-xs py-1 px-3 rounded-full">
            {discussions.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {discussions.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm italic">Aucun message reçu</div>
          ) : (
            discussions.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedChat(c)}
                className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-gray-50 ${selectedChat?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedChat?.id === c.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <User size={20}/>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-gray-800 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">{c.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden border border-blue-100">
        {selectedChat ? (
          <>
            <div className="p-6 bg-[#0056b3] text-white flex justify-between items-center">
              <div>
                <div className="font-bold">{selectedChat.name}</div>
                <div className="text-[10px] opacity-70">ID Patient: {selectedChat.id}</div>
              </div>
              <Phone size={20} className="cursor-pointer hover:scale-110 transition" />
            </div>
            
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#f0f2f5] flex flex-col-reverse">
              {/* On inverse la liste pour flex-col-reverse */}
              {[...selectedChat.messages].reverse().map((m, i) => (
                <div key={m.id || i} className={`flex ${m.isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm text-sm ${
                    m.isFromAdmin 
                    ? 'bg-[#28a745] text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none'
                  }`}>
                    {m.text}
                    <div className={`text-[9px] mt-1 opacity-60 text-right ${m.isFromAdmin ? 'text-white' : 'text-gray-400'}`}>
                      {m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Envoi..."}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-6 bg-white flex gap-4">
              <input 
                type="text" 
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Écrire votre réponse..." 
                className="flex-1 bg-gray-100 border-none rounded-2xl px-6 focus:ring-2 focus:ring-[#0056b3] outline-none"
              />
              <button 
                type="submit"
                disabled={!msg.trim()}
                className="p-4 bg-[#0056b3] text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition shadow-lg shadow-blue-100"
              >
                <Send size={20}/>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <User size={60} className="mb-4 opacity-20" />
            <p className="font-medium">Sélectionnez un patient pour répondre à ses questions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalChat;