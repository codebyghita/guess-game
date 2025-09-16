import { Devvit, useState } from '@devvit/public-api';

interface MemeQuestion {
  id: number;
  type: 'meme' | 'word';
  description: string;
  ascii?: string;
  answer: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface GameStats {
  score: number;
  streak: number;
  totalAttempts: number;
  correctAnswers: number;
  hintsUsed: number;
}

const MEME_DATA: MemeQuestion[] = [
  // Easy Memes
  {
    id: 1,
    type: 'meme',
    description: "A dog sitting in a burning room saying everything is fine",
    ascii: "🔥🐕🔥\n'This is fine'",
    answer: "this is fine",
    hint: "A calm response to chaos",
    difficulty: 'easy',
    category: 'Classic Memes'
  },
  {
    id: 2,
    type: 'meme',
    description: "Distracted boyfriend looking at another girl while his girlfriend looks angry",
    ascii: "👩‍🦰😠 👨‍🦱👀 👩‍🦳😏",
    answer: "distracted boyfriend",
    hint: "He's looking away from his partner",
    difficulty: 'easy',
    category: 'Relationship Memes'
  },
  {
    id: 3,
    type: 'word',
    description: "R_DD_T (Popular social platform)",
    answer: "reddit",
    hint: "The platform you're using right now!",
    difficulty: 'easy',
    category: 'Tech Words'
  },
  {
    id: 4,
    type: 'meme',
    description: "Drake rejecting something in the top panel, approving in the bottom",
    ascii: "🚫👎 Drake\n✅👍 Drake",
    answer: "drake pointing",
    hint: "Canadian rapper showing preferences",
    difficulty: 'easy',
    category: 'Music Memes'
  },
  {
    id: 5,
    type: 'word',
    description: "M_M_ (Internet joke or viral content)",
    answer: "meme",
    hint: "What this game is all about!",
    difficulty: 'easy',
    category: 'Internet Terms'
  },
  // Medium Memes
  {
    id: 6,
    type: 'meme',
    description: "Woman yelling at confused white cat at dinner table",
    ascii: "👩😡➡️ 🐱❓\n   🍽️",
    answer: "woman yelling at cat",
    hint: "Dinner table argument with a confused feline",
    difficulty: 'medium',
    category: 'Animal Memes'
  },
  {
    id: 7,
    type: 'meme',
    description: "Ancient alien guy with wild hair suggesting extraterrestrial explanations",
    ascii: "👽🛸\n'Aliens'",
    answer: "ancient aliens",
    hint: "History Channel's favorite explanation",
    difficulty: 'medium',
    category: 'TV Memes'
  },
  {
    id: 8,
    type: 'word',
    description: "UP_OT_ (Reddit approval system)",
    answer: "upvote",
    hint: "Orange arrow pointing up",
    difficulty: 'medium',
    category: 'Reddit Terms'
  },
  {
    id: 9,
    type: 'meme',
    description: "Expanding brain meme showing levels of enlightenment",
    ascii: "🧠 → 🧠✨ → 🧠⚡ → 🧠🌟",
    answer: "expanding brain",
    hint: "Intelligence levels increasing",
    difficulty: 'medium',
    category: 'Intelligence Memes'
  },
  // Hard Memes
  {
    id: 10,
    type: 'meme',
    description: "Kermit drinking tea with 'But that's none of my business' caption",
    ascii: "🐸☕\n'But that's none\nof my business'",
    answer: "kermit tea",
    hint: "Frog with hot beverage making observations",
    difficulty: 'hard',
    category: 'Sass Memes'
  },
  {
    id: 11,
    type: 'word',
    description: "SU_R_DD_T (Specific community within Reddit)",
    answer: "subreddit",
    hint: "r/something - a specific community",
    difficulty: 'hard',
    category: 'Reddit Terms'
  },
  {
    id: 12,
    type: 'meme',
    description: "Success kid with clenched fist celebrating small victories",
    ascii: "👶✊😤\n'Success!'",
    answer: "success kid",
    hint: "Baby celebrating achievements",
    difficulty: 'hard',
    category: 'Victory Memes'
  }
];

const DIFFICULTY_POINTS = {
  easy: 10,
  medium: 20,
  hard: 30
};

const RANK_THRESHOLDS = {
  'Meme Newbie': 0,
  'Casual Browser': 50,
  'Meme Enthusiast': 120,
  'Reddit Regular': 200,
  'Meme Expert': 300,
  'Internet Legend': 500
};

const GuessTheMemeGame: Devvit.CustomPostComponent = (context) => {
  const [currentQuestion, setCurrentQuestion] = useState<MemeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    totalAttempts: 0,
    correctAnswers: 0,
    hintsUsed: 0
  });
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState<MemeQuestion[]>([...MEME_DATA]);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [lives, setLives] = useState(3);
  const [showAnswer, setShowAnswer] = useState(false);

  const getCurrentRank = (score: number): string => {
    const ranks = Object.entries(RANK_THRESHOLDS).reverse();
    for (const [rank, threshold] of ranks) {
      if (score >= threshold) return rank;
    }
    return 'Meme Newbie';
  };

  const getNextQuestion = () => {
    const filteredQuestions = remainingQuestions.filter(q => 
      difficulty === 'all' || q.difficulty === difficulty
    );
    
    if (filteredQuestions.length === 0) {
      const resetQuestions = difficulty === 'all' 
        ? [...MEME_DATA] 
        : MEME_DATA.filter(q => q.difficulty === difficulty);
      setRemainingQuestions(resetQuestions);
      return resetQuestions[Math.floor(Math.random() * resetQuestions.length)];
    }
    
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    setRemainingQuestions(prev => prev.filter(q => q.id !== randomQuestion.id));
    return randomQuestion;
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(getNextQuestion());
    setLives(3);
    setGameStats({
      score: 0,
      streak: 0,
      totalAttempts: 0,
      correctAnswers: 0,
      hintsUsed: 0
    });
    setFeedback('');
    setShowAnswer(false);
  };

  const submitAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
    const points = isCorrect ? DIFFICULTY_POINTS[currentQuestion.difficulty] : 0;
    const bonusPoints = gameStats.streak >= 3 ? Math.floor(points * 0.5) : 0;

    setGameStats(prev => ({
      ...prev,
      score: prev.score + points + bonusPoints,
      streak: isCorrect ? prev.streak + 1 : 0,
      totalAttempts: prev.totalAttempts + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0)
    }));

    if (isCorrect) {
      setFeedback(`🎉 Correct! +${points + bonusPoints} points${bonusPoints > 0 ? ` (${bonusPoints} streak bonus!)` : ''}`);
      setShowAnswer(false);
    } else {
      setLives(prev => prev - 1);
      setFeedback(`❌ Wrong! The answer was: "${currentQuestion.answer}"`);
      setShowAnswer(true);
      
      if (lives <= 1) {
        setFeedback(`💀 Game Over! Final Score: ${gameStats.score + points + bonusPoints} points`);
        setTimeout(() => {
          setGameStarted(false);
        }, 3000);
        return;
      }
    }
    
    setTimeout(() => {
      setCurrentQuestion(getNextQuestion());
      setUserAnswer('');
      setShowHint(false);
      setFeedback('');
      setShowAnswer(false);
    }, 2500);
  };

  const useHint = () => {
    setShowHint(true);
    setGameStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestion(null);
    setUserAnswer('');
    setShowHint(false);
    setFeedback('');
    setShowAnswer(false);
    setRemainingQuestions([...MEME_DATA]);
  };

  // Start Screen
  if (!gameStarted) {
    return (
      <vstack height="100%" width="100%" alignment="center middle" gap="medium" padding="large">
        <text size="xxlarge" weight="bold" color="primary">🎯 Guess the Meme!</text>
        <text size="large" color="secondary">Test your meme knowledge & word skills</text>
        
        <vstack gap="small" alignment="center">
          <text size="medium" weight="bold">Select Difficulty:</text>
          <hstack gap="small">
            <button 
              appearance={difficulty === 'all' ? 'primary' : 'secondary'} 
              size="small"
              onPress={() => setDifficulty('all')}
            >
              All Levels
            </button>
            <button 
              appearance={difficulty === 'easy' ? 'primary' : 'secondary'} 
              size="small"
              onPress={() => setDifficulty('easy')}
            >
              Easy (10pts)
            </button>
            <button 
              appearance={difficulty === 'medium' ? 'primary' : 'secondary'} 
              size="small"
              onPress={() => setDifficulty('medium')}
            >
              Medium (20pts)
            </button>
            <button 
              appearance={difficulty === 'hard' ? 'primary' : 'secondary'} 
              size="small"
              onPress={() => setDifficulty('hard')}
            >
              Hard (30pts)
            </button>
          </hstack>
        </vstack>

        <vstack gap="small" alignment="center">
          <text size="small">🏆 Streak bonuses • 💡 Hints available • ❤️ 3 lives</text>
          <button appearance="primary" size="large" onPress={startGame}>
            🚀 Start Game
          </button>
        </vstack>
      </vstack>
    );
  }

  // Game Screen
  return (
    <vstack height="100%" width="100%" gap="medium" padding="large">
      {/* Header Stats */}
      <hstack width="100%" alignment="space-between">
        <hstack gap="medium">
          <text size="medium" weight="bold">🏆 {gameStats.score}</text>
          <text size="medium">⚡ Streak: {gameStats.streak}</text>
          <text size="medium">❤️ {lives}</text>
        </hstack>
        <vstack alignment="end">
          <text size="small" weight="bold" color="primary">{getCurrentRank(gameStats.score)}</text>
          <text size="small" color="secondary">{gameStats.correctAnswers}/{gameStats.totalAttempts} correct</text>
        </vstack>
      </hstack>

      {currentQuestion && (
        <vstack gap="medium" alignment="center" width="100%">
          {/* Question Header */}
          <vstack gap="small" alignment="center">
            <text size="medium" weight="bold" color="secondary">
              {currentQuestion.type.toUpperCase()} • {currentQuestion.difficulty.toUpperCase()} • {currentQuestion.category}
            </text>
            <text size="small" weight="bold" color="primary">
              +{DIFFICULTY_POINTS[currentQuestion.difficulty]} points
            </text>
          </vstack>

          {/* ASCII Art */}
          {currentQuestion.ascii && (
            <vstack alignment="center" padding="medium">
              <text size="large" style="monospace" alignment="center">
                {currentQuestion.ascii}
              </text>
            </vstack>
          )}

          {/* Question */}
          <text size="large" alignment="center" wrap>
            {currentQuestion.description}
          </text>

          {/* Hint */}
          {showHint && (
            <vstack padding="medium" cornerRadius="medium" backgroundColor="warning-background">
              <text size="medium" weight="bold" color="warning">💡 Hint:</text>
              <text size="medium" color="warning">{currentQuestion.hint}</text>
            </vstack>
          )}

          {/* Answer Input */}
          <vstack gap="small" width="100%" maxWidth="400px">
            <textField 
              placeholder="Type your answer here..."
              value={userAnswer}
              onTextChange={setUserAnswer}
              disabled={feedback !== ''}
            />
            
            <hstack gap="small">
              <button 
                appearance="primary" 
                onPress={submitAnswer}
                disabled={!userAnswer.trim() || feedback !== ''}
                grow
              >
                Submit Answer
              </button>
              
              {!showHint && (
                <button appearance="secondary" onPress={useHint}>
                  💡 Hint
                </button>
              )}
            </hstack>
          </vstack>

          {/* Feedback */}
          {feedback && (
            <vstack 
              padding="medium" 
              cornerRadius="medium" 
              backgroundColor={feedback.includes('Correct') ? 'success-background' : 'danger-background'}
              width="100%"
              maxWidth="400px"
            >
              <text 
                size="medium" 
                weight="bold" 
                alignment="center"
                color={feedback.includes('Correct') ? 'success' : 'danger'}
              >
                {feedback}
              </text>
            </vstack>
          )}

          {/* Show correct answer if wrong */}
          {showAnswer && currentQuestion && (
            <vstack padding="medium" cornerRadius="medium" backgroundColor="neutral-background-weak">
              <text size="medium" alignment="center" color="neutral-content-strong">
                The correct answer was: "{currentQuestion.answer}"
              </text>
            </vstack>
          )}
        </vstack>
      )}

      {/* Bottom Controls */}
      <vstack gap="small" alignment="center">
        <button appearance="secondary" onPress={resetGame}>
          🔄 New Game
        </button>
        
        <hstack gap="large">
          <vstack alignment="center">
            <text size="large" weight="bold" color="primary">{gameStats.score}</text>
            <text size="small" color="secondary">Score</text>
          </vstack>
          <vstack alignment="center">
            <text size="large" weight="bold" color="success">{gameStats.correctAnswers}</text>
            <text size="small" color="secondary">Correct</text>
          </vstack>
          <vstack alignment="center">
            <text size="large" weight="bold" color="warning">{gameStats.streak}</text>
            <text size="small" color="secondary">Streak</text>
          </vstack>
          <vstack alignment="center">
            <text size="large" weight="bold" color="neutral-content">{gameStats.hintsUsed}</text>
            <text size="small" color="secondary">Hints</text>
          </vstack>
        </hstack>
      </vstack>
    </vstack>
  );
};

export default GuessTheMemeGame;