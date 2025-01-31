export class GameEngine {
  constructor(selectedCharacter, level = 1) {
    // Add blindEffect initialization at the start
    this.blindEffect = {
      active: false,
      duration: 0,
      opacity: 0
    };
    
    // Add new properties for Chill Guy
    // Removed global slowEffect, instead using slowEffects map for individual enemies
    
    // Initialize audio elements first
    this.battleMusic = document.getElementById('battle-music');
    this.backgroundMusic = document.getElementById('background-music');
    
    // Rest of initialization
    this.level = level;
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.selectedCharacter = selectedCharacter;
    this.gameActive = true;

    // Set initial music based on character/level
    if (selectedCharacter === 'Chill Guy') {
      this.battleMusic.src = '/chill-guy-made-with-Voicemod.mp3';
    } else if (selectedCharacter === 'Steve') {
      this.battleMusic.src = '/Minecraft Chill...(Nostalgia Music Relax, Sleep.).mp3';
    } else if (this.level === 2) {
      this.battleMusic.src = '/Family Guy Instrumental Intro.mp3';
    } else {
      this.battleMusic.src = '/05. Loonboon.mp3';
    }
    
    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Game state with increased sizes
    this.player = {
      x: 100,
      y: 100,
      speed: 5,
      width: 70,  
      height: 70, 
      health: 100,
      hasGun: false,
      sprite: new Image(),
      lastAttack: 0,
      attackCooldown: 1000 
    };
    
    if (this.level === 1) {
      this.patrick = {
        x: 500,
        y: 300,
        width: 80,  
        height: 80, 
        health: 300,
        speed: 2,
        baseSpeed: 2, // Store base speed
        direction: 1,
        moveTimer: 0,
        sprite: new Image(),
        smugSprite: new Image(),
        danceSprite: null,
        isDancing: false,
        isSmug: false
      };
    } else if (this.level === 2) {
      this.peter = {
        x: 500,
        y: 300,
        width: 100,
        height: 100,
        health: 500,
        maxHealth: 500,
        speed: 3,
        baseSpeed: 3, // Store base speed
        lastAttack: 0,
        attackCooldown: 500,
        hasBeenDamaged: false,
        sprite: new Image(),
        moveTimer: 0,
        isDancing: false,
        danceElement: document.createElement('div')
      };
      
      // Load Peter's sprite
      this.peter.sprite.src = '/Peter_Griffin.png';
      
      // Set up Peter's dance element
      this.peter.danceElement.style.cssText = `
        position: absolute;
        display: none;
        z-index: 1001;
      `;
      this.peter.danceElement.innerHTML = `<img src="/peter dancing.gif" style="width: 250px; height: 250px;">`;
      document.getElementById('game-screen').appendChild(this.peter.danceElement);

      this.windowsLogo = new Image();
      this.windowsLogo.src = '/dfom9ho-0e411c0f-e367-480b-8c90-77ea71f64628.png';
      
      this.exitSign = new Image();
      this.exitSign.src = '/Exit.png';
      
      this.trollface = new Image();
      this.trollface.src = '/trollface (2).png';
      
      this.sadSpongebob = new Image();
      this.sadSpongebob.src = '/Captura de pantalla_14-12-2024_22935_www.bing.com.jpeg';
      
      this.exits = [];
      this.windowsLogos = [];
      this.trollfaces = [];
    }
    
    // Add slowEffects tracking for individual enemies
    this.slowEffects = new Map(); // Map to track slow effects per enemy
    
    this.floppas = [];
    this.projectiles = [];
    this.gunPickups = [];
    this.forceFieldPickups = [];
    
    // Load background image
    this.backgroundImage = new Image();
    this.backgroundImage.src = this.level === 1 ? '/Garden vs Deads 2 (pvz ripoff).jpg' : '/Courtyard.jpg';

    // Wait for images to load before using them
    const imageLoadPromises = [];

    // Player sprite
    imageLoadPromises.push(new Promise(resolve => {
      this.player.sprite.onload = resolve;
      this.player.sprite.src = this.getCharacterSprite(selectedCharacter);
    }));

    if (this.level === 1) {
      // Patrick sprites
      imageLoadPromises.push(new Promise(resolve => {
        this.patrick.sprite.onload = resolve;
        this.patrick.sprite.src = '/Patrick_Star.svg.png';
      }));
      imageLoadPromises.push(new Promise(resolve => {
        this.patrick.smugSprite.onload = resolve;
        this.patrick.smugSprite.src = '/OIP (2).jpg';
      }));
    } else if (this.level === 2) {
      // Peter sprite
      imageLoadPromises.push(new Promise(resolve => {
        this.peter.sprite.onload = resolve;
        this.peter.sprite.src = '/Peter_Griffin.png';
      }));

      // Level 2 specific images
      imageLoadPromises.push(
        new Promise(resolve => {
          this.windowsLogo.onload = resolve;
          this.windowsLogo.src = '/dfom9ho-0e411c0f-e367-480b-8c90-77ea71f64628.png';
        }),
        new Promise(resolve => {
          this.exitSign.onload = resolve;
          this.exitSign.src = '/Exit.png';
        }),
        new Promise(resolve => {
          this.trollface.onload = resolve;
          this.trollface.src = '/trollface (2).png';
        }),
        new Promise(resolve => {
          this.sadSpongebob.onload = resolve;
          this.sadSpongebob.src = '/Captura de pantalla_14-12-2024_22935_www.bing.com.jpeg';
        })
      );
    }

    // Gun sprite
    this.gunSprite = new Image();
    imageLoadPromises.push(new Promise(resolve => {
      this.gunSprite.onload = resolve;
      this.gunSprite.src = '/Item_Glock-sharedassets4.assets-616.webp';
    }));

    // Force field sprite
    this.forceFieldSprite = new Image();
    imageLoadPromises.push(new Promise(resolve => {
      this.forceFieldSprite.onload = resolve;
      this.forceFieldSprite.src = '/electric.png';
    }));

    // Update weapon sprites
    this.weaponSprites = {
      'Steve': '/Cake.png',  
      'Mario': '/pipe.png',
      'Among Us': '/Apple.png', 
      'Roblox Noob': '/Untitled.jpg',
      'Chill Guy': '/ubpa3bopktloamguher5.png'  
    };

    // Add special gun weapon sprites
    this.gunWeaponSprites = {
      'Steve': '/Cake.png',  
      'Mario': '/pipe.png',
      'Among Us': '/Golden-Apple.png', 
      'Roblox Noob': '/Untitled.jpg',
      'Chill Guy': '/ubpa3bopktloamguher5.png'  
    };

    // Wait for all images to load before starting
    Promise.all(imageLoadPromises).then(() => {
      this.imagesLoaded = true;
    });

    // Add new audio elements
    this.vineBoom = new Audio('/vine-boom.mp3');
    this.vineBoom.volume = 0.3;
    
    // Input handling
    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false,
      f: false
    };

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) {
        this.keys[key] = true;
        if (key === 'f') {
          this.handleAttack();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) {
        this.keys[key] = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
    window.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.lastMouseX = e.clientX - rect.left;
      this.lastMouseY = e.clientY - rect.top;
    });
    
    // Add force field state
    this.hasForceField = false;
    this.forceFieldTimeLeft = 0;
    
    // Add victory dance elements for each character
    this.characterDanceElement = document.createElement('div');
    this.characterDanceElement.style.cssText = `
      position: absolute;
      display: none;
      z-index: 1000;
    `;
    
    // Set up dance gifs for each character
    this.danceGifs = {
      'Steve': '/minecraft-steve.gif',
      'Mario': '/mario-mario-dancing.gif',
      'Among Us': '/200w.gif',
      'Roblox Noob': '/27187609c933f7c1009722b5fae6a4b4.gif',
      'Chill Guy': '/chill-guy-in-autumn-season-pg22l237qdpr850c.gif'
    };
    
    document.getElementById('game-screen').appendChild(this.characterDanceElement);
    
    // Add gun duration timer
    this.gunTimeLeft = 0;
    
    // Create Patrick's dance element
    if (this.level === 1) {
      this.patrickDanceElement = document.createElement('div');
      this.patrickDanceElement.style.cssText = `
        position: absolute;
        display: none;
        z-index: 1000;
      `;
      this.patrickDanceElement.innerHTML = `<img src="/patrick-dancing.gif" style="width: 250px; height: 250px;">`;
      document.getElementById('game-screen').appendChild(this.patrickDanceElement);
    }
    
    this.initMobileControls();
  }

  initMobileControls() {
    // Only initialize if on mobile
    if (!this.isMobileDevice()) return;

    const movementPad = document.querySelector('.movement-pad');
    const shootButton = document.querySelector('.shoot-button');
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    movementPad.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });
    
    movementPad.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Normalize movement
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 50; // Maximum movement distance
      
      const normalizedX = deltaX / distance;
      const normalizedY = deltaY / distance;
      
      this.keys.a = deltaX < -10;
      this.keys.d = deltaX > 10;
      this.keys.w = deltaY < -10;
      this.keys.s = deltaY > 10;
    });
    
    movementPad.addEventListener('touchend', () => {
      this.keys.w = false;
      this.keys.s = false;
      this.keys.a = false;
      this.keys.d = false;
    });
    
    shootButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.autoTarget();
    });
  }
  
  isMobileDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
  }
  
  autoTarget() {
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    // Find closest enemy based on current level
    if (this.level === 1) {
      // Check Patrick
      const distToPatrick = this.getDistance(this.player, this.patrick);
      if (distToPatrick < closestDistance) {
        closestDistance = distToPatrick;
        closestEnemy = this.patrick;
      }
      
      // Check Floppas
      this.floppas.forEach(floppa => {
        const dist = this.getDistance(this.player, floppa);
        if (dist < closestDistance) {
          closestDistance = dist;
          closestEnemy = floppa;
        }
      });
    } else if (this.level === 2) {
      // Target Peter
      closestEnemy = this.peter;
      closestDistance = this.getDistance(this.player, this.peter);
    }
    
    if (closestEnemy) {
      // Calculate angle to target
      const dx = closestEnemy.x + (closestEnemy.width / 2) - (this.player.x + this.player.width / 2);
      const dy = closestEnemy.y + (closestEnemy.height / 2) - (this.player.y + this.player.height / 2);
      
      // Update last mouse position for shooting
      this.lastMouseX = this.player.x + this.player.width / 2 + dx;
      this.lastMouseY = this.player.y + this.player.height / 2 + dy;
      
      // Trigger attack
      this.handleAttack();
    }
  }
  
  getDistance(obj1, obj2) {
    const dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
    const dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  getCharacterSprite(character) {
    const sprites = {
      'Steve': '/the REAL REAL STEVE.jpg',
      'Among Us': '/an871k4o1sn51 (1).png',
      'Roblox Noob': '/OIP (1).jfif',
      'Mario': '/smb1 mario idle.webp',
      'Chill Guy': '/chill-guy.webp'  
    };
    return sprites[character];
  }
  
  getCharacterDescription(character) {
    const descriptions = {
        'Steve': {
            description: "This blocky hero breaks the mold! Armed with unlimited cake slices from his inventory, Steve brings a taste of Minecraft mayhem to the battlefield. Who knew dessert could be so dangerous?",
            baseDamage: "10-30"
        },
        'Among Us': {
            description: "Looking pretty sus with those apples! This crafty crewmate turns emergency meetings into food fights, yeeting golden apples at anyone who looks even slightly suspicious.",
            baseDamage: "10-30"
        },
        'Roblox Noob': {
            description: "Money talks, but tickets fly! This classic Roblox champion makes it rain with old-school Tix, proving that discontinued currency can still pack a punch.",
            baseDamage: "10-30"
        },
        'Mario': {
            description: "It's-a him, Mario! Trading Bowser-bonking for pipe-throwing, our favorite plumber brings his trademark enthusiasm to a whole new type of pipe-based problem solving.",
            baseDamage: "10-30"
        },
        'Chill Guy': {
            description: "The most laid-back hero around! Armed with endless Snickers bars, he believes everyone gets a little aggressive when they're hungry. His chocolate projectiles not only deal damage but also help enemies chill out!",
            baseDamage: "10-30",
            special: "Slows enemies to 50% speed for 3 seconds"
        }
    };
    return descriptions[character];
  }
  
  updateCharacterDetails() {
    const detailsPanel = document.getElementById('character-details');
    if (detailsPanel) {
      const description = this.getCharacterDescription(this.selectedCharacter);
      detailsPanel.innerHTML = `
        <img src="${this.getCharacterSprite(this.selectedCharacter)}" alt="${this.selectedCharacter}">
        <h3>${this.selectedCharacter}</h3>
        <p>${description.description}</p>
        <div class="weapon-info">
          <img src="${this.weaponSprites[this.selectedCharacter]}" alt="Weapon">
          <div>
            <div class="damage-info">Base Damage: ${description.baseDamage}</div>
          </div>
        </div>
        <div class="controls-section">
          <h4>Controls:</h4>
          <ul class="controls-list">
            <li><span class="control-key">W</span>Move Up</li>
            <li><span class="control-key">S</span>Move Down</li>
            <li><span class="control-key">A</span>Move Left</li>
            <li><span class="control-key">D</span>Move Right</li>
            <li><span class="control-key">F</span>Attack</li>
            <li><span class="control-key">Mouse</span>Aim</li>
          </ul>
        </div>
      `;
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  start() {
    // Wait for images to load before starting the game loop
    if (!this.imagesLoaded) {
      setTimeout(() => this.start(), 100);
      return;
    }

    this.backgroundMusic.pause();
    this.battleMusic.volume = 0.3;
    this.battleMusic.play();
    this.gameLoop();
    if (this.level === 1) {
      this.spawnGunPickup();
      setInterval(() => this.summonFloppas(), 3000);
    }
    this.updateCharacterDetails();
  }
  
  spawnGunPickup() {
    if (Math.random() < 0.1 && this.gunPickups.length < 1) {
      this.gunPickups.push({
        x: Math.random() * (this.canvas.width - 40),
        y: Math.random() * (this.canvas.height - 40),
        width: 40,
        height: 40
      });
    }
    setTimeout(() => this.spawnGunPickup(), 5000);
  }
  
  spawnPowerUps() {
    if (this.level === 2) {
      if (Math.random() < 0.2 && this.forceFieldPickups.length < 1) {
        this.forceFieldPickups.push({
          x: Math.random() * (this.canvas.width - 40),
          y: Math.random() * (this.canvas.height - 40),
          width: 40,
          height: 40
        });
      }
    }
  }
  
  summonFloppas() {
    if (this.level === 1) {
      if (this.floppas.length < 3) {
        this.patrick.isSmug = true;
        setTimeout(() => this.patrick.isSmug = false, 1000);
        
        const newFloppa = {
          x: this.patrick.x,
          y: this.patrick.y,
          width: 60,  
          height: 60, 
          speed: 3,
          baseSpeed: 3, // Store base speed
          health: 50,
          sprite: new Image()
        };
        newFloppa.sprite.src = '/floppa_png-removebg-preview.png';
        this.floppas.push(newFloppa);
      }
    }
  }
  
  handleAttack() {
    const now = Date.now();
    if (now - this.player.lastAttack >= this.player.attackCooldown) {
      const projectile = {
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height / 2,
        width: 40,  
        height: 40, 
        speed: this.player.hasGun ? 12 : 8,
        damage: this.player.hasGun ? 
          Math.floor(Math.random() * 21) + 40 :
          Math.floor(Math.random() * 21) + 10,
        sprite: new Image(),
        slowOnHit: this.selectedCharacter === 'Chill Guy'  
      };
      
      // Select weapon sprite based on character and gun status
      const spriteSource = this.player.hasGun ? 
        this.gunWeaponSprites[this.selectedCharacter] : 
        this.weaponSprites[this.selectedCharacter];
      
      projectile.sprite.src = spriteSource;
      
      if (this.player.hasGun) {
        if (this.selectedCharacter === 'Mario') {
          this.pipeSound = new Audio('/metal pipe.wav');
          this.pipeSound.volume = 0.3;
          this.pipeSound.currentTime = 0;
          this.pipeSound.play();
        } else {
          this.gunSound = new Audio('/gunshoot.mp3');
          this.gunSound.volume = 0.3;
          this.gunSound.currentTime = 0;
          this.gunSound.play();
        }
      }
      
      const angle = Math.atan2(
        this.lastMouseY - projectile.y,
        this.lastMouseX - projectile.x
      );
      
      projectile.dx = Math.cos(angle) * projectile.speed;
      projectile.dy = Math.sin(angle) * projectile.speed;
      
      this.projectiles.push(projectile);
      this.player.lastAttack = now;
    }
  }

  update() {
    if (this.level === 1) {
      // Update patrick's speed based on slow effect
      const patrickSlowEffect = this.slowEffects.get(this.patrick);
      if (patrickSlowEffect) {
        if (patrickSlowEffect.duration > 0) {
          this.patrick.speed = this.patrick.baseSpeed * patrickSlowEffect.multiplier;
          patrickSlowEffect.duration--;
        } else {
          this.patrick.speed = this.patrick.baseSpeed;
          this.slowEffects.delete(this.patrick);
        }
      }

      // Update floppas' speeds individually
      this.floppas.forEach(floppa => {
        const floppaSlowEffect = this.slowEffects.get(floppa);
        if (floppaSlowEffect) {
          if (floppaSlowEffect.duration > 0) {
            floppa.speed = (floppa.baseSpeed || 3) * floppaSlowEffect.multiplier;
            floppaSlowEffect.duration--;
          } else {
            floppa.speed = floppa.baseSpeed || 3;
            this.slowEffects.delete(floppa);
          }
        }
      });

      if (this.keys['w']) this.player.y -= this.player.speed;
      if (this.keys['s']) this.player.y += this.player.speed;
      if (this.keys['a']) this.player.x -= this.player.speed;
      if (this.keys['d']) this.player.x += this.player.speed;
      
      this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
      this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
      
      if (this.checkCollision(this.player, this.patrick)) {
        this.player.health = Math.max(0, this.player.health - 2); 
        document.getElementById('health-fill').style.width = `${this.player.health}%`;
      }

      this.floppas.forEach(floppa => {
        const dx = this.player.x - floppa.x;
        const dy = this.player.y - floppa.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        floppa.x += (dx / dist) * floppa.speed;
        floppa.y += (dy / dist) * floppa.speed;
        
        if (this.checkCollision(this.player, floppa)) {
          this.player.health = Math.max(0, this.player.health - 0.5);
          document.getElementById('health-fill').style.width = `${this.player.health}%`;
        }
      });

      this.projectiles.forEach((projectile, index) => {
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        
        if (this.checkCollision(projectile, this.patrick)) {
          this.patrick.health = Math.max(0, this.patrick.health - projectile.damage);
          if (projectile.slowOnHit) {
            this.slowEffects.set(this.patrick, {
              duration: 180, // 3 seconds at 60fps
              multiplier: 0.5
            });
          }
          this.projectiles.splice(index, 1);
        }
        
        this.floppas.forEach((floppa, floppaIndex) => {
          if (this.checkCollision(projectile, floppa)) {
            floppa.health -= projectile.damage;
            if (projectile.slowOnHit) {
              this.slowEffects.set(floppa, {
                duration: 180,
                multiplier: 0.5
              });
            }
            this.projectiles.splice(index, 1);
            if (floppa.health <= 0) {
              this.floppas.splice(floppaIndex, 1);
            }
          }
        });
      });

      this.projectiles.forEach((projectile, index) => {
        if (projectile.x < 0 || projectile.x > this.canvas.width || projectile.y < 0 || projectile.y > this.canvas.height) {
          this.projectiles.splice(index, 1);
        }
      });
      
      if (this.player.hasGun) {
        if (this.gunTimeLeft <= 0) {
          this.player.hasGun = false;
        } else {
          this.gunTimeLeft--;
        }
      }
      
      this.gunPickups.forEach((pickup, index) => {
        if (this.checkCollision(this.player, pickup)) {
          this.player.hasGun = true;
          this.gunTimeLeft = 30 * 60; 
          this.gunPickups.splice(index, 1);
        }
      });
      
      this.patrick.moveTimer++;
      
      if (this.patrick.moveTimer >= 120) {
        this.patrick.direction = Math.random() * Math.PI * 2; 
        this.patrick.moveTimer = 0;
      }
      
      this.patrick.x += Math.cos(this.patrick.direction) * this.patrick.speed;
      this.patrick.y += Math.sin(this.patrick.direction) * this.patrick.speed;
      
      this.patrick.x = Math.max(0, Math.min(this.canvas.width - this.patrick.width, this.patrick.x));
      this.patrick.y = Math.max(0, Math.min(this.canvas.height - this.patrick.height, this.patrick.y));

      if (this.player.health <= 0) {
        this.gameOver(false);
      } else if (this.patrick.health <= 0) {
        this.gameOver(true);
      }
    } else if (this.level === 2) {
      // Update peter's speed based on slow effect
      const peterSlowEffect = this.slowEffects.get(this.peter);
      if (peterSlowEffect) {
        if (peterSlowEffect.duration > 0) {
          this.peter.speed = this.peter.baseSpeed * peterSlowEffect.multiplier;
          peterSlowEffect.duration--;
        } else {
          this.peter.speed = this.peter.baseSpeed;
          this.slowEffects.delete(this.peter);
        }
      }

      if (this.keys['w']) this.player.y -= this.player.speed;
      if (this.keys['s']) this.player.y += this.player.speed;
      if (this.keys['a']) this.player.x -= this.player.speed;
      if (this.keys['d']) this.player.x += this.player.speed;
      
      this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
      this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
      
      const dx = this.player.x - this.peter.x;
      const dy = this.player.y - this.peter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 200) { 
        this.peter.x += (dx / dist) * this.peter.speed;
        this.peter.y += (dy / dist) * this.peter.speed;
      }
      
      const now = Date.now();
      if (now - this.peter.lastAttack >= this.peter.attackCooldown) {
        const roll = Math.random();
        const healthPercentage = this.peter.health / this.peter.maxHealth;
        
        // Calculate exit spawn chance based on health - more exits at lower health
        const exitSpawnChance = 0.15 + (1 - healthPercentage) * 0.3; // Increases from 15% to 45% chance
        
        if (roll < 0.5) { // 50% chance for trollface
          this.trollfaces.push({
            x: this.peter.x,
            y: this.peter.y,
            width: 40,
            height: 40,
            dx: (this.player.x - this.peter.x) / 50,
            dy: (this.player.y - this.peter.y) / 50
          });
        } else if (roll < 0.7) { // 20% chance for placed Windows logo
          this.windowsLogos.push({
            x: this.peter.x + (Math.random() * 200 - 100),
            y: this.peter.y + (Math.random() * 200 - 100),
            width: 50,
            height: 50
          });
        } else if (roll < exitSpawnChance + 0.7) { // Dynamic chance for exit spawn
          // Spawn 1-3 exits based on health percentage, now at Peter's location
          const numExits = Math.ceil((1 - healthPercentage) * 3);
          for (let i = 0; i < numExits; i++) {
            // Calculate positions in a circular pattern around Peter
            const angle = (i * 2 * Math.PI) / numExits;
            const radius = 100; // Distance from Peter
            const exitX = this.peter.x + Math.cos(angle) * radius;
            const exitY = this.peter.y + Math.sin(angle) * radius;
            
            // Ensure exits stay within canvas bounds
            const boundedX = Math.max(0, Math.min(this.canvas.width - 50, exitX));
            const boundedY = Math.max(0, Math.min(this.canvas.height - 50, exitY));
            
            this.exits.push({
              x: boundedX,
              y: boundedY,
              width: 50,
              height: 50
            });
          }
        } else if (this.peter.hasBeenDamaged) { // Remaining chance for thrown Windows logo
          this.windowsLogos.push({
            x: this.peter.x,
            y: this.peter.y,
            width: 50,
            height: 50,
            dx: (this.player.x - this.peter.x) / 40,
            dy: (this.player.y - this.peter.y) / 40
          });
        }
        
        this.peter.lastAttack = now;
      }

      this.projectiles.forEach((projectile, index) => {
        this.projectiles[index].x += projectile.dx;
        this.projectiles[index].y += projectile.dy;
        
        if (this.checkCollision(projectile, this.peter)) {
          this.peter.health = Math.max(0, this.peter.health - projectile.damage);
          if (projectile.slowOnHit) {
            this.slowEffects.set(this.peter, {
              duration: 180,
              multiplier: 0.5
            });
          }
          this.projectiles.splice(index, 1);
          if (!this.peter.hasBeenDamaged && this.peter.health < this.peter.maxHealth) {
            this.peter.hasBeenDamaged = true;
          }
        }
      });
      
      this.trollfaces.forEach((trollface, index) => {
        trollface.x += trollface.dx;
        trollface.y += trollface.dy;
        
        if (this.checkCollision(this.player, trollface) && !this.hasForceField) {
          this.player.health = Math.max(0, this.player.health - 10);
          document.getElementById('health-fill').style.width = `${this.player.health}%`;
          this.trollfaces.splice(index, 1);
        }
      });
      
      this.windowsLogos.forEach((logo, index) => {
        if (logo.dx) { 
          logo.x += logo.dx;
          logo.y += logo.dy;
        }
        
        if (this.checkCollision(this.player, logo) && !this.hasForceField) {
          if (this.player.health <= 5) {
            this.player.health = 0;
          } else {
            this.player.health = Math.max(0, this.player.health - this.player.health / 2);
          }
          this.windowsLogos.splice(index, 1);
          this.blindEffect.active = true;
          this.blindEffect.duration = 120;
          this.blindEffect.opacity = 1;
          this.vineBoom.play();
          document.getElementById('health-fill').style.width = `${this.player.health}%`;
        }
      });

      this.exits.forEach((exit, index) => {
        if (this.checkCollision(this.player, exit) && !this.hasForceField) {
          this.player.health = 0;
          document.getElementById('health-fill').style.width = `0%`;
        }
      });
      
      if (this.blindEffect.active) {
        if (this.blindEffect.duration > 0) {
          this.blindEffect.duration--;
        } else {
          this.blindEffect.opacity = Math.max(0, this.blindEffect.opacity - 0.05);
          if (this.blindEffect.opacity <= 0) {
            this.blindEffect.active = false;
          }
        }
      }
      
      if (this.hasForceField) {
        if (this.forceFieldTimeLeft <= 0) {
          this.hasForceField = false;
        } else {
          this.forceFieldTimeLeft--;
        }
      }
      
      this.gunPickups.forEach((pickup, index) => {
        if (this.checkCollision(this.player, pickup)) {
          this.player.hasGun = true;
          this.gunTimeLeft = 30 * 60; 
          this.gunPickups.splice(index, 1);
        }
      });
      
      this.forceFieldPickups.forEach((pickup, index) => {
        if (this.checkCollision(this.player, pickup)) {
          this.hasForceField = true;
          this.forceFieldTimeLeft = 20 * 60; 
          this.forceFieldPickups.splice(index, 1);
        }
      });
      
      if (this.checkCollision(this.player, this.peter)) {
        this.player.health = Math.max(0, this.player.health - 3); 
        document.getElementById('health-fill').style.width = `${this.player.health}%`;
      }
      
      if (this.player.health <= 0) {
        this.gameOver(false);
      } else if (this.peter.health <= 0) {
        this.gameOver(true);
      }
    }
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  draw() {
    // Only draw if images are loaded
    if (!this.imagesLoaded) {
      requestAnimationFrame(() => this.draw());
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
    
    if (this.level === 1) {
      if (this.gameActive) {
        this.ctx.drawImage(
          this.player.sprite,
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        );
        
        if (this.player.hasGun) {
          this.ctx.drawImage(
            this.gunSprite,
            this.player.x + this.player.width - 20,
            this.player.y + this.player.height - 20,
            30,
            20
          );
        }
      }
      
      if (!this.patrick.isDancing) {
        const patrickSprite = this.patrick.isSmug ? this.patrick.smugSprite : this.patrick.sprite;
        this.ctx.drawImage(
          patrickSprite,
          this.patrick.x,
          this.patrick.y,
          this.patrick.width,
          this.patrick.height
        );
      }
      
      if (this.patrick.isDancing) {
        this.patrickDanceElement.style.display = 'block';
        this.patrickDanceElement.style.left = `${this.patrick.x}px`;
        this.patrickDanceElement.style.top = `${this.patrick.y}px`;
      } else {
        this.patrickDanceElement.style.display = 'none';
      }
      
      this.floppas.forEach(floppa => {
        this.ctx.drawImage(floppa.sprite, floppa.x, floppa.y, floppa.width, floppa.height);
      });
      
      this.projectiles.forEach(projectile => {
        this.ctx.drawImage(
          projectile.sprite,
          projectile.x,
          projectile.y,
          projectile.width,
          projectile.height
        );
      });
      
      this.gunPickups.forEach(pickup => {
        this.ctx.drawImage(
          this.gunSprite,
          pickup.x,
          pickup.y,
          40,  
          40   
        );
      });
      
      this.ctx.fillStyle = 'white';
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 3;
      this.ctx.font = '20px Arial';

      const playerHealth = `HP: ${Math.ceil(this.player.health)}/100`;
      this.ctx.strokeText(playerHealth, 10, 60);
      this.ctx.fillText(playerHealth, 10, 60);

      const patrickHealth = `HP: ${Math.ceil(this.patrick.health)}/300`;
      this.ctx.strokeText(patrickHealth, this.patrick.x, this.patrick.y - 10);
      this.ctx.fillText(patrickHealth, this.patrick.x, this.patrick.y - 10);

      if (this.player.hasGun) {
        const timeLeft = Math.ceil(this.gunTimeLeft / 60);
        const gunTimer = `Gun: ${timeLeft}s`;
        this.ctx.strokeText(gunTimer, 10, 90);
        this.ctx.fillText(gunTimer, 10, 90);
      }
    } else if (this.level === 2) {
      if (this.gameActive) { 
        this.ctx.drawImage(
          this.player.sprite,
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        );

        if (!this.peter.isDancing) { 
          this.ctx.drawImage(
            this.peter.sprite,
            this.peter.x,
            this.peter.y,
            this.peter.width,
            this.peter.height
          );
        }
      }
      
      this.projectiles.forEach(projectile => {
        this.ctx.drawImage(
          projectile.sprite,
          projectile.x,
          projectile.y,
          projectile.width,
          projectile.height
        );
      });
      
      this.trollfaces.forEach(trollface => {
        this.ctx.drawImage(
          this.trollface,
          trollface.x,
          trollface.y,
          trollface.width,
          trollface.height
        );
      });
      
      this.windowsLogos.forEach(logo => {
        this.ctx.drawImage(
          this.windowsLogo,
          logo.x,
          logo.y,
          logo.width,
          logo.height
        );
      });
      
      this.exits.forEach(exit => {
        this.ctx.drawImage(
          this.exitSign,
          exit.x,
          exit.y,
          exit.width,
          exit.height
        );
      });
      
      this.gunPickups.forEach(pickup => {
        this.ctx.drawImage(this.gunSprite, pickup.x, pickup.y, pickup.width, pickup.height);
      });
      
      this.forceFieldPickups.forEach(pickup => {
        this.ctx.drawImage(this.forceFieldSprite, pickup.x, pickup.y, pickup.width, pickup.height);
      });
      
      if (this.blindEffect.active) {
        this.ctx.globalAlpha = this.blindEffect.opacity;
        this.ctx.drawImage(
          this.sadSpongebob,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        this.ctx.globalAlpha = 1;
      }
      
      if (this.hasForceField && this.gameActive) { 
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(
          this.forceFieldSprite,
          this.player.x - 10,
          this.player.y - 10,
          this.player.width + 20,
          this.player.height + 20
        );
        this.ctx.restore();
        
        const timeLeft = Math.ceil(this.forceFieldTimeLeft / 60);
        const shieldTimer = `Shield: ${timeLeft}s`;
        this.ctx.strokeText(shieldTimer, 10, 120);
        this.ctx.fillText(shieldTimer, 10, 120);
      }
      
      this.ctx.fillStyle = 'white';
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 3;
      this.ctx.font = '20px Arial';

      const playerHealth = `HP: ${Math.ceil(this.player.health)}/100`;
      this.ctx.strokeText(playerHealth, 10, 60);
      this.ctx.fillText(playerHealth, 10, 60);

      const peterHealth = `HP: ${Math.ceil(this.peter.health)}/500`;
      this.ctx.strokeText(peterHealth, this.peter.x, this.peter.y - 10);
      this.ctx.fillText(peterHealth, this.peter.x, this.peter.y - 10);
    }
  }

  gameOver(playerWon) {
    this.gameActive = false;
    this.blindEffect.active = false; 

    if (playerWon) {
      localStorage.setItem('repositoryUnlocked', 'true');
      if (this.level === 1) {
        localStorage.setItem('level2Unlocked', 'true');
        // Show level select button when level 1 is completed
        const levelSelectButton = document.getElementById('level-select-button');
        if (levelSelectButton) {
          levelSelectButton.style.display = 'block';
        }
      }
        
      this.hasForceField = false;
        
      // Hide both player and Peter sprites when player wins
      if (this.level === 2) {
        this.player.sprite.style.display = 'none';
        if (this.peter.sprite) {
          this.peter.sprite.style.display = 'none';  // Hide Peter only when player wins
        }
      }
        
      if (this.characterDanceElement) {
        this.characterDanceElement.innerHTML = `<img src="${this.danceGifs[this.selectedCharacter]}" style="width: 250px; height: 250px;">`;
        this.characterDanceElement.style.position = 'absolute';
        this.characterDanceElement.style.left = '30%';  
        this.characterDanceElement.style.top = '40%'; 
        this.characterDanceElement.style.transform = 'translate(-50%, -50%)';
        this.characterDanceElement.style.display = 'block';
        this.characterDanceElement.style.zIndex = '1001'; 
      }

      if (this.level === 2 && !localStorage.getItem('completionMessageShown')) {
        localStorage.setItem('chillGuyUnlocked', 'true');
        localStorage.setItem('completionMessageShown', 'true');
        
        const completionMessage = document.getElementById('completion-message');
        if (completionMessage) {
          completionMessage.classList.remove('hidden');
          
          const returnButton = document.createElement('button');
          returnButton.textContent = 'Return to Menu';
          returnButton.className = 'return-button';
          returnButton.onclick = () => {
            completionMessage.classList.add('hidden');
            location.reload();
          };
          completionMessage.appendChild(returnButton);
        }
      }
    } else {
      if (this.level === 1 && this.patrickDanceElement) {
        this.patrick.isDancing = true;
        this.patrickDanceElement.style.position = 'absolute';
        this.patrickDanceElement.style.left = '70%';  
        this.patrickDanceElement.style.top = '40%'; 
        this.patrickDanceElement.style.transform = 'translate(-50%, -50%)';
        this.patrickDanceElement.style.display = 'block';
        this.patrickDanceElement.style.zIndex = '1001'; 
      } else if (this.level === 2) {
        if (this.player.sprite) {
          this.player.sprite.style.display = 'none';  // Hide only player sprite when losing
        }
        // Do not hide Peter's sprite when player loses
        this.peter.isDancing = true;
        if (this.peter.danceElement) {
          // Update Peter's dance element position to match his last position
          this.peter.danceElement.style.position = 'absolute';
          this.peter.danceElement.style.left = `${this.peter.x}px`;
          this.peter.danceElement.style.top = `${this.peter.y}px`;
          this.peter.danceElement.style.transform = 'translate(0, 0)';  // Remove centering transform
          this.peter.danceElement.style.display = 'block';
        }
      }
    }
    
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      const gameOverTitle = document.getElementById('game-over-title');
      if (gameOverTitle) {
        gameOverTitle.textContent = playerWon ? 'You Won!' : (this.level === 1 ? 'Patrick Wins!' : 'Peter Wins!');
      }
      gameOverScreen.classList.remove('hidden');
      
      const returnButton = document.getElementById('return-to-select');
      if (returnButton) {
        returnButton.onclick = () => {
          location.reload();
        };
      }
    }
  }

  gameLoop() {
    if (this.gameActive) {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}