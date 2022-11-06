import Container from "./container";
import Interactor from "./interactor";

export type State = { [key: string]: unknown }

export type InstrumentProps<S extends State> = { container: Container, instrument: Instrument<S> };

const CONTROLED_EVENTS: (keyof HTMLElementEventMap)[] = ["mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave", "wheel"];

export default class Instrument<S extends State> {
  private _interactors: Interactor<InstrumentProps<S>>[];
  private _state: S;
  private _container: Container | null;
  private _preEffect: ((event: Event, props: InstrumentProps<S>) => void) | null;
  private _postEffect: ((event: Event, props: InstrumentProps<S>) => void) | null;
  private _shouldStopNextDispatch;

  constructor(defaultState: S) {
    this._container = null;
    this._state = defaultState;
    this._interactors = [];
    this._preEffect = null;
    this._postEffect = null;
    this._shouldStopNextDispatch = false;
  }
  getState<T extends keyof S>(key: T): S[T] {
    return this._state[key];
  }
  setState<T extends keyof S>(key: T, value: S[T]) {
    this._state[key] = value;
  }
  setContainer(container: Container) {
    this._container = container;
    this.addEventListeners();
  }
  removeFromContainer() {
    this.removeEventListeners();
    this._container = null;
  }
  addInteractor(interactor: Interactor<InstrumentProps<S>>) {
    this._interactors.push(interactor);
  }
  setPreEffect(effect: (event: Event, props: InstrumentProps<S>) => void) {
    this._preEffect = effect;
  }
  setPostEffect(effect: (event: Event, props: InstrumentProps<S>) => void) {
    this._preEffect = effect;
  }

  private dispatch(event: Event) {
    if (this._container === null) {
      console.log("Please set container first!");
      return;
    }
    this._preEffect && this._preEffect(event, { container: this._container, instrument: this });
    if (!this._shouldStopNextDispatch) {
      this._interactors.forEach(interactor => interactor.dispatch(event, { container: this._container!, instrument: this }));
    }
    this._shouldStopNextDispatch = false;
    this._postEffect && this._postEffect(event, { container: this._container, instrument: this });
  }

  private throttledDispatch = (event: Event) => {
    return requestAnimationFrame(() => {
      this.dispatch && this.dispatch(event)
    });
  }


  private addEventListeners(events: (keyof HTMLElementEventMap)[] = CONTROLED_EVENTS) {
    if (!this._container) {
      console.log("Please set container first!");
      return;
    }
    const target = this._container.getContainerElement();
    events.forEach(eventName => target.addEventListener(eventName, this.throttledDispatch));
  }

  private removeEventListeners(events: (keyof HTMLElementEventMap)[] = CONTROLED_EVENTS) {
    if (!this._container) {
      return;
    }
    const target = this._container.getContainerElement();
    events.forEach(eventName => target.removeEventListener(eventName, this.throttledDispatch));
  }

  preventNextDispatch() {
    this._shouldStopNextDispatch = true;
  }
}

