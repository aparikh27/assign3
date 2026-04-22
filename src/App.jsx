import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function isAdjacent(sourceIdx, targetIdx) { // function to find if the target square is adjacent to the source square. 
  const sourceRow = Math.floor(sourceIdx / 3);
  const sourceCol = sourceIdx % 3;
  const targetRow = Math.floor(targetIdx / 3);
  const targetCol = targetIdx % 3;

  const rowDiff = Math.abs(sourceRow - targetRow);
  const colDiff = Math.abs(sourceCol - targetCol);

  // Return if squares are adjacent (less than or equal to 1 row and 1 column apart)
  return rowDiff <= 1 && colDiff <= 1;
}

function Board({ xIsNext, squares, onPlay, reachedMaxMoves, selectedSquare}) {
  function handleClick(i) {
    if (calculateWinner(squares)) {
      return;
    }

    const nextSquares = squares.slice();
    const currentPlayer = xIsNext ? 'X' : 'O';

    if (!reachedMaxMoves) { // first phase of the game 
      if (squares[i]) return; 
      nextSquares[i] = currentPlayer;

      onPlay(nextSquares, {place: null, player: null}, true); // update the board and increment the move

    } else { // second phase of the game 

      if (selectedSquare.place === null) { // if no square is currently selected

        if (squares[i] === null || squares[i] !== (currentPlayer)) { // only allow selecting a piece of your own
          console.log("Invalid selection. Please select a square that contains your piece.");

        } else {
          onPlay(nextSquares, {place: i, player: currentPlayer}, false); // set the selected square without incrementing the move
        }

      } else { // a piece is already selected 

        if (squares[i] === selectedSquare.player) { // change your selection to another piece of your own (primarily for invalid moves)
          onPlay(nextSquares, {place: i, player: currentPlayer}, false); 
        } 
        
        else if (squares[i] === null  && isAdjacent(selectedSquare.place, i)) { // only allow moving to an empty square
          nextSquares[i] = selectedSquare.player; 
          nextSquares[selectedSquare.place] = null; 
          
          // center piece logic 
          if (squares[4] === currentPlayer 
            && nextSquares[4] === currentPlayer
            && !calculateWinner(nextSquares)) { 
            console.log("Invalid move. You cannot stay in the center square. You must move out or make a winning move.");

          } else {
            onPlay(nextSquares, {place: null, player: null}, true); // update the board and increment the move
          }
        } 
        
        else {  
          console.log("Invalid move. You can only move to an adjacent empty square.");
        }
    }
  }
}

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}


export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState({place: null, player: null}); 
  const xIsNext = currentMove % 2 === 0; 
  const reachedMaxMoves = history[currentMove].filter(square => square !== null).length === 6; // find if each person has laid down 3 pieces 
  const currentSquares = history[currentMove]; 

  function handlePlay(nextSquares, selectedSquare, incrementMove) {
    if (incrementMove) { // only move if in the first phase or if a valid, complete move was made in the second phase
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
    }
    setSelectedSquare(selectedSquare);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} 
        onPlay={handlePlay} 
        reachedMaxMoves={reachedMaxMoves} 
        selectedSquare={selectedSquare} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

