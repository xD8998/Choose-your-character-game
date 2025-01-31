import { GameEngine } from './gameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    const characterCards = document.querySelectorAll('.character-card');
    const startGameButton1 = document.getElementById('start-game-level1');
    const startGameButton2 = document.getElementById('start-game-level2');
    const backgroundMusic = document.getElementById('background-music');
    const characterDetails = document.getElementById('character-details');

    // Check if level 2 is unlocked immediately on page load
    const level2Unlocked = localStorage.getItem('level2Unlocked') === 'true';
    if (level2Unlocked) {
        document.getElementById('level1-brief').classList.add('hidden');
        document.getElementById('level2-brief').classList.remove('hidden');
    }

    // Start background music when page loads
    backgroundMusic.volume = 0.3;
    backgroundMusic.play().catch(e => console.log('Autoplay prevented', e));

    let selectedCharacter = null;
    let gameEngine = null;

    characterCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from all cards
            characterCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            card.classList.add('selected');
            selectedCharacter = card.dataset.character;

            // Show mission brief and check which level to show
            document.querySelector('.mission-brief').classList.remove('hidden');
            const level2Unlocked = localStorage.getItem('level2Unlocked') === 'true';
            if (level2Unlocked) {
                document.getElementById('level1-brief').classList.add('hidden');
                document.getElementById('level2-brief').classList.remove('hidden');
            }
            
            // Create temporary GameEngine instance to access character details
            const tempEngine = new GameEngine(selectedCharacter);
            tempEngine.updateCharacterDetails();
            characterDetails.classList.remove('hidden');
        });
    });

    // Check if Chill Guy is unlocked
    const chillGuyCard = document.querySelector('.character-card[data-character="Chill Guy"]');
    if (localStorage.getItem('chillGuyUnlocked') === 'true') {
        chillGuyCard.style.display = 'block';
    }

    // Function to get character description
    const getCharacterDescription = (character) => {
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
    };

    // Function to start game with selected level
    const startGame = (level) => {
        if (selectedCharacter) {
            backgroundMusic.pause();
            const characterSelectScreen = document.getElementById('character-select-screen');
            const gameScreen = document.getElementById('game-screen');
            
            characterSelectScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            characterDetails.classList.add('hidden');  // Hide details panel when game starts
            
            localStorage.setItem('selectedLevel', level);
            gameEngine = new GameEngine(selectedCharacter, level);
            gameEngine.start();
        } else {
            alert('Please select a character first!');
        }
    };

    startGameButton1.addEventListener('click', () => startGame(1));
    startGameButton2.addEventListener('click', () => startGame(2));

    // When player returns to character select, check level 2 unlock status
    document.getElementById('return-to-select').addEventListener('click', () => {
        const level2Unlocked = localStorage.getItem('level2Unlocked') === 'true';
        if (level2Unlocked) {
            document.getElementById('level1-brief').classList.add('hidden');
            document.getElementById('level2-brief').classList.remove('hidden');
        }
    });

    // Check if repository is unlocked and create button immediately
    const repositoryUnlocked = localStorage.getItem('repositoryUnlocked') === 'true';
    if (repositoryUnlocked) {
        // Create repository button and add to character select screen
        const repositoryButton = document.createElement('button');
        repositoryButton.id = 'repository-button';
        repositoryButton.textContent = 'View Enemy & Power-up Repository';
        repositoryButton.className = 'repository-button visible'; 
        document.getElementById('character-select-screen').appendChild(repositoryButton);

        // Repository functionality
        const repositoryScreen = document.getElementById('repository-screen');
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        repositoryButton.addEventListener('click', () => {
            document.getElementById('character-select-screen').classList.add('hidden');
            repositoryScreen.classList.remove('hidden');
        });

        document.getElementById('return-to-menu').addEventListener('click', () => {
            repositoryScreen.classList.add('hidden');
            document.getElementById('character-select-screen').classList.remove('hidden');
        });

        // Tab switching functionality
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    // Update repository content visibility when game loads
    function updateRepositoryContent() {
      const level2Content = document.querySelectorAll('.level2-content');
      const isUnlocked = localStorage.getItem('level2ContentUnlocked') === 'true';
      level2Content.forEach(element => {
        element.style.display = isUnlocked ? 'flex' : 'none';
      });
    }
    
    updateRepositoryContent();

    // Track mouse position for projectile direction
    window.addEventListener('mousemove', (e) => {
        if (gameEngine) {
            const rect = gameEngine.canvas.getBoundingClientRect();
            gameEngine.lastMouseX = e.clientX - rect.left;
            gameEngine.lastMouseY = e.clientY - rect.top;
        }
    });
});