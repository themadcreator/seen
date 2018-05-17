
export class CircularQueue<T> {
    private queue: T[];
    private size: number = 0;
    private head: number = 0;
    private tail: number = 0;

    constructor(private capacity: number = 1024) {
        this.queue = new Array(this.capacity);
    }

    public add(b: T) {
        while (this.isFull()) { this.poll(); }

        this.queue[this.head] = b;
        this.head++;
        this.head %= this.capacity;
        this.size++;
        return this;
    }

    public poll() {
        const b = this.queue[this.tail];
        this.tail++;
        this.tail %= this.capacity;
        this.size--;
        return b;
    }

    public each(visitor: (v: T, i: number) => void) {
        if (this.size === 0) { return; }
        let i = 0;
        let bi = this.tail;
        const b = this.queue[bi];
        while (i < this.size) {
            visitor(this.queue[bi], i);
            i++;
            bi = (bi + 1) % this.capacity;
        }
    }

    public clear() {
        this.head = 0;
        this.tail = 0;
        this.size = 0;
        return this;
    }

    public isFull() {
        return this.size === this.capacity;
    }
}
