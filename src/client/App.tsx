import { useState, useCallback } from 'react';
import { Devvit, Context, useState as useAsync } from '@devvit/public-api';

// Expanded meme database with difficulty levels
const REDDIT_MEME_SUBREDDITS = {
  easy: ['memes', 'wholesomememes', 'dankmemes'],
  medium: ['PrequelMemes', 'HistoryMemes', 'ProgrammerHumor'],
  hard: ['surrealmemes', 'deepfriedmemes', 'nukedmemes']
};

const CLASSIC_MEMES = {
  easy: [
    {
      id: 1,
      imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
      correctAnswer: 'Drake Pointing',
      options: ['Drake Pointing', 'Expanding Brain', 'Distracted Boyfriend', 'Woman Yelling at Cat'],
      difficulty: 'easy',
      description: 'Drake approves and disapproves'
    },
    {
      id: 2,
      imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
      correctAnswer: 'Distracted Boyfriend',
      options: ['Distracted Boyfriend', 'Drake Pointing', 'Hide the Pain Harold', 'This is Fine'],
      difficulty: 'easy',
      description: 'Man looking at another woman while girlfriend looks upset'
    },
    {
      id: 3,
      imageUrl: 'https://i.imgflip.com/345v97.jpg',
      correctAnswer: 'Woman Yelling at Cat',
      options: ['Woman Yelling at Cat', 'Surprised Pikachu', 'Galaxy Brain', 'Stonks'],
      difficulty: 'easy',
      description: 'Woman pointing and yelling at confused white cat'
    },
    {
      id: 4,
      imageUrl: 'https://i.imgflip.com/26am.jpg',
      correctAnswer: 'This is Fine',
      options: ['This is Fine', 'Doge', 'Pepe the Frog', 'Trollface'],
      difficulty: 'easy',
      description: 'Dog sitting in burning room saying everything is fine'
    },
    {
      id: 5,
      imageUrl: 'https://i.imgflip.com/1otk96.jpg',
      correctAnswer: 'Surprised Pikachu',
      options: ['Surprised Pikachu', 'Stonks', 'Big Brain Time', 'Panik Kalm'],
      difficulty: 'easy',
      description: 'Pikachu with shocked expression'
    }
  ],
  medium: [
    {
      id: 6,
      imageUrl: 'https://i.imgflip.com/2zo1ki.jpg',
      correctAnswer: 'Galaxy Brain',
      options: ['Galaxy Brain', 'Expanding Brain', 'Big Brain Time', 'Stonks'],
      difficulty: 'medium',
      description: 'Brain expanding through multiple stages'
    },
    {
      id: 7,
      imageUrl: 'https://i.imgflip.com/2/30cz.jpg',
      correctAnswer: 'Hide the Pain Harold',
      options: ['Hide the Pain Harold', 'Uncomfortable Situations Seal', 'Good Guy Greg', 'Scumbag Steve'],
      difficulty: 'medium',
      description: 'Older man with forced smile hiding discomfort'
    },
    {
      id: 8,
      imageUrl: 'https://i.imgflip.com/39u469.jpg',
      correctAnswer: 'Stonks',
      options: ['Stonks', 'Big Brain Time', 'Panik Kalm', 'Number Go Up'],
      difficulty: 'medium',
      description: 'Meme man in suit with rising graph'
    },
    {
      id: 9,
      imageUrl: 'https://i.imgflip.com/3lmzyx.jpg',
      correctAnswer: 'Panik Kalm Panik',
      options: ['Panik Kalm Panik', 'Stonks', 'Big Brain Time', 'Galaxy Brain'],
      difficulty: 'medium',
      description: 'Meme man showing panic, calm, then panic again'
    }
  ],
  hard: [
    {
      id: 10,
      imageUrl: 'https://i.imgflip.com/4/2cp1.jpg',
      correctAnswer: 'Doge',
      options: ['Doge', 'Cheems', 'Bonk Dog', 'Crying Wojak'],
      difficulty: 'hard',
      description: 'Shiba Inu with comic sans text - much wow'
    },
    {
      id: 11,
      imageUrl: 'https://i.imgflip.com/5c7lwq.jpg',
      correctAnswer: 'Chad Yes',
      options: ['Chad Yes', 'Wojak', 'Pepe', 'Trollface'],
      difficulty: 'hard',
      description: 'Muscular blonde man saying yes'
    }
  ]
};

interface GameState {
  currentMemeIndex: number;
  score: number;
  gameStarted: boolean;
  showAnswer: boolean;
  selectedAnswer: string | null;
  gameComplete: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'classic' | 'daily' | 'reddit' | 'community';
  streak: number;
  totalGames: number;
  bestScore: number;
  dailyCompleted: boolean;
  currentMemes: any[];
  username: string;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  difficulty: string;
  timestamp: number;
  streak: number;
}

const App = (context: Context) => {
  const [gameState] = useAsync<GameState>(async () => {
    try {
      const user = await context.reddit.getCurrentUser();
      const saved = await context.redis.get(`gameState_${user?.username || 'anonymous'}`);
      
      if (saved) {
        const state = JSON.parse(saved);
        // Check if daily challenge was completed today
        const today = new Date().toDateString();
        const dailyCheck = await context.redis.get(`daily_${user?.username || 'anonymous'}_${today}`);
        state.dailyCompleted = !!dailyCheck;
        return state;
      }
    } catch (error) {
      console.log('Loading fresh game state');
    }
    
    return {
      currentMemeIndex: 0,
      score: 0,
      gameStarted: false,
      showAnswer: false,
      selectedAnswer: null,
      gameComplete: false,
      difficulty: 'easy',
      gameMode: 'classic',
      streak: 0,
      totalGames: 0,
      bestScore: 0,
      dailyCompleted: false,
      currentMemes: [],
      username: 'anonymous'
    };
  });

  // Fetch memes from Reddit API
  const fetchRedditMemes = async (difficulty: string) => {
    try {
      const subreddit = REDDIT_MEME_SUBREDDITS[difficulty][Math.floor(Math.random() * REDDIT_MEME_SUBREDDITS[difficulty].length)];
      const posts = await context.reddit.getSubredditPosts({
        subredditName: subreddit,
        limit: 10,
        sort: 'hot'
      }).all();

      const memePosts = posts
        .filter(post => post.url && (post.url.includes('.jpg') || post.url.includes('.png') || post.url.includes('.gif')))
        .slice(0, 5)
        .map((post, index) => ({
          id: `reddit_${index}`,
          imageUrl: post.url,
          correctAnswer: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
          options: generateOptions(post.title, posts),
          difficulty: difficulty,
          description: `From r/${subreddit}`,
          subreddit: subreddit,
          redditPost: true
        }));

      return memePosts;
    } catch (error) {
      console.error('Failed to fetch Reddit memes:', error);
      return CLASSIC_MEMES[difficulty] || CLASSIC_MEMES.easy;
    }
  };

  const generateOptions = (correctTitle: string, allPosts: any[]) => {
    const options = [correctTitle.length > 30 ? correctTitle.substring(0, 30) + '...' : correctTitle];
    const otherTitles = allPosts
      .filter(p => p.title !== correctTitle)
      .map(p => p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title)
      .slice(0, 3);
    
    return [...options, ...otherTitles].slice(0, 4);
  };

  const saveGameState = async (newState: GameState) => {
    try {
      const user = await context.reddit.getCurrentUser();
      await context.redis.set(`gameState_${user?.username || 'anonymous'}`, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  const updateLeaderboard = async (score: number, difficulty: string) => {
    try {
      const user = await context.reddit.getCurrentUser();
      const username = user?.username || 'anonymous';
      
      const entry: LeaderboardEntry = {
        username,
        score,
        difficulty,
        timestamp: Date.now(),
        streak: gameState?.streak || 0
      };

      const leaderboardKey = `leaderboard_${difficulty}`;
      const currentLeaderboard = await context.redis.get(leaderboardKey);
      let leaderboard: LeaderboardEntry[] = currentLeaderboard ? JSON.parse(currentLeaderboard) : [];
      
      leaderboard.push(entry);
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard = leaderboard.slice(0, 10); // Keep top 10

      await context.redis.set(leaderboardKey, JSON.stringify(leaderboard));
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
    }
  };

  const startGame = useCallback(async (difficulty: string, mode: string) => {
    let memes = [];
    
    if (mode === 'reddit') {
      memes = await fetchRedditMemes(difficulty);
    } else if (mode === 'daily') {
      // Use a seed based on current date for consistent daily challenges
      const today = new Date().toDateString();
      const seed = today.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      Math.seedrandom = seed; // Pseudo-random based on date
      memes = [...CLASSIC_MEMES.easy, ...CLASSIC_MEMES.medium].sort(() => Math.random() - 0.5).slice(0, 5);
    } else {
      memes = CLASSIC_MEMES[difficulty] || CLASSIC_MEMES.easy;
    }

    const user = await context.reddit.getCurrentUser();
    const newState = {
      currentMemeIndex: 0,
      score: 0,
      gameStarted: true,
      showAnswer: false,
      selectedAnswer: null,
      gameComplete: false,
      difficulty: difficulty,
      gameMode: mode,
      streak: gameState?.streak || 0,
      totalGames: (gameState?.totalGames || 0) + 1,
      bestScore: gameState?.bestScore || 0,
      dailyCompleted: gameState?.dailyCompleted || false,
      currentMemes: memes,
      username: user?.username || 'anonymous'
    };
    
    await saveGameState(newState);
    return newState;
  }, [gameState]);

  const selectAnswer = useCallback(async (answer: string, currentState: GameState) => {
    const currentMeme = currentState.currentMemes[currentState.currentMemeIndex];
    const isCorrect = answer === currentMeme.correctAnswer;
    
    const newState = {
      ...currentState,
      selectedAnswer: answer,
      showAnswer: true,
      score: isCorrect ? currentState.score + 1 : currentState.score,
      streak: isCorrect ? currentState.streak + 1 : 0
    };
    
    await saveGameState(newState);
    return newState;
  }, []);

  const nextMeme = useCallback(async (currentState: GameState) => {
    const nextIndex = currentState.currentMemeIndex + 1;
    const isGameComplete = nextIndex >= currentState.currentMemes.length;
    
    const newState = {
      ...currentState,
      currentMemeIndex: nextIndex,
      showAnswer: false,
      selectedAnswer: null,
      gameComplete: isGameComplete,
      bestScore: isGameComplete && currentState.score > currentState.bestScore ? 
        currentState.score : currentState.bestScore
    };
    
    if (isGameComplete) {
      await updateLeaderboard(currentState.score, currentState.difficulty);
      
      // Mark daily challenge as completed
      if (currentState.gameMode === 'daily') {
        const today = new Date().toDateString();
        await context.redis.set(`daily_${currentState.username}_${today}`, 'completed');
        newState.dailyCompleted = true;
      }
    }
    
    await saveGameState(newState);
    return newState;
  }, []);

  const resetGame = useCallback(async () => {
    const user = await context.reddit.getCurrentUser();
    const newState = {
      currentMemeIndex: 0,
      score: 0,
      gameStarted: false,
      showAnswer: false,
      selectedAnswer: null,
      gameComplete: false,
      difficulty: 'easy',
      gameMode: 'classic',
      streak: gameState?.streak || 0,
      totalGames: gameState?.totalGames || 0,
      bestScore: gameState?.bestScore || 0,
      dailyCompleted: gameState?.dailyCompleted || false,
      currentMemes: [],
      username: user?.username || 'anonymous'
    };
    await saveGameState(newState);
    return newState;
  }, [gameState]);

  const getLeaderboard = useCallback(async (difficulty: string) => {
    try {
      const leaderboardData = await context.redis.get(`leaderboard_${difficulty}`);
      return leaderboardData ? JSON.parse(leaderboardData) : [];
    } catch (error) {
      return [];
    }
  }, []);

  if (!gameState) {
    return (
      <vstack alignment="center middle" height="100%" backgroundColor="#0f0f23">
        <text size="large" color="#00ff88">Loading Reddit Memes...</text>
      </vstack>
    );
  }

  // Leaderboard Screen
  if (gameState.gameComplete) {
    const percentage = Math.round((gameState.score / gameState.currentMemes.length) * 100);
    let message = "Try again! 🎯";
    let emoji = "📈";
    if (percentage === 100) { message = "PERFECT SCORE! 🏆"; emoji = "👑"; }
    else if (percentage >= 80) { message = "Meme Master! 🎉"; emoji = "🚀"; }
    else if (percentage >= 60) { message = "Pretty Good! 👍"; emoji = "⭐"; }
    else if (percentage >= 40) { message = "Not Bad! 😊"; emoji = "👌"; }

    return (
      <vstack alignment="center" height="100%" backgroundColor="#0f0f23" gap="medium" padding="medium">
        <text size="xxlarge" color="#ffd700" weight="bold">{emoji} Game Complete! {emoji}</text>
        
        <vstack alignment="center" backgroundColor="#1a1a2e" cornerRadius="large" padding="large" gap="medium">
          <text size="xlarge" color="white">Score: {gameState.score}/{gameState.currentMemes.length}</text>
          <text size="large" color="#00ff88">{message}</text>
          <text size="medium" color="#888">Accuracy: {percentage}%</text>
          {gameState.streak > 0 && (
            <text size="medium" color="#ff6b35">🔥 Current Streak: {gameState.streak}</text>
          )}
          <text size="small" color="#666">Total Games: {gameState.totalGames}</text>
          <text size="small" color="#666">Best Score: {gameState.bestScore}</text>
        </vstack>

        <vstack gap="small" width="100%">
          <button appearance="primary" onPress={resetGame} size="large">
            🎮 Play Again
          </button>
          
          <hstack gap="small" width="100%">
            <button appearance="secondary" onPress={() => startGame('easy', 'classic')} size="medium">
              😊 Easy Mode
            </button>
            <button appearance="secondary" onPress={() => startGame('medium', 'classic')} size="medium">
              😐 Medium Mode  
            </button>
            <button appearance="secondary" onPress={() => startGame('hard', 'classic')} size="medium">
              😈 Hard Mode
            </button>
          </hstack>

          <hstack gap="small" width="100%">
            <button appearance="success" onPress={() => startGame(gameState.difficulty, 'reddit')} size="medium">
              📱 Live Reddit Memes
            </button>
            {!gameState.dailyCompleted && (
              <button appearance="primary" onPress={() => startGame('medium', 'daily')} size="medium">
                📅 Daily Challenge
              </button>
            )}
          </hstack>
        </vstack>

        <vstack alignment="center" gap="small">
          <text size="small" color="#888">🏆 Share your score with the community!</text>
          <text size="small" color="#666">Difficulty: {gameState.difficulty.toUpperCase()} | Mode: {gameState.gameMode.toUpperCase()}</text>
        </vstack>
      </vstack>
    );
  }

  // Start Screen with Game Modes
  if (!gameState.gameStarted) {
    const today = new Date().toLocaleDateString();
    
    return (
      <vstack alignment="center" height="100%" backgroundColor="#0f0f23" gap="medium" padding="medium">
        <text size="xxlarge" color="#ffd700" weight="bold">🎯 Reddit Meme Master 🎯</text>
        <text size="large" color="white">Test your meme knowledge!</text>
        
        {/* Stats */}
        <vstack alignment="center" backgroundColor="#1a1a2e" cornerRadius="medium" padding="medium" gap="small">
          <text size="medium" color="#00ff88" weight="bold">📊 Your Stats</text>
          <text size="small" color="white">Games Played: {gameState.totalGames}</text>
          <text size="small" color="white">Best Score: {gameState.bestScore}</text>
          <text size="small" color="white">Current Streak: 🔥 {gameState.streak}</text>
          {gameState.dailyCompleted && (
            <text size="small" color="#ffd700">✅ Daily Challenge Complete!</text>
          )}
        </vstack>
        
        {/* Classic Mode */}
        <vstack alignment="center" backgroundColor="#2d2d44" cornerRadius="large" padding="large" gap="medium" width="100%">
          <text size="large" color="#00ff88" weight="bold">🎮 Classic Mode</text>
          <text size="small" color="white" alignment="center">Guess famous internet memes by their images</text>
          
          <hstack gap="small" width="100%">
            <button appearance="success" onPress={() => startGame('easy', 'classic')} size="medium">
              😊 Easy (5 memes)
            </button>
            <button appearance="secondary" onPress={() => startGame('medium', 'classic')} size="medium">
              😐 Medium 
            </button>
            <button appearance="destructive" onPress={() => startGame('hard', 'classic')} size="medium">
              😈 Hard
            </button>
          </hstack>
        </vstack>

        {/* Live Reddit Mode */}
        <vstack alignment="center" backgroundColor="#ff4500" cornerRadius="large" padding="large" gap="medium" width="100%">
          <text size="large" color="white" weight="bold">📱 Live Reddit Mode</text>
          <text size="small" color="white" alignment="center">Fresh memes from hot Reddit posts right now!</text>
          
          <hstack gap="small" width="100%">
            <button appearance="primary" onPress={() => startGame('easy', 'reddit')} size="medium">
              🔥 r/memes
            </button>
            <button appearance="primary" onPress={() => startGame('medium', 'reddit')} size="medium">
              🚀 Random Hot
            </button>
          </hstack>
        </vstack>

        {/* Daily Challenge */}
        {!gameState.dailyCompleted && (
          <vstack alignment="center" backgroundColor="#6a5acd" cornerRadius="large" padding="large" gap="medium" width="100%">
            <text size="large" color="white" weight="bold">📅 Daily Challenge</text>
            <text size="small" color="white" alignment="center">Special curated memes - one chance per day!</text>
            <text size="small" color="#ffd700">{today}</text>
            
            <button appearance="primary" onPress={() => startGame('medium', 'daily')} size="large">
              🏆 Take Challenge
            </button>
          </vstack>
        )}

        <text size="small" color="#666">Choose your challenge, Redditor! 🍀</text>
      </vstack>
    );
  }

  // Game Screen
  const currentMeme = gameState.currentMemes[gameState.currentMemeIndex];
  const progress = ((gameState.currentMemeIndex + 1) / gameState.currentMemes.length) * 100;
  
  if (!currentMeme) {
    return (
      <vstack alignment="center middle" height="100%" backgroundColor="#0f0f23">
        <text size="large" color="#ff6b6b">Failed to load meme. Please try again.</text>
        <button appearance="primary" onPress={resetGame}>Go Back</button>
      </vstack>
    );
  }

  return (
    <vstack height="100%" backgroundColor="#0f0f23" gap="small" padding="medium">
      {/* Enhanced Header */}
      <vstack gap="small" width="100%">
        <hstack alignment="space-between" width="100%">
          <text size="medium" color="#ffd700" weight="bold">💯 {gameState.score} pts</text>
          <text size="medium" color="white">{gameState.currentMemeIndex + 1}/{gameState.currentMemes.length}</text>
          <text size="small" color="#00ff88">🔥 {gameState.streak}</text>
        </hstack>
        
        <hstack alignment="space-between" width="100%">
          <text size="small" color="#888">{gameState.difficulty.toUpperCase()} • {gameState.gameMode.toUpperCase()}</text>
          {currentMeme.subreddit && (
            <text size="small" color="#ff4500">r/{currentMeme.subreddit}</text>
          )}
        </hstack>
        
        {/* Enhanced Progress Bar */}
        <hstack width="100%" height="12px" backgroundColor="#2d2d44" cornerRadius="medium">
          <hstack width={`${progress}%`} height="100%" backgroundColor="#00ff88" cornerRadius="medium" />
        </hstack>
      </vstack>

      {/* Meme Display */}
      <vstack alignment="center" backgroundColor="#1a1a2e" cornerRadius="large" padding="large" grow gap="medium">
        <image
          url={currentMeme.imageUrl}
          imageHeight={250}
          imageWidth={350}
          description={currentMeme.description}
          resizeMode="fit"
        />
        
        <vstack alignment="center" gap="small">
          <text size="large" color="white" weight="bold" alignment="center">
            {currentMeme.redditPost ? "What's this Reddit post titled?" : "What meme is this?"}
          </text>
          {currentMeme.description && (
            <text size="small" color="#888" alignment="center">{currentMeme.description}</text>
          )}
        </vstack>
      </vstack>

      {/* Answer Options */}
      <vstack gap="small" width="100%">
        {currentMeme.options.map((option, index) => {
          let buttonColor = "secondary";
          
          if (gameState.showAnswer) {
            if (option === currentMeme.correctAnswer) {
              buttonColor = "success";
            } else if (option === gameState.selectedAnswer && option !== currentMeme.correctAnswer) {
              buttonColor = "destructive";
            }
          }

          return (
            <button
              key={index}
              appearance={buttonColor}
              onPress={gameState.showAnswer ? undefined : () => selectAnswer(option, gameState)}
              disabled={gameState.showAnswer}
              size="medium"
            >
              {option}
            </button>
          );
        })}
      </vstack>

      {/* Enhanced Answer Feedback */}
      {gameState.showAnswer && (
        <vstack alignment="center" gap="medium" backgroundColor="#2d2d44" cornerRadius="large" padding="medium">
          <text size="xlarge" color={gameState.selectedAnswer === currentMeme.correctAnswer ? "#00ff88" : "#ff6b6b"} weight="bold">
            {gameState.selectedAnswer === currentMeme.correctAnswer ? "🎉 CORRECT!" : "❌ Not quite!"}
          </text>
          
          <vstack alignment="center" gap="small">
            <text size="medium" color="white" alignment="center">
              Answer: <text color="#ffd700" weight="bold">{currentMeme.correctAnswer}</text>
            </text>
            {gameState.selectedAnswer === currentMeme.correctAnswer && gameState.streak > 1 && (
              <text size="small" color="#ff6b35">🔥 Streak: {gameState.streak}!</text>
            )}
          </vstack>
          
          {gameState.currentMemeIndex < gameState.currentMemes.length - 1 ? (
            <button appearance="primary" onPress={() => nextMeme(gameState)} size="large">
              Next Meme 🚀
            </button>
          ) : (
            <button appearance="success" onPress={() => nextMeme(gameState)} size="large">
              See Results 🏆
            </button>
          )}
        </vstack>
      )}
    </vstack>
  );
};

export default App;