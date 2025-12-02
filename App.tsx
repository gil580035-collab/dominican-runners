
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, WorldId, Character } from './types';
import { WORLDS, CHARACTERS } from './constants';
import { AuthService, StatsService } from './services/storageService';
import { GameCanvas } from './components/GameCanvas';
import { Button } from './components/Button';
import { Rocket, Shield, BookOpen, LogOut, Globe, User as UserIcon, Lock, Zap, Skull, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- VIEWS ---

// 1. LOGIN VIEW
const LoginView = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        if (!username) throw new Error("Username required");
        if (password.length < 4) throw new Error("Password too short");
        const user = AuthService.register(email, username, password);
        onLogin(user);
      } else {
        const user = AuthService.login(email, password);
        if (user) onLogin(user);
        else setError("Invalid credentials or user not found");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover bg-center flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-black/60"></div>
       <div className="relative bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-cyan-500/30 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
             <div className="inline-block p-4 rounded-full bg-cyan-900/50 mb-4 border border-cyan-500/50">
                <Rocket className="w-10 h-10 text-cyan-400" />
             </div>
             <h1 className="text-3xl font-scifi font-bold text-white uppercase tracking-widest">Dominican<br/>Runner 3050</h1>
             <p className="text-cyan-200/60 mt-2 text-sm">Secure Access Protocol</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Pilot Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:border-cyan-400 outline-none transition-colors"
                placeholder="pilot@concho.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Passcode</label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:border-cyan-400 outline-none transition-colors"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            {isRegister && (
               <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Callsign (Username)</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:border-cyan-400 outline-none"
                  placeholder="El Tiguere"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            )}

            {error && (
                <div className="bg-red-900/30 border border-red-900/50 p-3 rounded flex items-center gap-2 text-red-300 text-sm">
                    <Skull size={16} /> {error}
                </div>
            )}
            
            <Button type="submit" variant="neon" className="w-full mt-2">
              {isRegister ? 'Initialize Registration' : 'Authenticate'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-slate-400 hover:text-white underline underline-offset-4"
            >
              {isRegister ? 'Have an account? Log In' : 'New Pilot? Register Here'}
            </button>
          </div>
       </div>
    </div>
  );
};

// 2. CHARACTER SELECTOR (Embedded in Menu)
const CharacterSelect = ({ 
    selectedId, 
    onSelect 
}: { 
    selectedId: string, 
    onSelect: (id: string) => void 
}) => {
    return (
        <div className="mb-8">
            <h3 className="text-slate-400 uppercase font-bold text-xs mb-4 ml-1">Select Pilot Class</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(CHARACTERS).map(char => {
                    const isSelected = selectedId === char.id;
                    return (
                        <div 
                            key={char.id}
                            onClick={() => onSelect(char.id)}
                            className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 relative overflow-hidden group
                                ${isSelected ? 'bg-slate-800 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
                            `}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl bg-slate-950 p-2 rounded-lg">{char.emoji}</span>
                                <div>
                                    <h4 className={`font-bold font-scifi ${char.color}`}>{char.name}</h4>
                                    <p className="text-xs text-slate-400">{char.role}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 mb-3 leading-relaxed border-b border-white/5 pb-2">
                                {char.bio}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/30 p-2 rounded">
                                <Zap size={12} className="text-yellow-400" />
                                <span>{char.abilityName}</span>
                            </div>
                            {isSelected && (
                                <div className="absolute top-2 right-2 text-cyan-400">
                                    <CheckCircle size={20} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// 3. MAIN MENU
const MainMenu = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const navigate = useNavigate();
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>(WorldId.ZONA_COLONIAL);
  const [selectedCharId, setSelectedCharId] = useState(user.selectedCharacterId || 'mofonguero');

  const world = WORLDS[selectedWorldId];

  const handleStart = () => {
     AuthService.updateCharacter(user.id, selectedCharId);
     navigate(`/game?world=${world.id}&char=${selectedCharId}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
       {/* Header */}
       <header className="p-4 bg-slate-900/80 backdrop-blur border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center border border-cyan-500 text-cyan-400 font-bold text-xl">
               {user.username.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="font-bold text-sm">{user.username}</h2>
               <div className="flex items-center gap-3 text-xs text-slate-400">
                 <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">🪙 {user.coins}</span>
                 <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">🏆 {user.highScore}</span>
               </div>
             </div>
          </div>
          <div className="flex gap-2">
             {user.role === UserRole.ADMIN && (
               <Button size="sm" variant="danger" onClick={() => navigate('/admin')}>
                  <Shield size={16} /> Admin
               </Button>
             )}
             <Button size="sm" variant="secondary" onClick={() => navigate('/manual')}>
                <BookOpen size={16} /> Manual
             </Button>
             <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Logout">
                <LogOut size={20} className="text-red-400"/>
             </button>
          </div>
       </header>

       <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
             
             {/* Character Selection Section */}
             <CharacterSelect 
                selectedId={selectedCharId} 
                onSelect={setSelectedCharId} 
             />

             {/* World Selector & Start */}
             <h3 className="text-slate-400 uppercase font-bold text-xs mb-4 ml-1">Select Mission Zone</h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* World List */}
                <div className="lg:col-span-1 space-y-4">
                   {Object.values(WORLDS).map((w) => (
                        <div 
                           key={w.id}
                           onClick={() => setSelectedWorldId(w.id)}
                           className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 relative group overflow-hidden
                             ${selectedWorldId === w.id ? 'border-cyan-400 bg-cyan-950/30' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}
                           `}
                        >
                           <div className={`absolute top-0 right-0 p-1 bg-${w.difficulty === 'Easy' ? 'green' : w.difficulty === 'Medium' ? 'yellow' : 'red'}-600 text-[10px] font-bold rounded-bl uppercase`}>
                              {w.difficulty}
                           </div>
                           <h4 className="font-scifi font-bold text-lg mb-1">{w.name}</h4>
                        </div>
                   ))}
                </div>

                {/* World Preview Card */}
                <div className="lg:col-span-2 relative h-[400px] rounded-2xl overflow-hidden border border-slate-700 group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${world.primaryColor} opacity-40`} />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                        <Globe size={100} className="text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        <h2 className="text-4xl md:text-5xl font-scifi font-black text-white mb-4 tracking-tight drop-shadow-md">
                            {world.name}
                        </h2>
                        <p className="max-w-md text-slate-200 text-lg mb-8 font-light leading-relaxed bg-black/30 p-4 rounded-xl backdrop-blur-sm">
                            {world.description}
                        </p>
                        
                        <Button 
                            variant="neon" 
                            size="lg" 
                            onClick={handleStart}
                            className="w-64 text-xl shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-pulse hover:animate-none"
                        >
                            LAUNCH MISSION
                        </Button>
                    </div>
                </div>

             </div>
          </div>
       </main>
    </div>
  );
};

// 4. MANUAL / TUTORIAL
const ManualView = () => {
  const navigate = useNavigate();
  
  const items = [
     { icon: '⬅️ ➡️', title: 'Navigation', desc: 'Use Left/Right arrows or swipe to change lanes.' },
     { icon: '⬆️', title: 'Jump', desc: 'Up Arrow or Tap to jump over small obstacles like Potholes.' },
     { icon: '⚡', title: 'Special Ability', desc: 'Press SPACEBAR or double-tap screen to activate your character\'s unique power. Watch the cooldown!' },
     { icon: '🪙', title: 'Collectibles', desc: 'Grab Dominican Pesos to increase your score multiplier.' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl max-w-3xl w-full border border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
           <h2 className="text-2xl font-scifi font-bold text-white">Pilot Training Manual</h2>
           <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>Close</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {items.map((item, i) => (
             <div key={i} className="flex gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors">
                <div className="text-4xl">{item.icon}</div>
                <div>
                   <h3 className="font-bold text-cyan-400 mb-1">{item.title}</h3>
                   <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// 5. ADMIN PANEL
const AdminView = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    // Security check
    const curr = AuthService.getCurrentUser();
    if (!curr || curr.role !== UserRole.ADMIN) {
        navigate('/');
        return;
    }
    setUsers(StatsService.getAllUsers());
  }, [navigate]);

  const toggleBan = (id: string) => {
      StatsService.toggleBan(id);
      setUsers(StatsService.getAllUsers());
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
       <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-10 bg-slate-900 p-6 rounded-xl border border-slate-800">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-red-900/20 rounded-lg">
                    <Shield size={32} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-scifi font-bold text-white">Admin Command Center</h1>
                    <p className="text-slate-500 text-sm">System Monitoring & User Management</p>
                </div>
             </div>
             <Button variant="secondary" onClick={() => navigate('/menu')}>Exit to Menu</Button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
             {/* Stats Cards */}
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-sm font-bold uppercase">Active Pilots</p>
                <p className="text-4xl font-mono font-bold mt-2">{users.filter(u => !u.isBanned).length}</p>
             </div>
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-sm font-bold uppercase">Total Economy</p>
                <p className="text-4xl font-mono font-bold text-yellow-400 mt-2">
                    {users.reduce((acc, u) => acc + u.coins, 0).toLocaleString()}
                </p>
             </div>
             
             {/* Chart */}
             <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">Top Scores</h3>
                <div className="h-[150px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={users.slice(0, 5)}>
                        <XAxis dataKey="username" hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{fill: '#ffffff10'}}
                        />
                        <Bar dataKey="highScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* User Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold tracking-wider">
                    <tr>
                        <th className="p-5">Pilot Identity</th>
                        <th className="p-5">Status</th>
                        <th className="p-5">High Score</th>
                        <th className="p-5">Last Active</th>
                        <th className="p-5 text-right">Protocol</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                    {users.map(u => (
                        <tr key={u.id} className={`transition-colors ${u.isBanned ? 'bg-red-900/10' : 'hover:bg-slate-800/50'}`}>
                            <td className="p-5 font-bold">
                                <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${u.role === UserRole.ADMIN ? 'bg-red-900 text-red-200' : 'bg-slate-700'}`}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-white">{u.username}</div>
                                    <div className="text-xs text-slate-500 font-normal">{u.email}</div>
                                </div>
                                </div>
                            </td>
                            <td className="p-5">
                                {u.isBanned ? (
                                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">BANNED</span>
                                ) : (
                                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">ACTIVE</span>
                                )}
                            </td>
                            <td className="p-5 font-mono text-slate-300">{u.highScore.toLocaleString()}</td>
                            <td className="p-5 text-slate-500 text-sm">
                                {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-5 text-right">
                                {u.role !== UserRole.ADMIN && (
                                    <Button 
                                        size="sm" 
                                        variant={u.isBanned ? "primary" : "danger"}
                                        onClick={() => toggleBan(u.id)}
                                        className="text-xs py-1 px-3"
                                    >
                                        {u.isBanned ? 'Unban' : 'Ban User'}
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};

// 6. GAME VIEW WRAPPER
const GameViewWrapper = () => {
  const [searchParams] = React.useMemo(() => [new URLSearchParams(window.location.hash.split('?')[1])], []);
  const worldId = (searchParams.get('world') as WorldId) || WorldId.ZONA_COLONIAL;
  const charId = searchParams.get('char') || 'mofonguero';
  
  const navigate = useNavigate();
  const world = WORLDS[worldId];
  const character = CHARACTERS[charId] || CHARACTERS['mofonguero'];

  const handleGameOver = (score: number, coins: number) => {
     const currentUser = AuthService.getCurrentUser();
     if (currentUser) {
         StatsService.updateScore(currentUser.id, score, coins);
     }
  };

  return <GameCanvas world={world} character={character} onGameOver={handleGameOver} onExit={() => navigate('/menu')} />;
};


// --- APP ROOT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
        // Simple re-validation of ban status from local storage would happen here in a real app
        // For now we trust the stored session until next login
        setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400">Loading System...</div>;

  return (
    <HashRouter>
       <Routes>
          <Route path="/" element={
             currentUser ? <Navigate to="/menu" /> : <LoginView onLogin={handleLogin} />
          } />
          
          <Route path="/menu" element={
             currentUser ? <MainMenu user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />
          } />

          <Route path="/game" element={
             currentUser ? <GameViewWrapper /> : <Navigate to="/" />
          } />
          
          <Route path="/manual" element={<ManualView />} />
          
          <Route path="/admin" element={
             currentUser?.role === UserRole.ADMIN ? <AdminView /> : <Navigate to="/menu" />
          } />
       </Routes>
    </HashRouter>
  );
}
