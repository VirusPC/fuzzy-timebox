import Container from "./container";
import Instrument, { State } from "./instrument";
// import { QueryProps} from "../builtin";

export type Props = {[key: string]: unknown};

export type Transition<P extends Props> = {
  action: string,
  events: string[],
  filter?: (event: Event, props: P) => boolean,
  fromState: string,
  toState: string,
}

/**
 * state machine + event dispatcher
 */
export default class Interactor<P extends Props> {
  private _currentState: string;
  private _transitions: Transition<P>[];
  private _listenerMap: { [action: string]: ((event: Event, props: P) => boolean | undefined | void)[] };

  constructor(initState: string, transitions: Transition<P>[], listenerMap: { [action: string]: ((event: Event, props: P) => boolean | undefined | void)[] } = {}) {
    this._currentState = initState;
    this._transitions = transitions;
    this._listenerMap = listenerMap;
  }

  get currentState() {
    return this._currentState;
  }

  dispatch(event: Event, props: P = {} as P): boolean | undefined {
    const transition = this._transitions
      .filter(transition => transition.fromState === this._currentState)
      .filter(transition => transition.events.includes(event.type))
      .find(transition => transition.filter ? transition.filter(event, props) : true);
    if (transition === undefined) return;
    this._listenerMap[transition.action]?.forEach(listener => listener(event, props));
    this._currentState = transition.toState;
    return true; // stop propagation
  }

  addEventListener(action: string, listener: (event: Event, props: P) => boolean | undefined | void) {
    if (this._listenerMap[action] === undefined) {
      this._listenerMap[action] = [];
    }
    this._listenerMap[action].push(listener);
  }

  removeEventListener(action: string, listener: (event: Event, props: P) => boolean | undefined | void) {
    this._listenerMap[action].splice(this._listenerMap[action].indexOf(listener), 1);
  }

}