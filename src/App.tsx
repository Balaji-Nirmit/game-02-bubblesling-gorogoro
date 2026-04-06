import Matter from 'matter-js';
import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAudio } from './hooks/useAudio';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Play, ChevronRight, Grid, X, Star as StarIcon } from 'lucide-react';
import { LEVELS, type Level, type Obstacle, type Star } from './levels';

export default function App() {
  const [gameState, setGameState] = useState<'landing' | 'playing' | 'win' | 'level-complete' | 'selector'>('landing');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [completedLevels, setCompletedLevels] = useState<Record<number, number>>({});
  const { playPing, playThud, playSuccess, init: initAudio } = useAudio();

  useEffect(() => {
    const saved = localStorage.getItem('BubbleSling_progress');
    if (saved) {
      try {
        setCompletedLevels(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(completedLevels).length > 0) {
      localStorage.setItem('BubbleSling_progress', JSON.stringify(completedLevels));
    }
  }, [completedLevels]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextLevelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (nextLevelTimeoutRef.current) clearTimeout(nextLevelTimeoutRef.current);
    };
  }, []);

  const startGame = () => {
    initAudio();
    setGameState('playing');
  };

  const nextLevel = () => {
    // Save progress
    setCompletedLevels(prev => ({
      ...prev,
      [LEVELS[currentLevel].id]: Math.max(prev[LEVELS[currentLevel].id] || 0, starsCollected)
    }));

    if (currentLevel < LEVELS.length - 1) {
      setGameState('level-complete');
      nextLevelTimeoutRef.current = setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        setGameState('playing');
        setResetKey(prev => prev + 1);
        setStarsCollected(0);
      }, 1500);
    } else {
      setGameState('win');
    }
  };

  const resetLevel = () => {
    setResetKey(prev => prev + 1);
    setStarsCollected(0);
  };

  const selectLevel = (id: number) => {
    setCurrentLevel(id - 1);
    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-cream selection:bg-accent/20 text-ink overflow-hidden">
      <AnimatePresence mode="wait">
        {gameState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center h-screen px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mb-8 rounded-full bg-accent apple-shadow flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/30 blur-sm" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-serif italic mb-4 tracking-tight">BubbleSling</h1>
            <p className="text-olive/60 text-lg md:text-xl max-w-md mb-12 font-light">
              A serene journey through physics and light. Guide the pearl to its destination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startGame}
                className="group relative flex items-center gap-3 px-8 py-4 bg-ink text-cream rounded-full text-lg font-medium transition-all hover:scale-105 active:scale-95 apple-shadow"
              >
                Begin Journey
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setGameState('selector')}
                className="flex items-center gap-3 px-8 py-4 bg-white/50 backdrop-blur-md text-ink border border-ink/10 rounded-full text-lg font-medium transition-all hover:bg-white/80"
              >
                <Grid size={20} />
                Select Level
              </button>
            </div>
            
            {isMobile && (
              <p className="mt-8 text-xs text-olive/40 uppercase tracking-widest">
                Optimized for touch
              </p>
            )}

            {Object.keys(completedLevels).length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex flex-col items-center gap-2"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-olive/40 font-bold">Progress</div>
                <div className="flex gap-1">
                  {LEVELS.slice(0, 10).map((l, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${completedLevels[l.id] ? 'bg-accent' : 'bg-olive/10'}`} 
                    />
                  ))}
                  {LEVELS.length > 10 && <div className="text-[10px] text-olive/20 ml-1">...</div>}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {gameState === 'selector' && (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cream p-8 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                  <h2 className="text-4xl font-serif italic">Levels</h2>
                  <span className="text-[10px] uppercase tracking-widest text-olive/40 font-bold mt-1">
                    {Object.keys(completedLevels).length} / {LEVELS.length} Completed
                  </span>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      if (confirm("Clear all progress?")) {
                        setCompletedLevels({});
                        localStorage.removeItem('BubbleSling_progress');
                      }
                    }}
                    className="text-xs uppercase tracking-widest text-olive/40 hover:text-accent transition-colors"
                  >
                    Clear Progress
                  </button>
                  <button 
                    onClick={() => setGameState('landing')}
                    className="p-3 rounded-full hover:bg-ink/5 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {LEVELS.map((level) => {
                  const stars = completedLevels[level.id] || 0;
                  return (
                    <button
                      key={level.id}
                      onClick={() => selectLevel(level.id)}
                      className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-white apple-shadow hover:bg-accent hover:text-white transition-all group relative"
                    >
                      <span className="text-lg font-medium">{level.id}</span>
                      {stars > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <StarIcon 
                              key={i} 
                              size={8} 
                              className={i < stars ? "text-accent fill-accent group-hover:text-white group-hover:fill-white" : "text-olive/10"} 
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && currentLevel !== -1 && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-screen overflow-hidden"
          >
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
              <button
                onClick={() => setGameState('landing')}
                className="p-3 rounded-full glass hover:bg-white/40 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-olive/50 font-bold">Level {currentLevel + 1}</span>
                <span className="text-2xl font-serif italic">{LEVELS[currentLevel].name}</span>
              </div>
              <button
                onClick={resetLevel}
                className="p-3 rounded-full glass hover:bg-white/40 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            <GameView 
              key={`${currentLevel}-${resetKey}`}
              level={LEVELS[currentLevel]} 
              isMobile={isMobile}
              onWin={(stars) => {
                setStarsCollected(stars);
                playSuccess();
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#FF6321', '#5A5A40', '#E6E6E1']
                });
                setTimeout(nextLevel, 1000);
              }}
              onReset={resetLevel}
              playPing={playPing}
              playThud={playThud}
            />
          </motion.div>
        )}

        {gameState === 'level-complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-cream/90 backdrop-blur-md"
          >
            <div className="text-center max-w-sm px-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="mb-8"
              >
                <span className="text-[10px] uppercase tracking-[0.4em] text-olive/40 mb-4 block font-bold">Level {currentLevel + 1}</span>
                <h2 className="text-6xl font-serif italic mb-6">Complete</h2>
                
                <div className="flex justify-center gap-3 mb-12">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
                    >
                      <StarIcon 
                        size={40} 
                        className={i < starsCollected ? "text-accent fill-accent drop-shadow-lg" : "text-olive/10"} 
                      />
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (nextLevelTimeoutRef.current) clearTimeout(nextLevelTimeoutRef.current);
                    const isLast = currentLevel >= LEVELS.length - 1;
                    if (isLast) {
                      setGameState('win');
                    } else {
                      setCurrentLevel(prev => prev + 1);
                      setGameState('playing');
                      setResetKey(prev => prev + 1);
                      setStarsCollected(0);
                    }
                  }}
                  className="w-full py-5 rounded-full bg-accent text-white font-medium text-lg apple-shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {gameState === 'win' && (
          <motion.div
            key="win"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-screen px-6 text-center"
          >
            <h2 className="text-5xl md:text-7xl font-serif italic mb-6">IlBubbleSlingted</h2>
            <p className="text-olive/60 text-lg mb-12 max-w-sm">
              You have completed the journey. The path remains open for those who seek balance.
            </p>
            <button
              onClick={() => {
                setCurrentLevel(0);
                setGameState('landing');
              }}
              className="px-8 py-4 bg-ink text-cream rounded-full text-lg font-medium transition-all hover:scale-105"
            >
              Return to Start
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GameViewProps {
  level: Level;
  isMobile: boolean;
  onWin: (stars: number) => void;
  onReset: () => void;
  playPing: (freq?: number, type?: OscillatorType, duration?: number) => void;
  playThud: () => void;
}

const GameView: React.FC<GameViewProps> = ({ level, isMobile, onWin, onReset, playPing, playThud }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number, y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [collectedStars, setCollectedStars] = useState<number[]>([]);
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);
  const trailIdRef = useRef(0);
  const collectedStarsRef = useRef<number[]>([]);

  useEffect(() => {
    setCollectedStars([]);
    collectedStarsRef.current = [];
  }, [level]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0) return;

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = dimensions.width;
    const height = dimensions.height;

    const render = Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    // Base coordinate system is 800x600
    const scaleX = width / 800;
    const scaleY = height / 600;
    const baseScale = Math.min(scaleX, scaleY);

    // Ball
    const ball = Bodies.circle(level.start.x * scaleX, level.start.y * scaleY, 15 * baseScale, {
      restitution: 0.8,
      friction: 0.005,
      render: {
        fillStyle: '#FF6321',
        strokeStyle: '#FFFFFF',
        lineWidth: 3 * baseScale
      }
    });
    ballRef.current = ball;

    // Boundaries (extra thick to prevent tunneling)
    const ground = Bodies.rectangle(width / 2, height + 250, width + 1000, 500, { isStatic: true });
    const leftWall = Bodies.rectangle(-250, height / 2, 500, height + 1000, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 250, height / 2, 500, height + 1000, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, -250, width + 1000, 500, { isStatic: true });

    // Obstacles
    const obstacles = level.obstacles.map(obs => {
      const options: Matter.IBodyDefinition = {
        isStatic: obs.isStatic,
        angle: obs.angle || 0,
        render: { fillStyle: obs.type === 'bouncy' ? '#FF6321' : obs.type === 'sticky' ? '#8E9299' : '#5A5A40' }
      };

      if (obs.type === 'bouncy') {
        options.restitution = 1.2;
      } else if (obs.type === 'sticky') {
        options.friction = 0.8;
        options.restitution = 0.1;
      }

      const body = Bodies.rectangle(
        obs.x * scaleX, 
        obs.y * scaleY, 
        obs.w * scaleX, 
        obs.h * scaleY, 
        options
      );
      
      if (obs.isMoving) {
        (body as any).initialX = obs.x * scaleX;
        (body as any).initialY = obs.y * scaleY;
        (body as any).range = (obs.range || 100) * scaleX;
        (body as any).speed = obs.speed || 0.002;
      }

      if (obs.type === 'rotating') {
        (body as any).rotationSpeed = obs.rotationSpeed || 0.02;
      }
      
      return body;
    });

    Composite.add(engine.world, [ball, ground, leftWall, rightWall, ceiling, ...obstacles]);

    const mouse = Mouse.create(render.canvas);
    mouse.pixelRatio = window.devicePixelRatio;
    (mouse.element as HTMLElement).style.touchAction = 'none';

    // We don't add mouseConstraint to the world to prevent "grabbing" the ball
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.8,
        render: { visible: false }
      }
    });

    // Handle mousedown manually to start slingshot
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      const mousePosition = mouse.position;
      
      // Improved hit detection: check distance to ball center
      const dx = mousePosition.x - ball.position.x;
      const dy = mousePosition.y - ball.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Allow a larger hit area for easier interaction, especially on mobile
      const hitRadius = Math.max(40, (15 * baseScale) * (isMobile ? 3 : 2));
      
      if (dist < hitRadius) {
        isDraggingRef.current = true;
        // Freeze ball while aiming
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(ball, 0);
        
        dragStartRef.current = { x: ball.position.x, y: ball.position.y };
        setIsDragging(true);
        setDragStart({ x: ball.position.x, y: ball.position.y });
        playPing(300);
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = () => {
      if (isDraggingRef.current) {
        setDragEnd({ x: mouse.position.x, y: mouse.position.y });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        
        const dx = dragStartRef.current!.x - mouse.position.x;
        const dy = dragStartRef.current!.y - mouse.position.y;
        
        // Launch ball
        Matter.Body.setVelocity(ball, { x: dx * 0.15 * baseScale, y: dy * 0.15 * baseScale });
        
        playPing(600);
        dragStartRef.current = null;
        setDragStart(null);
        setDragEnd(null);
        document.body.style.cursor = 'default';
      }
    };

    render.canvas.addEventListener('mousedown', handleMouseDown);
    render.canvas.addEventListener('touchstart', handleMouseDown);
    render.canvas.addEventListener('mousemove', handleMouseMove);
    render.canvas.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const speed = Math.sqrt(Math.pow(pair.bodyA.velocity.x, 2) + Math.pow(pair.bodyA.velocity.y, 2));
        if (speed > 2) {
          playThud();
        }
      });
    });

    let won = false;
    let lastTrailTime = 0;

    Events.on(engine, 'afterUpdate', () => {
      if (won) return;

      // Out of bounds check
      if (ball.position.y > height + 200 || ball.position.y < -200 || ball.position.x > width + 200 || ball.position.x < -200) {
        Matter.Body.setPosition(ball, { x: level.start.x * scaleX, y: level.start.y * scaleY });
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
        return;
      }

      // Trail logic
      const now = Date.now();
      if (now - lastTrailTime > 50) {
        const speed = Math.sqrt(Math.pow(ball.velocity.x, 2) + Math.pow(ball.velocity.y, 2));
        if (speed > 1) {
          setTrail(prev => [{ x: ball.position.x, y: ball.position.y, id: trailIdRef.current++ }, ...prev].slice(0, 10));
          lastTrailTime = now;
        } else {
          setTrail(prev => prev.slice(0, -1));
        }
      }

      const goalX = level.goal.x * scaleX;
      const goalY = level.goal.y * scaleY;
      const dist = Math.sqrt(Math.pow(ball.position.x - goalX, 2) + Math.pow(ball.position.y - goalY, 2));
      
      if (dist < (level.goal.radius + 5) * baseScale) {
        won = true;
        onWin(collectedStarsRef.current.length);
      }

      // Star collection
      if (level.stars) {
        level.stars.forEach((star, index) => {
          if (collectedStarsRef.current.includes(index)) return;
          
          const starX = star.x * scaleX;
          const starY = star.y * scaleY;
          const starDist = Math.sqrt(Math.pow(ball.position.x - starX, 2) + Math.pow(ball.position.y - starY, 2));
          
          // Increased detection radius for better feel
          if (starDist < (star.radius + 25) * baseScale) {
            collectedStarsRef.current = [...collectedStarsRef.current, index];
            setCollectedStars([...collectedStarsRef.current]);
            playPing(800);
            
            // Mini burst effect
            confetti({
              particleCount: 15,
              spread: 360,
              origin: { 
                x: starX / window.innerWidth, 
                y: starY / window.innerHeight 
              },
              colors: ['#FF6321'],
              shapes: ['circle'],
              gravity: 0.5,
              scalar: 0.5
            });
          }
        });
      }

      obstacles.forEach(obs => {
        if ((obs as any).initialX) {
          const time = engine.timing.timestamp * (obs as any).speed;
          const newX = (obs as any).initialX + Math.sin(time) * (obs as any).range;
          Matter.Body.setPosition(obs, { x: newX, y: obs.position.y });
        }
        if ((obs as any).rotationSpeed) {
          Matter.Body.setAngle(obs, obs.angle + (obs as any).rotationSpeed);
        }
      });
    });

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    runnerRef.current = runner;

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.removeEventListener('mousedown', handleMouseDown);
      render.canvas.removeEventListener('touchstart', handleMouseDown);
      render.canvas.removeEventListener('mousemove', handleMouseMove);
      render.canvas.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      render.canvas.remove();
      render.textures = {};
      document.body.style.cursor = 'default';
    };
  }, [level, dimensions]);

  const goalXPercent = (level.goal.x / 800) * 100;
  const goalYPercent = (level.goal.y / 600) * 100;
  const scaleX = dimensions.width / 800;
  const scaleY = dimensions.height / 600;
  const baseScale = Math.min(scaleX, scaleY);

  return (
    <motion.div 
      ref={containerRef} 
      className="w-full h-full cursor-crosshair relative"
    >
      {/* Trail */}
      {trail.map((t, i) => (
        <div 
          key={t.id}
          className="absolute rounded-full bg-accent/20 pointer-events-none"
          style={{
            left: t.x,
            top: t.y,
            width: 15 * baseScale * (1 - i / 10),
            height: 15 * baseScale * (1 - i / 10),
            transform: 'translate(-50%, -50%)',
            opacity: 1 - i / 10
          }}
        />
      ))}

      {/* Slingshot Line */}
      {isDragging && dragStart && dragEnd && (
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
          <line 
            x1={dragStart.x} 
            y1={dragStart.y} 
            x2={dragEnd.x} 
            y2={dragEnd.y} 
            stroke="#FF6321" 
            strokeWidth={2 * baseScale} 
            strokeDasharray="5,5"
            opacity="0.6"
          />
          <circle 
            cx={dragStart.x} 
            cy={dragStart.y} 
            r={20 * baseScale} 
            fill="none" 
            stroke="#FF6321" 
            strokeOpacity="0.2" 
          />
        </svg>
      )}

      {/* Goal Zone UI */}
      <div 
        className="absolute rounded-full border-2 border-dashed border-accent/30 flex items-center justify-center"
        style={{
          left: `${goalXPercent}%`,
          top: `${goalYPercent}%`,
          width: `${level.goal.radius * 2 * baseScale}px`,
          height: `${level.goal.radius * 2 * baseScale}px`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-4 h-4 rounded-full bg-accent/20" 
        />
      </div>

      {/* Stars */}
      {level.stars?.map((star, index) => (
        !collectedStars.includes(index) && (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute text-accent"
            style={{
              left: `${(star.x / 800) * 100}%`,
              top: `${(star.y / 600) * 100}%`,
              width: `${star.radius * 2 * baseScale}px`,
              height: `${star.radius * 2 * baseScale}px`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          >
            <StarIcon fill="currentColor" size="100%" />
          </motion.div>
        )
      ))}

      {/* Instructions Hint */}
      {level.id === 1 && !isDragging && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-olive/40 text-sm uppercase tracking-widest pointer-events-none"
        >
          Drag the pearl to launch
        </motion.div>
      )}
    </motion.div>
  );
}
