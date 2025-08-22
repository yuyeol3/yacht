export default class Publisher {
    constructor() {
        this.listeners = new Set();
    }

    subscribe(listener)  {
        this.listeners.add(listener);
    }

    unsubscribe(listener) {
        this.listeners.delete(listener);
    }

    notify(toNotify) {
        for (const listener of this.listeners) {
            listener(toNotify);
        }
    }
}