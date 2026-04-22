import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function isAdjacent(sourceIdx, targetIdx) {
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

    if (!reachedMaxMoves) {
      if (squares[i]) return; // first phase of the game, players can fill squares as normal
      if (xIsNext) {
        nextSquares[i] = 'X';
      } else {
        nextSquares[i] = 'O';
      }
      onPlay(nextSquares, {place: null, player: null}, true); // update the board and increment the move

    } else { // second phase of the game 

      if (selectedSquare.place === null) { // if no square is currently selected
        if (squares[i] === null || squares[i] !== (xIsNext ? 'X' : 'O')) {
          console.log("Invalid selection. Please select a square that contains your piece.");
        } else {
          onPlay(nextSquares, {place: i, player: xIsNext ? 'X' : 'O'}, false); // set the selected square without incrementing the move
        }

      } else { // if a square is already selected
        if (squares[i] === null  && isAdjacent(selectedSquare.place, i)) { // only allow moving to an empty square
            
          nextSquares[i] = selectedSquare.player; // move the piece to the new square
          nextSquares[selectedSquare.place] = null; // clear the old square
          onPlay(nextSquares, {place: null, player: null}, true); // update the board and increment the move

        } else if (squares[i] === selectedSquare.player) { 
          onPlay(nextSquares, {place: i, player: xIsNext ? 'X' : 'O'}, false); // allow the player to change their selection to another one of their pieces
        } else {  
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
  const reachedMaxMoves = history[currentMove].filter(square => square !== null).length === 6;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares, selectedSquare, incrementMove) {
    if (incrementMove) {
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

