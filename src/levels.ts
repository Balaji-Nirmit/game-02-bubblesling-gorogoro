
export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  isStatic?: boolean;
  angle?: number;
  isMoving?: boolean;
  range?: number;
  speed?: number;
  type?: 'normal' | 'bouncy' | 'sticky' | 'rotating';
  rotationSpeed?: number;
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  collected?: boolean;
}

export interface Level {
  id: number;
  name: string;
  start: { x: number; y: number };
  goal: { x: number; y: number; radius: number };
  obstacles: Obstacle[];
  stars?: Star[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "The Beginning",
    start: { x: 100, y: 300 },
    goal: { x: 700, y: 300, radius: 40 },
    obstacles: [
      { x: 400, y: 300, w: 20, h: 200, isStatic: true }
    ],
    stars: [
      { x: 400, y: 150, radius: 15 },
      { x: 400, y: 450, radius: 15 }
    ]
  },
  {
    id: 2,
    name: "Angle of Entry",
    start: { x: 100, y: 500 },
    goal: { x: 700, y: 100, radius: 40 },
    obstacles: [
      { x: 400, y: 400, w: 300, h: 20, isStatic: true, angle: Math.PI / 6 },
      { x: 200, y: 200, w: 200, h: 20, isStatic: true, angle: -Math.PI / 10 }
    ],
    stars: [
      { x: 400, y: 300, radius: 15 },
      { x: 200, y: 400, radius: 15 }
    ]
  },
  {
    id: 3,
    name: "Moving Parts",
    start: { x: 100, y: 100 },
    goal: { x: 700, y: 500, radius: 40 },
    obstacles: [
      { x: 400, y: 300, w: 40, h: 40, isStatic: true, isMoving: true, range: 150, speed: 0.002 }
    ],
    stars: [
      { x: 400, y: 100, radius: 15 },
      { x: 400, y: 500, radius: 15 }
    ]
  },
  {
    id: 4,
    name: "The Gap",
    start: { x: 100, y: 300 },
    goal: { x: 700, y: 300, radius: 30 },
    obstacles: [
      { x: 400, y: 150, w: 20, h: 250, isStatic: true },
      { x: 400, y: 450, w: 20, h: 250, isStatic: true }
    ],
    stars: [
      { x: 400, y: 300, radius: 15 }
    ]
  },
  {
    id: 5,
    name: "Bouncy Castle",
    start: { x: 100, y: 100 },
    goal: { x: 700, y: 500, radius: 40 },
    obstacles: [
      { x: 400, y: 300, w: 100, h: 100, isStatic: true, type: 'bouncy' }
    ],
    stars: [
      { x: 300, y: 300, radius: 15 },
      { x: 500, y: 300, radius: 15 }
    ]
  },
  {
    id: 6,
    name: "The Spinner",
    start: { x: 100, y: 300 },
    goal: { x: 700, y: 300, radius: 40 },
    obstacles: [
      { x: 400, y: 300, w: 200, h: 20, isStatic: true, type: 'rotating', rotationSpeed: 0.02 }
    ],
    stars: [
      { x: 400, y: 200, radius: 15 },
      { x: 400, y: 400, radius: 15 }
    ]
  },
  {
    id: 7,
    name: "Zig Zag",
    start: { x: 100, y: 100 },
    goal: { x: 700, y: 500, radius: 30 },
    obstacles: [
      { x: 200, y: 200, w: 300, h: 20, isStatic: true, angle: Math.PI / 4 },
      { x: 500, y: 400, w: 300, h: 20, isStatic: true, angle: -Math.PI / 4 }
    ],
    stars: [
      { x: 350, y: 300, radius: 15 }
    ]
  },
  {
    id: 8,
    name: "Double Trouble",
    start: { x: 100, y: 300 },
    goal: { x: 700, y: 300, radius: 30 },
    obstacles: [
      { x: 300, y: 300, w: 40, h: 40, isStatic: true, isMoving: true, range: 100, speed: 0.003 },
      { x: 500, y: 300, w: 40, h: 40, isStatic: true, isMoving: true, range: 100, speed: -0.003 }
    ],
    stars: [
      { x: 400, y: 200, radius: 15 },
      { x: 400, y: 400, radius: 15 }
    ]
  },
  {
    id: 9,
    name: "The Funnel",
    start: { x: 400, y: 50 },
    goal: { x: 400, y: 550, radius: 25 },
    obstacles: [
      { x: 200, y: 300, w: 400, h: 20, isStatic: true, angle: Math.PI / 4 },
      { x: 600, y: 300, w: 400, h: 20, isStatic: true, angle: -Math.PI / 4 }
    ],
    stars: [
      { x: 400, y: 300, radius: 15 }
    ]
  },
  {
    id: 10,
    name: "Sticky Situation",
    start: { x: 100, y: 300 },
    goal: { x: 700, y: 300, radius: 40 },
    obstacles: [
      { x: 400, y: 300, w: 100, h: 100, isStatic: true, type: 'sticky' }
    ],
    stars: [
      { x: 400, y: 150, radius: 15 },
      { x: 400, y: 450, radius: 15 }
    ]
  },
  // Levels 11-50+ will be generated with increasing complexity
  ...Array.from({ length: 40 }, (_, i) => {
    const id = i + 11;
    const difficulty = id / 50;
    
    // Randomize start and goal with some constraints
    const start = { 
      x: 80 + Math.random() * 100, 
      y: 100 + Math.random() * 400 
    };
    const goal = { 
      x: 620 + Math.random() * 100, 
      y: 100 + Math.random() * 400, 
      radius: Math.max(20, 40 - difficulty * 20) 
    };
    
    const obstacles: Obstacle[] = [];
    const numObstacles = Math.floor(3 + difficulty * 6);
    
    const types: ('normal' | 'bouncy' | 'sticky' | 'rotating')[] = ['normal', 'bouncy', 'sticky', 'rotating'];

    for (let j = 0; j < numObstacles; j++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const isMoving = Math.random() < (0.3 + difficulty * 0.4);
      
      let obsX = 250 + Math.random() * 300;
      let obsY = 50 + Math.random() * 500;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Prevent obstacles from being too close to start or goal
      while (attempts < maxAttempts) {
        const distToStart = Math.sqrt(Math.pow(obsX - start.x, 2) + Math.pow(obsY - start.y, 2));
        const distToGoal = Math.sqrt(Math.pow(obsX - goal.x, 2) + Math.pow(obsY - goal.y, 2));
        
        if (distToStart > 100 && distToGoal > 120) break;
        
        obsX = 250 + Math.random() * 300;
        obsY = 50 + Math.random() * 500;
        attempts++;
      }

      obstacles.push({
        x: obsX,
        y: obsY,
        w: 30 + Math.random() * (120 - difficulty * 40),
        h: 20 + Math.random() * 40,
        isStatic: true,
        angle: Math.random() * Math.PI,
        isMoving: isMoving,
        range: 50 + Math.random() * 150,
        speed: (0.002 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1),
        type: type,
        rotationSpeed: type === 'rotating' ? (0.01 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1) : undefined
      });
    }

    const stars: Star[] = [];
    const numStars = 3; // Always 3 stars for consistency
    for (let j = 0; j < numStars; j++) {
      const starX = 200 + Math.random() * 400;
      const starY = 100 + Math.random() * 400;
      
      // Check if star overlaps with any obstacle
      const overlaps = obstacles.some(obs => {
        const dx = Math.abs(starX - obs.x);
        const dy = Math.abs(starY - obs.y);
        return dx < (obs.w / 2 + 20) && dy < (obs.h / 2 + 20);
      });

      if (overlaps) {
        j--;
        continue;
      }

      stars.push({
        x: starX,
        y: starY,
        radius: 15
      });
    }
    
    const names = ["Nebula", "Void", "Prism", "Echo", "Aether", "Zenith", "Horizon", "Flux", "Pulse", "Orbit"];
    const name = `${names[id % names.length]} ${Math.floor(id / 10)}`;

    return {
      id,
      name,
      start,
      goal,
      obstacles,
      stars
    };
  })
];
