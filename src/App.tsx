import { useEffect, useState } from "react"

export default function Game() {
  const [history, setHistory] = useState<Array<Array<String>>>([Array(9).fill(null)])
  const [gameMode, setGameMode] = useState<"computer" | "player-player" | "menu">(
    "menu"
  )
  const [currentMove, setCurrentMove] = useState(0)
  const [isAsc, setIsAsc] = useState(true)
  const [selectedSign, setSelectedSign] = useState("")
  const [newMoves, setNewMoves] = useState<JSX.Element[]>()
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [playerTurn, setPlayerTurn] = useState<Boolean | undefined>(undefined)
  const [error, setError] = useState('')

  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares: String[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove)
  }

  function handleSort() {
    setNewMoves([...moves].reverse())
    setIsAsc(!isAsc)
  }

  function getMoveLocation(prevSquares: String[], currSquares: String[]) {
    for (let i = 0; i < currSquares.length; i++) {
      if (prevSquares[i] !== currSquares[i]) {
        const col = i % 3
        const row = Math.floor(i / 3)
        return [col, row]
      }
    }
  }

  function handleStartGame() {
    if (!selectedSign || gameMode === "menu") {
      setError('You must select game mode and selected sign')
      return
    }
    if (selectedSign === "X") {
      setPlayerTurn(true)
    } else {
      setPlayerTurn(false)
    }
    setIsGameStarted(true)
  }

  function handleChangeTurn() {
    setPlayerTurn(!playerTurn)
  }

  let moves = history.map((squares, move) => {
    let description
    if (move > 0) {
      const lastSquares = history[move - 1]
      const [lastCol, lastRow] = getMoveLocation(lastSquares, squares)
      description = `#${move} (${lastCol}, ${lastRow})`
    } else {
      description = "Go to start"
    }
    return move === currentMove ? (
      <li key={move}>You are at move #{currentMove}</li>
    ) : (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    )
  })

  return (
    <div>
      <div className="game">
        {!isGameStarted ? (
          <div className="game-menu">
            <div className="select-sign">
              <button
                onClick={() => setSelectedSign("X")}
                className={selectedSign === "X" ? "selected" : ""}
              >
                Select X
              </button>
              <button
                onClick={() => setSelectedSign("O")}
                className={selectedSign === "O" ? "selected" : ""}
              >
                Select O
              </button>
              <div>{error && error}</div>
            </div>
            <div className="select-mode">
              <button
                onClick={() => setGameMode("computer")}
                className={gameMode === "computer" ? "selected" : ""}
              >
                Computer
              </button>
              <button
                onClick={() => setGameMode("player-player")}
                className={gameMode === "player-player" ? "selected" : ""}
              >
                Player vs Player
              </button>
            </div>
            <button onClick={handleStartGame}>Start Game</button>
          </div>
        ) : (
          <>
            <div className="game-board">
              <Board
                xIsNext={xIsNext}
                squares={currentSquares}
                onPlay={handlePlay}
                selectedSign={selectedSign}
                turn={playerTurn}
                onChangeTurn={handleChangeTurn}
                gameMode={gameMode}
              />
            </div>
            <div className="game-info">
              <ul>{isAsc ? moves : newMoves}</ul>
              <button onClick={handleSort}>Sort</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface BoardProps {
  xIsNext: boolean
  squares: String[]
  onPlay: (nextSquares: String[]) => void
  selectedSign: string
  turn: Boolean | undefined
  onChangeTurn: () => void
  gameMode: "computer" | "player-player" | "menu";
}

function Board({
  xIsNext,
  squares,
  onPlay,
  selectedSign,
  turn,
  onChangeTurn,
  gameMode
}: BoardProps) {
  const winner = calculateWinner(squares)
  let status: string

  if (winner) {
    status = "Winner: " + winner[1]
  } else {
    if (!squares.includes(null)) {
      status = "It's a draw"
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O")
    }
  }

  function handleClick(index: number) {
    if (calculateWinner(squares) || squares[index]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[index] = 'X';
    } else {
      nextSquares[index] = 'O';
    }
    onPlay(nextSquares);
    onChangeTurn();
  }

  useEffect(() => {
    if (turn === false && gameMode === 'computer') {
      makeComputerMove(Math.floor(Math.random() * 9))
    }
  }, [turn, gameMode])

  function makeComputerMove(index: number) {
    if (calculateWinner(squares) || !selectedSign || status === "It's a draw") {
      return
    }
    while (squares[index]) {
      index = Math.floor(Math.random() * 9)
    }

    const nextSquares = squares.slice()
    if (selectedSign === "X") {
      nextSquares[index] = "O"
    } else {
      nextSquares[index] = "X"
    }

    onPlay(nextSquares)
    onChangeTurn()
  }

  let board = []
  for (let row = 0; row < 3; row++) {
    let boardRow = []
    for (let col = 0; col < 3; col++) {
      let index = row * 3 + col
      boardRow.push(
        <Square
          key={index}
          value={squares[index]}
          isWinner={winner && winner[0].includes(index as never)} // xd
          onSquareClick={() => handleClick(index)}
        />
      )
    }
    board.push(
      <div className="board-row" key={row}>
        {boardRow}
      </div>
    )
  }

  return (
    <>
      <div className="status">{status}</div>
      {board}
    </>
  )
}

interface SquareProps {
  value: String
  onSquareClick: () => void
  isWinner: boolean | null
}

function Square({ value, onSquareClick, isWinner }: SquareProps) {
  return (
    <button
      className={isWinner ? "winner square" : "square"}
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}

function calculateWinner(squares: String[]) {
  let winArr = []
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winArr.push(a)
      winArr.push(b)
      winArr.push(c)
      return [winArr, squares[a]]
    }
  }
  return null
}
