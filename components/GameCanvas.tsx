
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, GameObject, WorldConfig, ObstacleType, Character } from '../types';
import { RefreshCw, ArrowLeft, Zap, Trophy, Timer } from 'lucide-react';
import { Button } from './Button';

interface GameCanvasProps {
  world: WorldConfig;
  character: Character;
  onGameOver: (score: number, coins: number) => void;
  onExit: () => void;
}

// Visual helpers
const PERSPECTIVE_ORIGIN = '50% 30%';

export const GameCanvas: React.FC<GameCanvasProps> = ({ world, character, onGameOver, onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: true,
    isPaused: false,
    score: 0,
    coins: 0,
    speed: 1,
    distance: 0,
    currentWorld: world.id,
    gameOver: false,
    abilityActive: false,
    abilityTimeRemaining: 0,
    cooldownRemaining: 0
  });

  const [playerLane, setPlayerLane] = useState(1); // 0: Left, 1: Center, 2: Right
  const [playerJumping, setPlayerJumping] = useState(false);
  const [objects, setObjects] = useState<GameObject[]>([]);
  
  // Refs for loop
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(0.8);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const objectsRef = useRef<GameObject[]>([]);
  const playerLaneRef = useRef(1);
  const abilityActiveRef = useRef(false);
  const abilityEndTimeRef = useRef(0);
  const cooldownEndTimeRef = useRef(0);

  // Spawn Logic
  const spawnObject = useCallback(() => {
    const lanes = [0, 1, 2];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const type = Math.random() > 0.85 ? 'coin' : 'obstacle';
    
    // Select random obstacle type from world config
    const subType = world.obstacleTypes[Math.floor(Math.random() * world.obstacleTypes.length)];

    const newObj: GameObject = {
      id: Date.now() + Math.random(),
      lane,
      z: 100, // Starts far away
      type,
      subtype: type === 'obstacle' ? subType : undefined
    };

    objectsRef.current.push(newObj);
  }, [world]);

  const triggerAbility = useCallback(() => {
      const now = Date.now();
      if (now < cooldownEndTimeRef.current || abilityActiveRef.current || gameState.gameOver) return;

      // Special Ability Logic
      if (character.abilityName === "Mofongo Blast") {
          // Destroy all obstacles currently on screen
          objectsRef.current = objectsRef.current.filter(o => o.type !== 'obstacle');
      }

      abilityActiveRef.current = true;
      abilityEndTimeRef.current = now + character.abilityDuration;
      cooldownEndTimeRef.current = now + character.abilityCooldown;
  }, [character, gameState.gameOver]);

  // Game Loop
  const update = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    // const deltaTime = time - lastTimeRef.current; // Unused but good for physics
    lastTimeRef.current = time;

    if (gameState.isPaused || gameState.gameOver) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const now = Date.now();

    // Ability State Management
    if (abilityActiveRef.current && now > abilityEndTimeRef.current) {
        abilityActiveRef.current = false;
    }

    const cooldownRem = Math.max(0, cooldownEndTimeRef.current - now);
    const abilityRem = Math.max(0, abilityEndTimeRef.current - now);

    // Increase speed gradually
    if (speedRef.current < 3.0) {
      speedRef.current += 0.0002;
    }

    // Nitro Boost Speed
    let currentSpeed = speedRef.current;
    if (abilityActiveRef.current && character.abilityName === "Nitro Concho") {
        currentSpeed *= 2;
    }

    distanceRef.current += currentSpeed;
    scoreRef.current = Math.floor(distanceRef.current);

    // Spawn objects
    if (Math.random() < 0.03 * currentSpeed) {
      spawnObject();
    }

    // Move objects
    objectsRef.current = objectsRef.current
      .map(obj => ({ ...obj, z: obj.z - (0.5 * currentSpeed) }))
      .filter(obj => obj.z > -10);

    // Collision Detection
    let crashed = false;
    let coinsCollected = 0;

    objectsRef.current.forEach((obj, index) => {
      // Z range where player is (approx 0 to 5)
      // Player is at z=0 conceptually
      if (obj.z < 5 && obj.z > -2 && obj.lane === playerLaneRef.current) {
        if (obj.type === 'obstacle') {
          
           if (abilityActiveRef.current) {
               // Abilities that ignore damage
               if (character.abilityName === "Vueltita Ghost" || character.abilityName === "Nitro Concho") {
                   // Pass through safely
               } else {
                   crashed = true; 
               }
           } else {
               crashed = true;
           }

        } else if (obj.type === 'coin') {
          coinsCollected++;
          // Remove coin
          objectsRef.current.splice(index, 1);
        }
      }
    });

    if (coinsCollected > 0) {
      setGameState(prev => ({ ...prev, coins: prev.coins + coinsCollected }));
    }

    if (crashed) {
      setGameState(prev => ({ 
          ...prev, 
          gameOver: true, 
          score: scoreRef.current,
          abilityActive: false
      }));
      onGameOver(scoreRef.current, gameState.coins + coinsCollected); 
    } else {
       // Render updates
       setObjects([...objectsRef.current]);
       setGameState(prev => ({ 
           ...prev, 
           score: scoreRef.current,
           abilityActive: abilityActiveRef.current,
           abilityTimeRemaining: abilityRem,
           cooldownRemaining: cooldownRem
       }));
    }

    requestRef.current = requestAnimationFrame(update);
  }, [gameState.isPaused, gameState.gameOver, gameState.coins, onGameOver, spawnObject, character]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // Controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.gameOver || gameState.isPaused) return;

    if (e.key === 'ArrowLeft') {
      setPlayerLane(prev => {
        const n = Math.max(0, prev - 1);
        playerLaneRef.current = n;
        return n;
      });
    } else if (e.key === 'ArrowRight') {
      setPlayerLane(prev => {
        const n = Math.min(2, prev + 1);
        playerLaneRef.current = n;
        return n;
      });
    } else if (e.key === 'ArrowUp') {
      if (!playerJumping) {
        setPlayerJumping(true);
        setTimeout(() => setPlayerJumping(false), 600);
      }
    } else if (e.code === 'Space') {
        triggerAbility();
    }
  }, [gameState.gameOver, gameState.isPaused, playerJumping, triggerAbility]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch controls
  const touchStart = useRef<number>(0);
  const lastTap = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    const now = Date.now();
    if (now - lastTap.current < 300) {
        triggerAbility();
    }
    lastTap.current = now;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    
    if (Math.abs(diff) > 30) {
        if (diff > 0) { // Swipe Left
            setPlayerLane(prev => {
                const n = Math.max(0, prev - 1);
                playerLaneRef.current = n;
                return n;
            });
        } else { // Swipe Right
            setPlayerLane(prev => {
                const n = Math.min(2, prev + 1);
                playerLaneRef.current = n;
                return n;
            });
        }
    } else {
        // Tap to jump
         if (!playerJumping) {
            setPlayerJumping(true);
            setTimeout(() => setPlayerJumping(false), 600);
          }
    }
  };


  // Rendering Helpers
  const getPerspectiveStyle = (obj: GameObject) => {
    const scale = Math.max(0.1, (100 - obj.z) / 100); 
    const opacity = Math.min(1, (100 - obj.z) / 20); 
    
    const laneOffset = (obj.lane - 1) * 300 * scale; 
    
    const topPos = 45 + (100 - obj.z) * 0.8; 

    return {
      transform: `translateX(${laneOffset}%) scale(${scale})`,
      top: `${topPos}%`,
      left: '50%', 
      zIndex: Math.floor(100 - obj.z),
      opacity
    };
  };

  const getObstacleEmoji = (type: ObstacleType) => {
    switch(type) {
      case ObstacleType.MOTORISTA: return '🏍️';
      case ObstacleType.HOYO: return '🕳️';
      case ObstacleType.VENDEDOR: return '🥥';
      case ObstacleType.METRO_PILLAR: return '🏛️';
      case ObstacleType.AGUA_POZA: return '🌊';
      case ObstacleType.PIGEON: return '🐦';
      case ObstacleType.DIABLO: return '👺';
      case ObstacleType.PALM_TREE: return '🌴';
      default: return '📦';
    }
  };

  return (
    <div 
        className="relative w-full h-full overflow-hidden bg-black select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
    >
      {/* Background World */}
      <div className={`absolute inset-0 bg-gradient-to-b ${world.primaryColor} opacity-30 transition-colors duration-1000`} />
      
      {/* Dynamic Road/Grid effect */}
      <div className="absolute inset-0 flex justify-center items-end perspective-container" style={{perspectiveOrigin: PERSPECTIVE_ORIGIN}}>
        <div className={`w-[300%] h-[200%] bg-grid-slate-800/[0.2] transform rotate-x-60 origin-bottom absolute bottom-0 animate-pulse ${gameState.abilityActive ? 'bg-cyan-900/40' : ''}`}>
        </div>
        
        {/* Lanes */}
        <div className="absolute bottom-0 w-full max-w-lg h-full border-x-2 border-white/10 flex">
           <div className="flex-1 border-r border-white/5 bg-white/5"></div>
           <div className="flex-1 border-r border-white/5 bg-white/10"></div>
           <div className="flex-1 bg-white/5"></div>
        </div>
      </div>

      {/* Game Objects */}
      {objects.map(obj => (
        <div
          key={obj.id}
          className="absolute -translate-x-1/2 transition-transform duration-75 flex items-center justify-center text-4xl"
          style={getPerspectiveStyle(obj)}
        >
          {obj.type === 'coin' ? (
            <div className="text-yellow-400 animate-spin glow-coin">🪙</div> 
          ) : (
            <div className="drop-shadow-lg filter">{getObstacleEmoji(obj.subtype!)}</div>
          )}
        </div>
      ))}

      {/* Player Character */}
      <div 
        className={`absolute bottom-[15%] left-1/2 -translate-x-1/2 transition-all duration-200 ease-out`}
        style={{
            marginLeft: `${(playerLane - 1) * 30}%`,
            transform: `translateX(-50%) translateY(${playerJumping ? '-150px' : '0px'}) scale(${playerJumping ? 1.2 : 1})`,
            zIndex: 1000
        }}
      >
         <div className="relative group">
            {/* Character Emoji */}
            <div className={`text-7xl filter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] ${gameState.abilityActive ? 'animate-pulse opacity-80' : ''}`}>
                {character.emoji}
            </div>
            
            {/* Visual Effect for Abilities */}
            {gameState.abilityActive && (
               <div className="absolute inset-0 border-4 border-white rounded-full animate-ping"></div>
            )}
            
            {/* Shadow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-12 h-4 bg-black/50 blur-sm rounded-full scale-y-50"></div>
         </div>
      </div>

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between font-scifi text-xl z-50">
        <div className="flex gap-4">
            <div className="bg-black/50 p-2 rounded border border-white/20 flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} />
            <span>{gameState.score.toString().padStart(6, '0')}</span>
            </div>
            
            {/* Ability Status */}
            <div className="bg-black/50 p-2 rounded border border-white/20 flex items-center gap-2 min-w-[140px]">
                <Zap className={gameState.cooldownRemaining > 0 ? "text-slate-500" : "text-cyan-400 animate-pulse"} size={20} />
                {gameState.abilityActive ? (
                   <span className="text-green-400 text-sm">ACTIVE!</span>
                ) : gameState.cooldownRemaining > 0 ? (
                   <span className="text-slate-400 text-sm">{(gameState.cooldownRemaining / 1000).toFixed(1)}s</span>
                ) : (
                   <span className="text-cyan-400 text-sm">READY</span>
                )}
            </div>
        </div>

        <div className="bg-black/50 p-2 rounded border border-white/20 text-yellow-300">
           💰 {gameState.coins}
        </div>
      </div>

      {/* Touch Ability Button (Mobile) */}
      <div className="absolute bottom-8 right-8 z-50 md:hidden">
          <button 
             onClick={triggerAbility}
             disabled={gameState.cooldownRemaining > 0 || gameState.abilityActive}
             className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all active:scale-95 shadow-lg
                ${gameState.cooldownRemaining > 0 
                  ? 'bg-slate-800 border-slate-600 opacity-50' 
                  : 'bg-cyan-600 border-cyan-400 shadow-cyan-500/50'
                }
             `}
          >
             <Zap size={32} className="text-white" />
          </button>
      </div>

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-[2000] animate-in fade-in">
          <h2 className="text-5xl font-scifi text-red-500 mb-4 font-bold uppercase">Wasted</h2>
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 text-center space-y-4 max-w-sm w-full mx-4 shadow-2xl">
             <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                    <p className="text-slate-400 text-xs uppercase">Score</p>
                    <p className="text-3xl font-bold text-white">{gameState.score}</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-xs uppercase">Coins</p>
                    <p className="text-3xl font-bold text-yellow-400">{gameState.coins}</p>
                </div>
             </div>
             
             <div className="h-px bg-slate-700 my-4"></div>

             <div className="flex flex-col gap-3">
                <Button variant="neon" onClick={() => window.location.reload()} className="w-full justify-center">
                    <RefreshCw size={18} /> Retry Mission
                </Button>
                <Button variant="secondary" onClick={onExit} className="w-full justify-center">
                    <ArrowLeft size={18} /> Base Menu
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
