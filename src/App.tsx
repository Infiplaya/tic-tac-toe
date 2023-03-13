import { useState } from "react";

export default function Game() {
  const [history, setHistory] = useState<Array<Array<String>>>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAsc, setIsAsc] = useState(true);
  const [selectedSign, setSelectedSign] = useState('')
  const [newMoves, setNewMoves] = useState<JSX.Element[]>();
  const [isGameStarted, setIsGameStarted] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: String[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  function handleSort() {
    setNewMoves([...moves].reverse());
    setIsAsc(!isAsc);
  }

  function getMoveLocation(prevSquares: String[], currSquares: String[]) {
    for (let i = 0; i < currSquares.length; i++) {
      if (prevSquares[i] !== currSquares[i]) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return [col, row];
      }
    }
  }

  let moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      const lastSquares = history[move - 1];
      const [lastCol, lastRow] = getMoveLocation(lastSquares, squares); 
      description = `#${move} (${lastCol}, ${lastRow})`;
    } else {
      description = "Go to start";
    }
    return move === currentMove ? (
      <li key={move}>You are at move #{currentMove}</li>
    ) : (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  function handleStartGame(sign: string) {
    setSelectedSign(sign);
    setIsGameStarted(true);
  }

  return (
    <div className="game">
      <div className="game-board">
        {!isGameStarted ? <>Select <button onClick={() => handleStartGame('X')}>X</button> or <button onClick={() => handleStartGame('O')}>O</button> </>: null}
        You selected: {selectedSign}
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} selectedSign={selectedSign} />
      </div>
      <div className="game-info">
        <ul>{isAsc ? moves : newMoves}</ul>
        <button onClick={handleSort}>Sort</button>
      </div>
    </div>
  );
}

interface BoardProps {
    xIsNext: boolean;
    squares: String[]; 
    onPlay: (nextSquares: String[]) => void;
    selectedSign: string;
  }

function Board({ xIsNext, squares, onPlay, selectedSign }: BoardProps) {
  const winner = calculateWinner(squares);
  console.log(selectedSign)

  let status;

  if (winner) {
    status = "Winner: " + winner[1];
  } 
  else {
    if (!squares.includes(null)) {
      status = "It's a draw"
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
  }

  function handleClick(index: number) {
    if (squares[index] || calculateWinner(squares) || !selectedSign) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[index] = "X";
    } else {
      nextSquares[index] = "O";
    }
    onPlay(nextSquares);
  }

  let board = [];
  for (let row = 0; row < 3; row++) {
    let boardRow = [];
    for (let col = 0; col < 3; col++) {
      let index = row * 3 + col;
      boardRow.push(
        <Square
          key={index}
          value={squares[index]}
          isWinner={winner && winner[0].includes(index as never)} // xd
          onSquareClick={() => handleClick(index)}
        />
      );
    }
    board.push(
      <div className="board-row" key={row}>
        {boardRow}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {board}
    </>
  );
}

interface SquareProps {
  value: String;
  onSquareClick: () => void;
  isWinner: boolean | null;
}

function Square({ value, onSquareClick, isWinner }: SquareProps) {
  return (
    <button
      className={isWinner ? "winner square" : "square"}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function calculateWinner(squares: String[]) {
  let winArr = [];
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winArr.push(a);
      winArr.push(b);
      winArr.push(c);
      return [winArr, squares[a]];
    }
  }
  return null;
}
