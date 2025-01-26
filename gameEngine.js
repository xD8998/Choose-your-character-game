export class GameEngine {
  constructor(selectedCharacter) {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.selectedCharacter = selectedCharacter;
    this.gameActive = true;
    
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
    
    this.patrick = {
      x: 500,
      y: 300,
      width: 80,  
      height: 80, 
      health: 300,
      speed: 2,
      direction: 1,
      moveTimer: 0,
      sprite: new Image(),
      smugSprite: new Image(),
      danceSprite: null,
      isDancing: false,
      isSmug: false
    };
    
    this.floppas = [];
    this.projectiles = [];
    this.gunPickups = [];
    this.battleMusic = document.getElementById('battle-music');
    if (selectedCharacter === 'Steve') {
      this.battleMusic.src = '/Minecraft Chill...(Nostalgia Music Relax, Sleep.).mp3';
    } else {
      this.battleMusic.src = '/05. Loonboon.mp3';
    }
    this.backgroundMusic = document.getElementById('background-music');
    
    // Load sprites
    this.player.sprite.src = this.getCharacterSprite(selectedCharacter);
    this.patrick.sprite.src = '/Patrick_Star.svg.png';
    this.patrick.smugSprite.src = '/OIP (2).jpg';
    
    // Load weapon sprites
    this.weaponSprites = {
      'Roblox Noob': '/Untitled.jpg', 
      'Mario': '/pipe.png',
      'Among Us': '/Apple.png',
      'Steve': '/Cake.png'
    };

    // Create Patrick's dance element
    this.patrickDanceElement = document.createElement('div');
    this.patrickDanceElement.style.cssText = `
      position: absolute;
      display: none;
      z-index: 1000;
    `;
    this.patrickDanceElement.innerHTML = `<img src="/patrick-dancing.gif" style="width: 250px; height: 250px;">`;
    document.getElementById('game-screen').appendChild(this.patrickDanceElement);
    
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
      'Roblox Noob': '/27187609c933f7c1009722b5fae6a4b4.gif'
    };
    
    document.getElementById('game-screen').appendChild(this.characterDanceElement);
    
    // Add gun sprite and sound
    this.gunSprite = new Image();
    this.gunSprite.src = '/Item_Glock-sharedassets4.assets-616.webp';
    this.gunSound = new Audio('/gunshoot.mp3');
    this.pipeSound = new Audio('/metal pipe.wav');
    this.gunSound.volume = 0.3;
    this.pipeSound.volume = 0.3;
    
    // Add gun duration timer
    this.gunTimeLeft = 0;
    
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
  }
  
  getCharacterSprite(character) {
    const sprites = {
      'Steve': '/the REAL REAL STEVE.jpg',
      'Among Us': '/an871k4o1sn51 (1).png',
      'Roblox Noob': '/OIP (1).jfif',
      'Mario': '/smb1 mario idle.webp'
    };
    return sprites[character];
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  start() {
    this.backgroundMusic.pause();
    this.battleMusic.volume = 0.3;
    this.battleMusic.play();
    this.gameLoop();
    this.spawnGunPickup();
    setInterval(() => this.summonFloppas(), 3000);
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
  
  summonFloppas() {
    if (this.floppas.length < 3) {
      this.patrick.isSmug = true;
      setTimeout(() => this.patrick.isSmug = false, 1000);
      
      const newFloppa = {
        x: this.patrick.x,
        y: this.patrick.y,
        width: 60,  
        height: 60, 
        speed: 3,
        health: 50,
        sprite: new Image()
      };
      newFloppa.sprite.src = '/floppa_png-removebg-preview.png';
      this.floppas.push(newFloppa);
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
        sprite: new Image()
      };
      
      if (this.player.hasGun) {
        if (this.selectedCharacter === 'Mario') {
          this.pipeSound.currentTime = 0;
          this.pipeSound.play();
        } else {
          this.gunSound.currentTime = 0;
          this.gunSound.play();
        }
      }
      
      projectile.sprite.src = this.weaponSprites[this.selectedCharacter];
      
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
        this.projectiles.splice(index, 1);
      }
      
      this.floppas.forEach((floppa, floppaIndex) => {
        if (this.checkCollision(projectile, floppa)) {
          floppa.health -= projectile.damage;
          this.projectiles.splice(index, 1);
          if (floppa.health <= 0) {
            this.floppas.splice(floppaIndex, 1);
          }
        }
      });
    });

    this.projectiles = this.projectiles.filter(projectile => 
      projectile.x >= 0 && projectile.x <= this.canvas.width &&
      projectile.y >= 0 && projectile.y <= this.canvas.height
    );
    
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
  }
  
  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const background = new Image();
    background.src = '/Garden vs Deads 2 (pvz ripoff).jpg';
    this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
    
    // Only draw player if game is still active
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
  }

  gameOver(playerWon) {
    this.gameActive = false;
    
    if (playerWon) {
      // Show character victory dance above and to the left of game over text
      this.characterDanceElement.innerHTML = `<img src="${this.danceGifs[this.selectedCharacter]}" style="width: 250px; height: 250px;">`;
      this.characterDanceElement.style.position = 'absolute';
      this.characterDanceElement.style.left = '30%';  
      this.characterDanceElement.style.top = '40%'; 
      this.characterDanceElement.style.transform = 'translate(-50%, -50%)';
      this.characterDanceElement.style.display = 'block';
      this.characterDanceElement.style.zIndex = '1001'; 
    } else {
      // Show Patrick's victory dance above and to the right of game over text
      this.patrick.isDancing = true;
      this.patrickDanceElement.style.position = 'absolute';
      this.patrickDanceElement.style.left = '70%';  
      this.patrickDanceElement.style.top = '40%'; 
      this.patrickDanceElement.style.transform = 'translate(-50%, -50%)';
      this.patrickDanceElement.style.display = 'block';
      this.patrickDanceElement.style.zIndex = '1001'; 
    }
    
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverTitle = document.getElementById('game-over-title');
    gameOverTitle.textContent = playerWon ? 'You Won!' : 'Patrick Wins!';
    gameOverScreen.classList.remove('hidden');
    
    document.getElementById('return-to-select').onclick = () => {
      location.reload();
    };
  }

  gameLoop() {
    if (this.gameActive) {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}