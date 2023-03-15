import { useEffect, useState } from "react"

export default function Game() {
  const [history, setHistory] = useState<Array<Array<string>>>([Array(9).fill("")])
  const [gameMode, setGameMode] = useState<"computer" | "player-player" | "menu">(
    "menu"
  )
  const [currentMove, setCurrentMove] = useState(0)
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedSign, setSelectedSign] = useState("")
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isPlayerTurn, setIsPlayerTurn] = useState<Boolean | undefined>(undefined)
  const [error, setError] = useState("")

  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares: string[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function goToMove(nextMove: number) {
    if (nextMove === 0) {
      handleStartGame()
    }
    setCurrentMove(nextMove)
    const nextSign = nextMove % 2 === 0 ? "X" : "O"
    if (selectedSign === nextSign) {
      setIsPlayerTurn(true)
    } else {
      setIsPlayerTurn(false)
    }
  }

  function handleStartGame() {
    if (!selectedSign || gameMode === "menu") {
      setError("Please Select BOTH sign and game mode")
      return
    }
    if (selectedSign === "X") {
      setIsPlayerTurn(true)
    } else {
      setIsPlayerTurn(false)
    }
    setIsGameStarted(true)
  }

  function handleChangeTurn() {
    setIsPlayerTurn(!isPlayerTurn)
  }

  function getMoveLocation(
    prevSquares: string[],
    currSquares: string[]
  ): number[] | undefined {
    for (let i = 0; i < currSquares.length; i++) {
      if (prevSquares[i] !== currSquares[i]) {
        const col = i % 3
        const row = Math.floor(i / 3)
        return [col, row]
      }
    }
  }

  let moves = history.map((squares, move) => {
    let description
    if (move > 0) {
      const lastSquares = history[move - 1]
      const boardArr = getMoveLocation(lastSquares, squares)
      if (boardArr) {
        let [lastCol, lastRow] = boardArr
        description = `#${move} (${lastCol}, ${lastRow})`
      }
    } else {
      description = "Go to start"
    }
    return move === currentMove ? (
      <li key={move}>You are at move #{currentMove}</li>
    ) : (
      <li key={move}>
        <button onClick={() => goToMove(move)}>{description}</button>
      </li>
    )
  })

  moves.sort((a, b) => {
    if (a.key && b.key) {
      if (sortOrder === "asc") {
        return (a.key as any) - (b.key as any)
      } else {
        return (a.key as any) - (b.key as any)
      }
    } else {
      // Handle the case where a.key or b.key is null
      return 0
    }
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
                isPlayerTurn={isPlayerTurn}
                onChangeTurn={handleChangeTurn}
                gameMode={gameMode}
              />
            </div>
            <div className="game-info">
              {moves}
              <button
                className="sort-button"
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }}
              >
                Sort {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface BoardProps {
  xIsNext: boolean
  squares: string[]
  onPlay: (nextSquares: string[]) => void
  selectedSign: string
  isPlayerTurn: Boolean | undefined
  onChangeTurn: () => void
  gameMode: "computer" | "player-player" | "menu"
}

function Board({
  xIsNext,
  squares,
  onPlay,
  selectedSign,
  isPlayerTurn,
  onChangeTurn,
  gameMode,
}: BoardProps) {
  const winner = calculateWinner(squares)
  let status: string
  const isComputerTurn = isPlayerTurn === false && gameMode === "computer"

  if (winner) {
    status = "Winner: " + winner[1]
  } else {
    if (!squares.includes("")) {
      status = "It's a draw"
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O")
    }
  }

  function handleClick(index: number) {
    if (calculateWinner(squares) || squares[index]) {
      return
    }
    const nextSquares = squares.slice()
    if (xIsNext) {
      nextSquares[index] = "X"
    } else {
      nextSquares[index] = "O"
    }
    onPlay(nextSquares)
    onChangeTurn()
  }

  useEffect(() => {
    if (isPlayerTurn === false && gameMode === "computer") {
      setTimeout(() => {
        makeComputerMove(Math.floor(Math.random() * 9))
      }, 500)
    }
  })

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
  let boardSize = 3;
  for (let row = 0; row < boardSize; row++) {
    let boardRow = []
    for (let col = 0; col < boardSize; col++) {
      let index = row * boardSize + col
      boardRow.push(
        <Square
          key={index}
          value={squares[index]}
          isWinner={winner && winner[0].includes(index as never)} // xd
          onSquareClick={() => handleClick(index)}
          disabled={isComputerTurn}
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
  value: string
  onSquareClick: () => void
  isWinner: boolean | null
  disabled: boolean
}

function Square({ value, onSquareClick, isWinner, disabled }: SquareProps) {
  return (
    <button
      className={isWinner ? "winner square" : "square"}
      onClick={onSquareClick}
      disabled={disabled}
    >
      {value}
    </button>
  )
}

function calculateWinner(squares: string[]) {
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
