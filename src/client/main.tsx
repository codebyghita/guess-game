// src/main.tsx - Devvit Reddit Game: Guess the Meme/Word
import { useState } from 'react';

// Devvit.configure({
//   redditAPI: true,
//   redis: true,
// });

// Game data for memes and word puzzles
const gameQuestions = [
  {
    id: 1,
    type: 'meme',
    question: 'This meme shows a person being distracted by something new. What is it commonly called?',
    answer: 'distracted boyfriend',
    hints: ['It involves three people', 'Someone is looking away', 'Popular relationship meme'],
    category: 'Classic Meme',
    points: 10
  },
  {
    id: 2,
    type: 'word',
    question: 'Complete the meme phrase: "This is ____"',
    answer: 'fine',
    hints: ['Dog in burning room', 'Everything is okay', 'Popular reaction meme'],
    category: 'Meme Phrase',
    points: 5
  },
  {
    id: 3,
    type: 'meme',
    question: 'What do you call the meme format where Drake rejects one thing and approves another?',
    answer: 'drake pointing',
    hints: ['Canadian rapper', 'Two panel format', 'Preference meme'],
    category: 'Format Meme',
    points: 10
  },
  {
    id: 4,
    type: 'word',
    question: 'Fill in: "You just got ____ rolled!"',
    answer: 'rick',
    hints: ['Never gonna give you up', 'Internet prank', 'Rick Astley'],
    category: 'Internet Culture',
    points: 15
  },
  {
    id: 5,
    type: 'meme',
    question: 'What meme features a child making a fist pump in success?',
    answer: 'success kid',
    hints: ['Beach photo', 'Determined expression', 'Victory pose'],
    category: 'Classic Meme',
    points: 10
  },
  {
    id: 6,
    type: 'word',
    question: 'Complete: "Much _____, very _____"',
    answer: 'wow',
    hints: ['Shiba Inu dog', 'Doge meme', 'Broken English'],
    category: 'Doge Meme',
    points: 10
  }
];

// Add a custom post type
const GuessGame = () => {
    // Game state management
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentQuestion = gameQuestions[currentQuestionIndex];
    const totalQuestions = gameQuestions.length;

    // Start game function
  const startGame = () => {
      setGameState('playing');
      setCurrentQuestionIndex(0);
      setScore(0);
      setUserAnswer('');
      setFeedback('');
      setShowHint(false);
      setHintLevel(0);
      setAttempts(0);
      setCorrectAnswers(0);
    };

    // Check answer function
    const checkAnswer = () => {
      if (!currentQuestion) return;
      const answer = userAnswer.toLowerCase().trim();
      const correctAnswer = currentQuestion.answer.toLowerCase();
      const isCorrect = answer === correctAnswer || 
                       answer.includes(correctAnswer) ||
                       correctAnswer.includes(answer);

      if (isCorrect) {
        const points = Math.max(currentQuestion.points - (attempts * 2) - (hintLevel * 3), 1);
        setScore(score + points);
        setCorrectAnswers(correctAnswers + 1);
        setFeedback(`🎉 Correct! +${points} points`);
        setTimeout(() => {
          if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setUserAnswer('');
            setFeedback('');
            setShowHint(false);
            setHintLevel(0);
            setAttempts(0);
          } else {
            setGameState('finished');
          }
        }, 2000);
      } else {
        setAttempts(attempts + 1);
        if (attempts >= 2) {
          setFeedback(`❌ Wrong! The answer was: "${currentQuestion.answer}"`);
          setTimeout(() => {
            if (currentQuestionIndex < totalQuestions - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setUserAnswer('');
              setFeedback('');
              setShowHint(false);
              setHintLevel(0);
              setAttempts(0);
            } else {
              setGameState('finished');
            }
          }, 3000);
        } else {
          setFeedback(`❌ Try again! ${2 - attempts} attempts left`);
        }
      }
    };

    // Get hint function
    const getHint = () => {
      if (currentQuestion && hintLevel < currentQuestion.hints.length) {
        setShowHint(true);
        setHintLevel(hintLevel + 1);
      }
    };

    // Restart game
    const restartGame = () => {
      startGame();
    };

    // Start screen
    if (gameState === 'start') {
      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',padding:'2rem',gap:'1rem'}}>
          <h1 style={{color:'#1976d2',fontWeight:'bold',fontSize:'2rem'}}>🎯 Guess the Meme/Word!</h1>
          <p style={{textAlign:'center',color:'#666'}}>Test your meme knowledge and complete word puzzles!</p>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'}}>
            <span>📝 {totalQuestions} questions</span>
            <span>💡 Hints available</span>
            <span>🏆 Earn points for correct answers</span>
          </div>
          <button onClick={startGame} style={{padding:'0.75rem 2rem',fontSize:'1rem',background:'#1976d2',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer'}}>Start Game</button>
        </div>
      );
    }

    // Game finished screen
    if (gameState === 'finished') {
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      let rank = '';
      if (percentage >= 90) rank = '🏆 Meme Master';
      else if (percentage >= 70) rank = '🥈 Meme Expert';
      else if (percentage >= 50) rank = '🥉 Meme Enthusiast';
      else rank = '📚 Meme Student';

      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',padding:'2rem',gap:'1rem'}}>
          <h1 style={{fontWeight:'bold',fontSize:'2rem'}}>Game Complete!</h1>
          <h2>{rank}</h2>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'}}>
            <span style={{fontWeight:'bold',color:'#1976d2',fontSize:'1.2rem'}}>Final Score: {score} points</span>
            <span>Correct: {correctAnswers}/{totalQuestions} ({percentage}%)</span>
          </div>
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
            <button onClick={restartGame} style={{padding:'0.5rem 1.5rem',background:'#1976d2',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer'}}>Play Again</button>
            <button onClick={()=>setGameState('start')} style={{padding:'0.5rem 1.5rem',background:'#eee',color:'#333',border:'none',borderRadius:'8px',cursor:'pointer'}}>Main Menu</button>
          </div>
        </div>
      );
    }

    // Main game screen
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%',padding:'1.5rem',gap:'1.5rem'}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:'bold'}}>Question {currentQuestionIndex + 1}/{totalQuestions}</span>
          <span style={{color:'#1976d2',fontWeight:'bold'}}>Score: {score}</span>
        </div>
        {/* Progress bar */}
        <div style={{height:'8px',background:'#eee',borderRadius:'8px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,background:'#1976d2',borderRadius:'8px',transition:'width 0.3s'}}></div>
        </div>
        {/* Question content */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem',flexGrow:1}}>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <span style={{color:'#666',fontWeight:'bold'}}>{currentQuestion?.category} • {currentQuestion?.type?.toUpperCase()}</span>
            <span style={{fontWeight:'bold',fontSize:'1.1rem'}}>{currentQuestion?.question}</span>
          </div>
          {/* Hint section */}
          {showHint && hintLevel > 0 && currentQuestion && (
            <div style={{background:'#f5f5f5',padding:'1rem',borderRadius:'8px'}}>
              <span style={{color:'#666',fontWeight:'bold'}}>💡 Hint {hintLevel}:</span>
              <div style={{marginTop:'0.5rem'}}>{currentQuestion.hints[hintLevel - 1]}</div>
            </div>
          )}
          {/* Answer input */}
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <span style={{fontWeight:'bold'}}>Your Answer:</span>
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              style={{padding:'0.5rem',fontSize:'1rem',borderRadius:'6px',border:'1px solid #ccc'}}
            />
          </div>
          {/* Feedback */}
          {feedback && (
            <span style={{fontWeight:'bold',color:feedback.includes('Correct') ? 'green' : 'red'}}>{feedback}</span>
          )}
          {/* Action buttons */}
          <div style={{display:'flex',gap:'1rem',marginTop:'0.5rem'}}>
            <button 
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              style={{padding:'0.5rem 1.5rem',background:'#1976d2',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer'}}
            >
              Submit Answer
            </button>
            <button 
              onClick={getHint}
              disabled={currentQuestion && hintLevel >= currentQuestion.hints.length}
              style={{padding:'0.5rem 1.5rem',background:'#eee',color:'#333',border:'none',borderRadius:'8px',cursor:'pointer'}}
            >
              Get Hint ({hintLevel}/{currentQuestion?.hints.length})
            </button>
          </div>
          {/* Attempts indicator */}
          <span style={{color:'#666',fontSize:'0.95rem'}}>Attempts: {attempts}/3 • Points for this question: {currentQuestion ? Math.max(currentQuestion.points - (attempts * 2) - (hintLevel * 3), 1) : 0}</span>
        </div>
      </div>
    );
};

export default GuessGame;