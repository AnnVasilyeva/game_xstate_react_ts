import { useMachine } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';

export function useGameMachine() {
  const [state, send] = useMachine(gameMachine);

  return {
    state,
    send,
    context: state.context,
    isWon: state.matches('won'),
  };
}
