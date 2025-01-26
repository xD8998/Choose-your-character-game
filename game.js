import { GameEngine } from './gameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    const characterCards = document.querySelectorAll('.character-card');
    const startGameButton = document.getElementById('start-game');
    const backgroundMusic = document.getElementById('background-music');

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

            // Show mission brief
            document.querySelector('.mission-brief').classList.remove('hidden');
        });
    });

    startGameButton.addEventListener('click', () => {
        if (selectedCharacter) {
            backgroundMusic.pause();
            const characterSelectScreen = document.getElementById('character-select-screen');
            const gameScreen = document.getElementById('game-screen');
            
            characterSelectScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            
            gameEngine = new GameEngine(selectedCharacter);
            gameEngine.start();
        } else {
            alert('Please select a character first!');
        }
    });

    // Track mouse position for projectile direction
    window.addEventListener('mousemove', (e) => {
        if (gameEngine) {
            const rect = gameEngine.canvas.getBoundingClientRect();
            gameEngine.lastMouseX = e.clientX - rect.left;
            gameEngine.lastMouseY = e.clientY - rect.top;
        }
    });
});