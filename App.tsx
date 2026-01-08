import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

type GameState = 'playing' | 'correct' | 'incorrect_first' | 'incorrect_second' | 'finished';
type Problem = { num1: number; num2: number };

const MAX_SCORE = 20;

// Helper Component: EggBox
const EGG_DESIGNS = [
    { backgroundColor: '#FFADAD', backgroundImage: 'radial-gradient(#FFD6A5 20%, transparent 20%)', backgroundSize: '10px 10px' },
    { backgroundColor: '#FDFFB6', backgroundImage: 'linear-gradient(45deg, #CAFFBF 25%, transparent 25%, transparent 75%, #CAFFBF 75%, #CAFFBF), linear-gradient(45deg, #CAFFBF 25%, transparent 25%, transparent 75%, #CAFFBF 75%, #CAFFBF)', backgroundSize: '12px 12px', backgroundPosition: '0 0, 6px 6px' },
    { backgroundColor: '#9BF6FF', backgroundImage: 'linear-gradient(135deg, #A0C4FF 50%, transparent 50%)', backgroundSize: '15px 15px'},
    { backgroundColor: '#BDB2FF', backgroundImage: 'radial-gradient(circle, #FFC6FF 30%, transparent 30%)', backgroundSize: '12px 12px'},
    { backgroundColor: '#FFD6A5', backgroundImage: 'linear-gradient(#FFADAD 50%, transparent 50%)', backgroundSize: '20px 5px' },
    { backgroundColor: '#CAFFBF', backgroundImage: 'radial-gradient(#9BF6FF 2px, transparent 2px)', backgroundSize: '8px 8px'},
    { backgroundColor: '#A0C4FF', backgroundImage: 'linear-gradient(45deg, #BDB2FF 33%, transparent 33%, transparent 66%, #BDB2FF 66%)', backgroundSize: '10px 10px'},
    { backgroundColor: '#FFC6FF', backgroundImage: 'linear-gradient(0deg, #FDFFB6, #FDFFB6 2px, transparent 2px, transparent 10px)', backgroundSize: '10px 10px'},
];

interface EggBoxProps {
  score: number;
  maxScore: number;
}
const EggBox: React.FC<EggBoxProps> = ({ score, maxScore }) => {
  return (
    <div className="bg-orange-200 p-4 rounded-2xl border-4 border-purple-400 shadow-inner">
      <h2 className="text-center text-xl font-bold text-purple-800 mb-2">Jouw Eierdoos</h2>
      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: maxScore }).map((_, i) => (
          <div key={i} className="w-10 h-14 rounded-[50%] flex items-center justify-center border-2 border-purple-300 border-dashed p-1">
            {i < score && (
               <div 
                 className="w-full h-full rounded-[50%] transform -rotate-12 shadow-md" 
                 style={EGG_DESIGNS[i % EGG_DESIGNS.length]}
               ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper Component: ChickenAnimation
const ChickenAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-green-500 bg-opacity-90 flex flex-col items-center justify-center z-50">
      <h2 className="text-5xl md:text-7xl font-black text-white text-center mb-8 drop-shadow-lg">Goed zo!</h2>
      <img
        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3Jkcmg1azY0amNqZHI1MWY0OXA2bGRuZmRhdWJ2dXBrbnk1dHNuZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LPrBOUNDA5h2Q/giphy.gif"
        alt="Etende kippen"
        className="rounded-lg shadow-2xl border-4 border-white"
      />
    </div>
  );
};

// Helper Component: HelpGuide
interface HelpGuideProps {
  num1: number;
  num2: number;
  showAnswers: boolean;
  onHelpComplete: (finalAnswer: string) => void;
}
const HelpGuide: React.FC<HelpGuideProps> = ({ num1, num2, showAnswers, onHelpComplete }) => {
  const [inputs, setInputs] = useState({ s1Num: '', s1Ans: '', s2Num: '', s2Ans: '', s3Num: '', s3Ans: '' });

  const inputRefs = {
    s1Num: useRef<HTMLInputElement>(null),
    s1Ans: useRef<HTMLInputElement>(null),
    s2Num: useRef<HTMLInputElement>(null),
    s2Ans: useRef<HTMLInputElement>(null),
    s3Num: useRef<HTMLInputElement>(null),
    s3Ans: useRef<HTMLInputElement>(null),
  };

  const correctAnswers = useMemo(() => {
    const tensToAdd = Math.floor(num2 / 10) * 10;
    const unitsTotal = num2 % 10;
    
    const resultStep1 = num1 + tensToAdd;
    const startNumStep2 = tensToAdd > 0 ? resultStep1 : num1;

    const toNextTen = 10 - (startNumStep2 % 10);
    const unitsStep2 = (startNumStep2 % 10 === 0) ? 0 : Math.min(unitsTotal, toNextTen);
    const resultStep2 = startNumStep2 + unitsStep2;
    
    const unitsStep3 = unitsTotal - unitsStep2;
    const resultStep3 = resultStep2 + unitsStep3;

    return {
      step1: { num: tensToAdd, ans: resultStep1 },
      step2: { num: unitsStep2, ans: resultStep2, start: startNumStep2 },
      step3: { num: unitsStep3, ans: resultStep3, start: resultStep2 },
    };
  }, [num1, num2]);
  
  const hasTensStep = correctAnswers.step1.num > 0;

  const inputOrder = useMemo<(keyof typeof inputs)[]>(() => {
    return hasTensStep
      ? ['s1Num', 's1Ans', 's2Num', 's2Ans', 's3Num', 's3Ans']
      : ['s2Num', 's2Ans', 's3Num', 's3Ans'];
  }, [hasTensStep]);
  
  const getCorrectValueForInput = useCallback((name: keyof typeof inputs) => {
    switch(name) {
      case 's1Num': return correctAnswers.step1.num;
      case 's1Ans': return correctAnswers.step1.ans;
      case 's2Num': return correctAnswers.step2.num;
      case 's2Ans': return correctAnswers.step2.ans;
      case 's3Num': return correctAnswers.step3.num;
      case 's3Ans': return correctAnswers.step3.ans;
      default: return '';
    }
  }, [correctAnswers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (/^\d*$/.test(value)) {
        setInputs(prev => ({ ...prev, [name]: value }));

        const currentInputName = name as keyof typeof inputs;
        const correctValue = getCorrectValueForInput(currentInputName);

        if (value.length > 0 && value.length >= String(correctValue).length) {
          const currentIndex = inputOrder.indexOf(currentInputName);
          if (currentIndex < inputOrder.length - 1) {
            const nextInputName = inputOrder[currentIndex + 1];
            inputRefs[nextInputName].current?.focus();
          }
        }
      }
  };

  useEffect(() => {
    const finalUserInput = inputs.s3Ans;
    if (Number(finalUserInput) === correctAnswers.step3.ans) {
        onHelpComplete(finalUserInput);
    }
  }, [inputs.s3Ans, correctAnswers.step3.ans, onHelpComplete]);

  interface HelpInputProps {
    name: keyof typeof inputs;
    value: number;
    inputRef: React.RefObject<HTMLInputElement>;
  }

  const HelpInput: React.FC<HelpInputProps> = ({ name, value, inputRef }) => (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      name={name}
      value={showAnswers ? value : inputs[name]}
      onChange={!showAnswers ? handleChange : undefined}
      readOnly={showAnswers}
      className="w-16 h-10 text-center text-xl font-bold bg-yellow-100 border-2 border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
      autoComplete="off"
    />
  );

  return (
    <div className="bg-white bg-opacity-80 p-6 rounded-2xl shadow-lg border-2 border-purple-300 w-full max-w-sm">
      <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">Hulp</h3>
      <div className="space-y-4 text-lg text-purple-700">
        {hasTensStep && (
          <div className="flex items-center justify-between">
            <span>1. Eerst de tientallen:</span>
            <div className="flex items-center gap-2">
              <span>{num1} +</span>
              <HelpInput name="s1Num" value={correctAnswers.step1.num} inputRef={inputRefs.s1Num} />
              <span>=</span>
              <HelpInput name="s1Ans" value={correctAnswers.step1.ans} inputRef={inputRefs.s1Ans} />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>{hasTensStep ? '2.' : '1.'} Aanvullen tot tiental:</span>
          <div className="flex items-center gap-2">
             <span>{correctAnswers.step2.start} +</span>
            <HelpInput name="s2Num" value={correctAnswers.step2.num} inputRef={inputRefs.s2Num} />
            <span>=</span>
            <HelpInput name="s2Ans" value={correctAnswers.step2.ans} inputRef={inputRefs.s2Ans} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>{hasTensStep ? '3.' : '2.'} De rest erbij:</span>
          <div className="flex items-center gap-2">
            <span>{correctAnswers.step3.start} +</span>
            <HelpInput name="s3Num" value={correctAnswers.step3.num} inputRef={inputRefs.s3Num} />
            <span>=</span>
            <HelpInput name="s3Ans" value={correctAnswers.step3.ans} inputRef={inputRefs.s3Ans} />
          </div>
        </div>
      </div>
       {showAnswers && <p className="text-center mt-4 text-purple-600 font-semibold">Probeer de stappen te volgen.</p>}
    </div>
  );
};


// Helper Component: CompletionScreen
interface CompletionScreenProps {
  onReset: () => void;
}
const CompletionScreen: React.FC<CompletionScreenProps> = ({ onReset }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl shadow-xl border-4 border-purple-500">
            <h2 className="text-5xl font-black text-purple-800 mb-4">Super gekakeld!</h2>
            <p className="text-2xl text-orange-600 mb-8">Je hebt {MAX_SCORE} eieren verzameld. Jij bent een echte reken-kip!</p>
            <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3VscG5uM2F2a3V2OTJmMzNrb3c3d3Q3ZzRuaWNscXF5ZWVhOHZ3diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iC2fA2s532iA/giphy.gif" alt="Feestelijke kip" className="rounded-lg shadow-lg mb-8" />
            <button
                onClick={onReset}
                className="px-8 py-4 bg-purple-600 text-white font-bold text-2xl rounded-xl shadow-lg hover:bg-purple-700 transform hover:scale-105 transition-transform duration-300"
            >
                Nog een keer!
            </button>
        </div>
    );
};


export default function App() {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [problem, setProblem] = useState<Problem>({ num1: 0, num2: 0 });
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [attempt, setAttempt] = useState(1);

  const generateProblem = useCallback(() => {
    let num1 = 0;
    let num2 = 0;
    let isValid = false;

    while (!isValid) {
      if (score < 5) {
        num1 = Math.floor(Math.random() * 19) + 11; // 11-29
        num2 = Math.floor(Math.random() * 8) + 2; // 2-9
      } else if (score < 10) {
        num1 = Math.floor(Math.random() * 29) + 21; // 21-49
        num2 = Math.floor(Math.random() * 18) + 2; // 2-19
      } else if (score < 15) {
        num1 = Math.floor(Math.random() * 39) + 21; // 21-59
        num2 = Math.floor(Math.random() * 19) + 11; // 11-29
      } else {
        num1 = Math.floor(Math.random() * 59) + 21; // 21-79
        num2 = Math.floor(Math.random() * 19) + 11; // 11-29
      }
      
      const sum = num1 + num2;
      const crossesTen = (num1 % 10) + (num2 % 10) >= 10;
      const hasUnits = (num1 % 10 !== 0) && (num2 % 10 !== 0);

      if (sum < 100 && crossesTen && hasUnits && num1 > 10) {
        isValid = true;
      }
    }
    setProblem({ num1, num2 });
    setUserInput('');
    setAttempt(1);
  }, [score]);

  useEffect(() => {
    generateProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);
  
  useEffect(() => {
      if (score >= MAX_SCORE) {
          setGameState('finished');
      }
  }, [score]);

  useEffect(() => {
    if (gameState === 'correct') {
      const timer = setTimeout(() => {
        setGameState('playing');
        if (score < MAX_SCORE) {
            generateProblem();
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameState, score, generateProblem]);
  
  const handleHelpComplete = useCallback((finalAnswer: string) => {
    setUserInput(finalAnswer);
  }, []);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = parseInt(userInput, 10);
    if (isNaN(answer)) return;

    if (answer === problem.num1 + problem.num2) {
      if(attempt === 1){
        setScore(prev => prev + 1);
      }
      setGameState('correct');
    } else {
      if (attempt === 1) {
        setGameState('incorrect_first');
        setAttempt(2);
      } else {
        setGameState('incorrect_second');
      }
    }
  };

  const handleNextProblem = () => {
    setGameState('playing');
    generateProblem();
  };

  const handleResetGame = () => {
    setScore(0);
    generateProblem();
    setGameState('playing');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 flex flex-col items-center justify-center p-4">
       {gameState === 'correct' && <ChickenAnimation />}
       <div className="w-full max-w-4xl mx-auto space-y-6">
            {gameState !== 'finished' && (
                 <div className="mb-8">
                    <h1 className="text-4xl font-bold text-center text-purple-800 mb-4">Rekenkippen</h1>
                    <EggBox score={score} maxScore={MAX_SCORE} />
                </div>
            )}
            
            <main className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-white/80">
                {gameState === 'finished' ? (
                    <CompletionScreen onReset={handleResetGame} />
                ) : (
                    <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
                        <div className="flex-1 flex flex-col items-center">
                            <div className="text-7xl md:text-9xl font-black text-purple-800 tracking-tighter mb-8 text-center">
                                <span>{problem.num1}</span>
                                <span className="text-orange-500 mx-4">+</span>
                                <span>{problem.num2}</span>
                            </div>

                            <form onSubmit={handleAnswerSubmit} className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="w-48 h-20 text-5xl font-bold text-center border-4 border-purple-400 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:outline-none"
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                />
                                <button
                                    type="submit"
                                    className="h-20 px-8 bg-purple-600 text-white font-bold text-2xl rounded-2xl shadow-lg hover:bg-purple-700 transform hover:scale-105 transition-transform duration-300 disabled:bg-gray-400"
                                    disabled={!userInput}
                                >
                                    Klaar!
                                </button>
                            </form>
                             {gameState === 'incorrect_first' && <p className="text-red-600 font-bold mt-4">Oeps, dat is niet goed. Probeer het nog eens met de hulp!</p>}
                        </div>

                        {(gameState === 'incorrect_first' || gameState === 'incorrect_second') && (
                            <div className="flex-1">
                                <HelpGuide 
                                    num1={problem.num1} 
                                    num2={problem.num2} 
                                    showAnswers={gameState === 'incorrect_second'} 
                                    onHelpComplete={handleHelpComplete}
                                />
                                {gameState === 'incorrect_second' && (
                                     <button
                                        onClick={handleNextProblem}
                                        className="mt-6 w-full py-3 bg-orange-500 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-transform duration-300"
                                    >
                                        Volgende som
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
       </div>
    </div>
  );
}
