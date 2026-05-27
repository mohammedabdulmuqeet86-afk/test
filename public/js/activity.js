

document.addEventListener('DOMContentLoaded', function () {
  // Game configuration
  var TOTAL_TILES = 16;
  var TOTAL_ROUNDS = 5;
  var MAX_SCORE_PER_ROUND = 100;
  var CHOICES_COUNT = 4;

  // DOM elements
  var startBtn = document.getElementById('start-game');
  var gameIntro = document.getElementById('game-intro');
  var gameArea = document.getElementById('game-area');
  var gameOver = document.getElementById('game-over');
  var gameGrid = document.getElementById('game-grid');
  var hiddenImage = document.getElementById('game-hidden-image');
  var choicesGrid = document.getElementById('choices-grid');
  var gameResult = document.getElementById('game-result');
  var gameResultContent = document.getElementById('game-result-content');
  var nextRoundBtn = document.getElementById('next-round');
  var restartBtn = document.getElementById('restart-game');
  var playAgainBtn = document.getElementById('play-again');

  // Stat displays
  var tilesRevealedDisplay = document.getElementById('tiles-revealed');
  var currentScoreDisplay = document.getElementById('current-score');
  var bestScoreDisplay = document.getElementById('best-score');
  var currentRoundDisplay = document.getElementById('current-round');
  var finalScoreDisplay = document.getElementById('final-score');
  var finalBestScoreDisplay = document.getElementById('final-best-score');
  var correctAnswersDisplay = document.getElementById('correct-answers');
  var gameOverMessage = document.getElementById('game-over-message');

  // Game state
  var animals = window.animalData || [];
  var currentRound = 0;
  var totalScore = 0;
  var tilesRevealed = 0;
  var correctCount = 0;
  var roundAnswered = false;
  var currentAnimal = null;
  var gameAnimals = [];
  var bestScore = parseInt(localStorage.getItem('wildhaven_best_score')) || 0;

  // Initialise best score display
  bestScoreDisplay.textContent = bestScore > 0 ? bestScore : '-';

  if (!startBtn || animals.length < CHOICES_COUNT) return;

  // ── Start Game ──
  startBtn.addEventListener('click', function () {
    startGame();
  });

  // ── Next Round ──
  nextRoundBtn.addEventListener('click', function () {
    nextRound();
  });

  // ── Restart / Play Again ──
  restartBtn.addEventListener('click', function () {
    startGame();
  });

  playAgainBtn.addEventListener('click', function () {
    startGame();
  });

  function startGame() {
    // Reset state
    currentRound = 0;
    totalScore = 0;
    correctCount = 0;

    // Select animals for this game
    gameAnimals = shuffleArray(animals.slice()).slice(0, TOTAL_ROUNDS);

    // If we don't have enough unique animals, repeat some
    while (gameAnimals.length < TOTAL_ROUNDS) {
      gameAnimals.push(animals[Math.floor(Math.random() * animals.length)]);
    }

    // Show game area
    gameIntro.style.display = 'none';
    gameOver.style.display = 'none';
    gameArea.style.display = 'block';

    nextRound();
  }

  function nextRound() {
    if (currentRound >= TOTAL_ROUNDS) {
      endGame();
      return;
    }

    // Reset round state
    tilesRevealed = 0;
    roundAnswered = false;
    currentAnimal = gameAnimals[currentRound];
    currentRound++;

    // Update displays
    currentRoundDisplay.textContent = currentRound;
    tilesRevealedDisplay.textContent = '0';
    currentScoreDisplay.textContent = MAX_SCORE_PER_ROUND;
    gameResult.style.display = 'none';
    nextRoundBtn.style.display = 'none';
    restartBtn.style.display = 'none';

    // Set hidden image
    hiddenImage.src = currentAnimal.image;
    hiddenImage.alt = 'Hidden animal to guess';

    // Build tile grid
    buildGrid();

    // Build choices
    buildChoices();
  }

  function buildGrid() {
    gameGrid.innerHTML = '';

    // Create emoji tiles for visual interest
    var tileEmojis = ['🌿', '🍃', '🌲', '🦋', '🌺', '🐾', '🌳', '🍂',
                      '🦜', '🌸', '🐛', '🌻', '🦎', '🌴', '🐝', '🪵'];

    for (var i = 0; i < TOTAL_TILES; i++) {
      var tile = document.createElement('div');
      tile.className = 'game-tile';
      tile.textContent = tileEmojis[i % tileEmojis.length];
      tile.setAttribute('data-index', i);
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', 'Reveal tile ' + (i + 1));
      tile.setAttribute('tabindex', '0');

      tile.addEventListener('click', handleTileClick);
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTileClick.call(this);
        }
      });

      gameGrid.appendChild(tile);
    }
  }

  function handleTileClick() {
    if (this.classList.contains('game-tile--revealed') || roundAnswered) return;

    // Reveal tile
    this.classList.add('game-tile--revealed');
    this.textContent = '';
    tilesRevealed++;

    // Update displays
    tilesRevealedDisplay.textContent = tilesRevealed;
    var roundScore = calculateRoundScore();
    currentScoreDisplay.textContent = roundScore;
  }

  function calculateRoundScore() {
    // Fewer tiles revealed = higher score
    // Max 100 if you guess after 1 tile, min 10 if all tiles revealed
    var score = Math.max(10, Math.round(MAX_SCORE_PER_ROUND * (1 - (tilesRevealed - 1) / (TOTAL_TILES - 1))));
    return score;
  }

  function buildChoices() {
    choicesGrid.innerHTML = '';

    // Get wrong answers (other animals)
    var otherAnimals = animals.filter(function (a) {
      return a.name !== currentAnimal.name;
    });

    var wrongChoices = shuffleArray(otherAnimals).slice(0, CHOICES_COUNT - 1);
    var allChoices = shuffleArray([currentAnimal].concat(wrongChoices));

    allChoices.forEach(function (animal) {
      var btn = document.createElement('button');
      btn.className = 'game-choice-btn';
      btn.textContent = animal.name;
      btn.setAttribute('data-name', animal.name);

      btn.addEventListener('click', function () {
        handleAnswer(this, animal);
      });

      choicesGrid.appendChild(btn);
    });
  }

  function handleAnswer(button, selectedAnimal) {
    if (roundAnswered) return;
    roundAnswered = true;

    // Disable all choice buttons
    var allBtns = choicesGrid.querySelectorAll('.game-choice-btn');
    allBtns.forEach(function (b) {
      b.classList.add('game-choice-btn--disabled');
    });

    // Reveal all remaining tiles
    gameGrid.querySelectorAll('.game-tile:not(.game-tile--revealed)').forEach(function (tile) {
      tile.classList.add('game-tile--revealed');
      tile.textContent = '';
    });

    var isCorrect = selectedAnimal.name === currentAnimal.name;

    if (isCorrect) {
      button.classList.add('game-choice-btn--correct');
      var roundScore = calculateRoundScore();
      totalScore += roundScore;
      correctCount++;

      gameResultContent.className = 'game-result__content game-result--correct';
      gameResultContent.innerHTML = '✅ Correct! That is a <strong>' + currentAnimal.name + '</strong> (' + currentAnimal.species + '). You earned <strong>' + roundScore + ' points</strong>!';
    } else {
      button.classList.add('game-choice-btn--wrong');
      // Highlight correct answer
      allBtns.forEach(function (b) {
        if (b.getAttribute('data-name') === currentAnimal.name) {
          b.classList.add('game-choice-btn--correct');
        }
      });

      gameResultContent.className = 'game-result__content game-result--wrong';
      gameResultContent.innerHTML = '❌ Not quite! That was a <strong>' + currentAnimal.name + '</strong> (' + currentAnimal.species + '). No points this round.';
    }

    gameResult.style.display = 'block';

    if (currentRound < TOTAL_ROUNDS) {
      nextRoundBtn.style.display = 'inline-flex';
    } else {
      // Show restart for final round
      setTimeout(function () {
        endGame();
      }, 1500);
    }
  }

  function endGame() {
    gameArea.style.display = 'none';
    gameOver.style.display = 'block';

    // Update best score
    if (totalScore > bestScore) {
      bestScore = totalScore;
      localStorage.setItem('wildhaven_best_score', bestScore);
    }

    finalScoreDisplay.textContent = totalScore;
    finalBestScoreDisplay.textContent = bestScore;
    correctAnswersDisplay.textContent = correctCount + ' / ' + TOTAL_ROUNDS;
    bestScoreDisplay.textContent = bestScore;

    // Set message based on performance
    if (correctCount === TOTAL_ROUNDS) {
      gameOverMessage.textContent = 'Perfect score! You are a true wildlife expert! 🏆';
    } else if (correctCount >= TOTAL_ROUNDS * 0.6) {
      gameOverMessage.textContent = 'Great job! You really know your animals! 🌟';
    } else if (correctCount >= TOTAL_ROUNDS * 0.4) {
      gameOverMessage.textContent = 'Not bad! Keep visiting WildHaven to learn more! 🦁';
    } else {
      gameOverMessage.textContent = 'Keep practising! Visit our habitats to get to know the animals better! 🌿';
    }
  }

  /**
   * Fisher-Yates shuffle
   */
  function shuffleArray(array) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
});
