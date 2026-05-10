import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

type GameState = 'start' | 'playing' | 'paused_waiting' | 'paused_collision' | 'gameover';

type ThreatType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  title: string;
  text: string;
};

const THREAT_TYPES: ThreatType[] = [
  {
    id: 'social',
    name: 'Social Engineering',
    icon: '📧',
    color: '#ffb300', // amber
    title: 'SOCIAL ENGINEERING ATTACK!',
    text: 'Attackers use psychological manipulation to trick people into revealing confidential information. Common techniques include phishing emails and pretexting. This exploits human error rather than technical vulnerabilities.',
  },
  {
    id: 'malware',
    name: 'Malware',
    icon: '🐛',
    color: '#00ff00', // toxic green
    title: 'MALWARE DETECTED!',
    text: 'Malicious code designed to damage, steal data, or disrupt systems. Types include viruses, worms, trojans, ransomware, and spyware. Malware exploits system vulnerabilities to carry out attacks without user knowledge.',
  },
  {
    id: 'pharming',
    name: 'Pharming',
    icon: '🌐',
    color: '#9c27b0', // purple
    title: 'PHARMING REDIRECT!',
    text: 'Attackers redirect you from legitimate websites to fake ones without your knowledge. This is done by manipulating DNS settings or modifying host files. Users believe they\'re on genuine sites and enter credentials.',
  },
  {
    id: 'weak_passwords',
    name: 'Weak Passwords',
    icon: '🔓',
    color: '#f44336', // red
    title: 'WEAK PASSWORD EXPLOITED!',
    text: 'Easily guessed passwords like \'password123\' or default credentials like \'admin/admin\' allow attackers unauthorized access. The Mirai botnet exploited factory default passwords on IoT devices in 2016.',
  },
  {
    id: 'misconfigured_access',
    name: 'Misconfigured Access Rights',
    icon: '🚪',
    color: '#e91e63', // pink
    title: 'ACCESS RIGHTS MISCONFIGURED!',
    text: 'User accounts have incorrect permissions, giving unauthorized access to sensitive data. This violates the principle of least privilege and can breach data protection laws.',
  },
  {
    id: 'removable_media',
    name: 'Removable Media',
    icon: '💾',
    color: '#ffeb3b', // yellow
    title: 'UNAUTHORIZED REMOVABLE MEDIA!',
    text: 'USB drives and portable storage can introduce malware between systems or enable data theft. Never use found USB devices—nation-state attackers increasingly use these in targeted attacks.',
  },
  {
    id: 'unpatched_software',
    name: 'Unpatched Software',
    icon: '📦',
    color: '#795548', // brown/gray
    title: 'OUTDATED SOFTWARE VULNERABILITY!',
    text: 'Unpatched software contains known security holes that attackers exploit. Outdated systems are the #1 target for cyberattacks and enable ransomware deployment across networks.',
  }
];

type ThreatEntity = {
  x: number;
  y: number;
  type: ThreatType;
  width: number;
  height: number;
  speed: number;
};

type PlayerEntity = {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
};

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [activeThreat, setActiveThreat] = useState<ThreatType | null>(null);

  // Mutable refs for high-frequency game state
  const stateRef = useRef({
    gameState: 'start' as GameState,
    score: 0,
    lives: 3,
    lastTime: 0,
    threatSpawnTimer: 0,
    threats: [] as ThreatEntity[],
    player: {
      x: 0,
      y: 0,
      width: 60,
      height: 60,
      vx: 0,
    } as PlayerEntity,
    keys: {
      left: false,
      right: false,
    },
    canvasWidth: 800,
    canvasHeight: 600,
    speedMultiplier: 1,
  });

  const syncStateToReact = useCallback(() => {
    setGameState(stateRef.current.gameState);
    setScore(Math.floor(stateRef.current.score));
    setLives(stateRef.current.lives);
  }, []);

  const startGame = useCallback(() => {
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.threats = [];
    stateRef.current.speedMultiplier = 1;
    stateRef.current.player.x = stateRef.current.canvasWidth / 2 - stateRef.current.player.width / 2;
    stateRef.current.player.y = stateRef.current.canvasHeight - stateRef.current.player.height - 20;
    setActiveThreat(null);
    syncStateToReact();
  }, [syncStateToReact]);

  const handleCollision = useCallback((threat: ThreatEntity) => {
    stateRef.current.gameState = 'paused_waiting';
    setActiveThreat(threat.type);
    syncStateToReact();
    
    // 2-second pause before showing pop-up
    setTimeout(() => {
      if (stateRef.current.gameState === 'paused_waiting') {
        stateRef.current.gameState = 'paused_collision';
        syncStateToReact();
      }
    }, 2000);
  }, [syncStateToReact]);

  const dismissPopup = useCallback(() => {
    stateRef.current.lives -= 1;
    if (stateRef.current.lives <= 0) {
      stateRef.current.gameState = 'gameover';
    } else {
      stateRef.current.gameState = 'playing';
      // Remove collided threat
      stateRef.current.threats = [];
    }
    setActiveThreat(null);
    syncStateToReact();
  }, [syncStateToReact]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = true;
      
      if (e.key === ' ') {
        if (stateRef.current.gameState === 'start' || stateRef.current.gameState === 'gameover') {
          startGame();
        } else if (stateRef.current.gameState === 'paused_collision') {
          dismissPopup();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame, dismissPopup]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        stateRef.current.canvasWidth = canvas.width;
        stateRef.current.canvasHeight = canvas.height;
        // reset player y position
        if (stateRef.current.gameState !== 'playing') {
          stateRef.current.player.x = canvas.width / 2 - stateRef.current.player.width / 2;
          stateRef.current.player.y = canvas.height - stateRef.current.player.height - 20;
        }
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const loop = (timestamp: number) => {
      const dt = timestamp - (stateRef.current.lastTime || timestamp);
      stateRef.current.lastTime = timestamp;

      update(dt);
      draw(ctx, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const update = (dt: number) => {
    if (stateRef.current.gameState !== 'playing') return;

    const state = stateRef.current;
    
    // Score increases over time
    state.score += (dt / 1000) * 10;
    state.speedMultiplier = 1 + Math.floor(state.score / 10) * 0.25;

    // Player movement
    const moveSpeed = 0.5 * dt;
    if (state.keys.left) {
      state.player.x -= moveSpeed;
    }
    if (state.keys.right) {
      state.player.x += moveSpeed;
    }

    // Clamp player
    if (state.player.x < 0) state.player.x = 0;
    if (state.player.x > state.canvasWidth - state.player.width) state.player.x = state.canvasWidth - state.player.width;

    // Threat spawning
    state.threatSpawnTimer -= dt;
    const spawnInterval = Math.max(500, 1500 - (state.score * 5)); // Faster spawns
    
    if (state.threatSpawnTimer <= 0) {
      state.threatSpawnTimer = spawnInterval;
      const type = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
      const tWidth = 60;
      state.threats.push({
        x: Math.random() * (state.canvasWidth - tWidth),
        y: -60,
        width: tWidth,
        height: 60,
        type,
        speed: (2 + Math.random() * 1.5) * state.speedMultiplier,
      });
    }

    // Update threats and check collisions
    for (let i = state.threats.length - 1; i >= 0; i--) {
      const threat = state.threats[i];
      // Time-based movement for consistent speed regardless of framerate
      // Normalize to roughly 60fps base speed
      threat.y += threat.speed * (dt / 16.66); 

      // Simple AABB collision
      if (
        threat.x < state.player.x + state.player.width &&
        threat.x + threat.width > state.player.x &&
        threat.y < state.player.y + state.player.height &&
        threat.y + threat.height > state.player.y
      ) {
        handleCollision(threat);
        return; // Pause updates
      }

      // Remove off-screen
      if (threat.y > state.canvasHeight) {
        state.threats.splice(i, 1);
      }
    }
    
    // Periodically sync score to React to avoid thrashing
    if (Math.floor(state.score) % 10 === 0) {
      setScore(Math.floor(state.score));
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const state = stateRef.current;

    // Background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    // Animated grid offset
    const offset = (Date.now() / 50) % gridSize;

    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = offset; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Player
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw player glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    if (state.keys.left || state.keys.right) {
      ctx.shadowBlur = 35;
    }
    
    // Draw Shield Emoji
    ctx.fillText('🛡️', state.player.x + state.player.width / 2, state.player.y + state.player.height / 2);
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Threats
    for (const threat of state.threats) {
      ctx.shadowColor = threat.type.color;
      ctx.shadowBlur = 25;
      
      // Box background
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeStyle = threat.type.color;
      ctx.lineWidth = 2;
      ctx.fillRect(threat.x, threat.y, threat.width, threat.height);
      ctx.strokeRect(threat.x, threat.y, threat.width, threat.height);
      
      ctx.font = '40px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(threat.type.icon, threat.x + threat.width / 2, threat.y + threat.height / 2);
    }
    ctx.shadowBlur = 0;

    // HUD drawn inside DOM overlays for better accessibility/styling, 
    // but could be drawn here as well.
  };

  const handleMobileMove = (dir: 'left' | 'right', active: boolean) => {
    stateRef.current.keys[dir] = active;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0a0e1a] text-cyan-400 overflow-hidden font-mono" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-none"
      />

      {/* HUD */}
      {(gameState === 'playing' || gameState === 'paused_collision') && (
        <>
          <div className="absolute top-4 left-6 text-2xl font-bold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] z-10">
            SCORE: {score}
          </div>
          <div className="absolute top-4 right-6 text-2xl flex gap-2 z-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
            ))}
          </div>
          
          {/* Mobile Controls */}
          <div className="absolute bottom-8 left-8 flex gap-4 md:hidden z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-16 h-16 rounded-full bg-cyan-950/50 border-cyan-500 text-cyan-400 active:bg-cyan-900 touch-none"
              onPointerDown={(e) => { e.preventDefault(); handleMobileMove('left', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleMobileMove('left', false); }}
              onPointerCancel={(e) => { e.preventDefault(); handleMobileMove('left', false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Button>
          </div>
          <div className="absolute bottom-8 right-8 flex gap-4 md:hidden z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-16 h-16 rounded-full bg-cyan-950/50 border-cyan-500 text-cyan-400 active:bg-cyan-900 touch-none"
              onPointerDown={(e) => { e.preventDefault(); handleMobileMove('right', true); }}
              onPointerUp={(e) => { e.preventDefault(); handleMobileMove('right', false); }}
              onPointerCancel={(e) => { e.preventDefault(); handleMobileMove('right', false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Button>
          </div>
        </>
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <div data-testid="start-screen" className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <h1 className="text-6xl md:text-8xl font-black mb-4 text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)] text-center tracking-tighter">
            CYBER DEFENDER
          </h1>
          <h2 className="text-xl md:text-2xl text-cyan-200 mb-12 tracking-widest text-center uppercase">
            GCSE Computer Science — Cybersecurity Edition
          </h2>
          
          <div className="bg-cyan-950/50 border border-cyan-800 p-8 rounded-lg max-w-lg mb-12 text-cyan-100 text-center space-y-4">
            <p>You are the last line of defence.</p>
            <p>Use <kbd className="bg-cyan-900 px-2 py-1 rounded">LEFT</kbd> / <kbd className="bg-cyan-900 px-2 py-1 rounded">RIGHT</kbd> arrow keys or <kbd className="bg-cyan-900 px-2 py-1 rounded">A</kbd> / <kbd className="bg-cyan-900 px-2 py-1 rounded">D</kbd> to move.</p>
            <p>Dodge the incoming threats and read the alerts.</p>
          </div>

          <div className="animate-pulse text-2xl text-cyan-400 font-bold tracking-widest">
            PRESS SPACE TO START
          </div>
          
          <Button 
            className="mt-8 md:hidden bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-6 px-12 text-xl"
            onClick={startGame}
          >
            START GAME
          </Button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div data-testid="game-over-screen" className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
          <h1 className="text-7xl font-black mb-4 text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] text-center tracking-tighter">
            NETWORK BREACHED
          </h1>
          <h2 className="text-3xl text-red-300 mb-12 tracking-widest text-center uppercase">
            GAME OVER
          </h2>
          
          <div className="text-4xl text-cyan-400 mb-16 font-bold drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            FINAL SCORE: {score}
          </div>

          <div className="animate-pulse text-2xl text-red-400 font-bold tracking-widest mb-8">
            PRESS SPACE TO RESTART
          </div>
          
          <Button 
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-6 px-12 text-xl"
            onClick={startGame}
          >
            REBOOT SYSTEM
          </Button>
        </div>
      )}

      {/* Educational Popup */}
      {gameState === 'paused_collision' && activeThreat && (
        <div data-testid="popup-overlay" className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div 
            className="w-full max-w-2xl bg-black border-2 rounded-xl p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            style={{ 
              borderColor: activeThreat.color,
              boxShadow: `0 0 40px ${activeThreat.color}40`
            }}
          >
            <div className="text-8xl mb-6">{activeThreat.icon}</div>
            
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6 tracking-tight uppercase"
              style={{ color: activeThreat.color }}
            >
              {activeThreat.title}
            </h2>
            
            <p className="text-lg md:text-xl text-gray-200 mb-12 leading-relaxed">
              {activeThreat.text}
            </p>
            
            <div className="animate-pulse text-xl font-bold tracking-widest text-white mb-6">
              PRESS SPACE TO CONTINUE
            </div>
            
            <Button 
              className="md:hidden font-bold py-6 px-12 text-xl"
              style={{ backgroundColor: activeThreat.color, color: '#000' }}
              onClick={dismissPopup}
            >
              ACKNOWLEDGE
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
