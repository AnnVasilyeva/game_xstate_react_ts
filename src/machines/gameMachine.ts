import { createMachine, assign } from 'xstate';

export interface GameContext {
  targetSequence: number[]; //правильный порядок чисел
  shuffledNumbers: number[]; //текущий порядок чисел у игрока
  firstIndex: number | null; //индекс первого выбранного элемента для swap
  dragIndex: number | null; //какой элемент сейчас перетаскивают
  overIndex: number | null; //над каким элементом сейчас находится dragged item
  checkResult: 'correct' | 'incorrect' | null; //результат проверки
}

export type GameEvent =
  | { type: 'NEW_GAME'; count?: number }
  | { type: 'CLICK'; index: number }
  | { type: 'DRAG_START'; index: number }
  | { type: 'DRAG_OVER'; index: number }
  | { type: 'DRAG_END' }
  | { type: 'DROP'; toIndex: number }
  | { type: 'CHECK' };

function initGame(count: number) {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  const targetSequence = shuffleArray(numbers);
  let shuffled = shuffleArray(numbers);
  while (arraysMatch(shuffled, targetSequence)) {
    shuffled = shuffleArray(numbers);
  }
  return {
    targetSequence,
    shuffledNumbers: shuffled,
    firstIndex: null,
    dragIndex: null,
    overIndex: null,
    checkResult: null,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function arraysMatch(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

function moveItem(arr: number[], fromIndex: number, toIndex: number): number[] {
  const result = [...arr];
  const [movedItem] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, movedItem);
  return result;
}

function swapItems(arr: number[], indexA: number, indexB: number): number[] {
  const result = [...arr];
  const temp = result[indexA];
  result[indexA] = result[indexB];
  result[indexB] = temp;
  return result;
}

export const gameMachine = createMachine<GameContext, GameEvent>({
  id: 'game',
  initial: 'playing',
  context: {
    targetSequence: [],
    shuffledNumbers: [],
    firstIndex: null,
    dragIndex: null,
    overIndex: null,
    checkResult: null,
  },
  states: {
    playing: {
      entry: assign(() => initGame(6)),
      on: {
        NEW_GAME: {
          target: 'playing',
          actions: assign((_, event) => initGame(event.count || 6)),
        },
        CLICK: {
          actions: assign((ctx, event) => {
            if (ctx.firstIndex === null) {
              return { firstIndex: event.index };
            }
            if (ctx.firstIndex === event.index) {
              return { firstIndex: null };
            }
            return {
              shuffledNumbers: swapItems(ctx.shuffledNumbers, ctx.firstIndex, event.index),
              firstIndex: null,
              checkResult: null,
            };
          }),
        },
        DRAG_START: {
          actions: assign((_, event) => ({
            dragIndex: event.index,
          })),
        },
        DRAG_OVER: {
          actions: assign((_, event) => ({
            overIndex: event.index,
          })),
        },
        DRAG_END: {
          actions: assign(() => ({
            dragIndex: null,
            overIndex: null,
          })),
        },
        DROP: {
          actions: assign((ctx, event) => {
            if (ctx.dragIndex === null) return {};
            if (ctx.dragIndex === event.toIndex) {
              return {
                dragIndex: null,
                overIndex: null,
              };
            }
            return {
              shuffledNumbers: moveItem(ctx.shuffledNumbers, ctx.dragIndex, event.toIndex),
              dragIndex: null,
              overIndex: null,
              checkResult: null,
            };
          }),
        },
        CHECK: [
          {
            cond: (ctx) => arraysMatch(ctx.shuffledNumbers, ctx.targetSequence),
            target: 'won',
          },
          {
            actions: assign(() => ({
              checkResult: 'incorrect',
            })),
          },
        ],
      },
    },
    won: {
      on: {
        NEW_GAME: {
          target: 'playing',
          actions: assign((_, event) => initGame(event.count || 6)),
        },
      },
    },
  },
});
