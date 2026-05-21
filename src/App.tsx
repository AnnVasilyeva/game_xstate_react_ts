import { useGameMachine } from './hooks/useGameMachine';
import './App.scss';

function App() {
  const { send, context, isWon } = useGameMachine();

  const handleNewGame = () => {
    send({ type: 'NEW_GAME', count: 6 });
  };

  const handleCheck = () => {
    send({ type: 'CHECK' });
  };

  const handleClick = (index: number) => {
    send({ type: 'CLICK', index });
  };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    send({ type: 'DRAG_START', index });
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    send({ type: 'DRAG_OVER', index });
  };

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    send({ type: 'DROP', toIndex });
  };

  const handleDragEnd = () => {
    send({ type: 'DRAG_END' });
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Расставь цифры в правильном порядке</h1>
      </div>
      <div className="target-section">
        <div className="target-sequence">
          {context.targetSequence.join(' - ')}
        </div>
      </div>

      <div className="number-list">
        {context.shuffledNumbers.map((num, index) => {
          const isSelected = context.firstIndex === index;
          const isDragging = context.dragIndex === index;
          const isDragOver = context.overIndex === index;
          return (
            <div
              key={`${num}-${index}`}
              className={`number-block ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${isWon ? 'locked' : ''}`}
              onClick={() => handleClick(index)}
              draggable={!isWon}
              onDragStart={handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
            >
              {num}
            </div>
          );
        })}
      </div>

      {!isWon && (
        <button className="btn btn-check" onClick={handleCheck}>
          Проверить
        </button>
      )}

      {context.checkResult === 'incorrect' && (
        <div className="check-message incorrect">Порядок не соответствует заданному, попробуй еще раз!</div>
      )}

      {isWon && (
        <div className="win-message">
          <h2>Победа!</h2>
          <button className="btn btn-primary" onClick={handleNewGame}>
            Новая игра
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
