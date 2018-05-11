// ## Animator
// ------------------

import { Events } from "./events";
import { Util } from "./util";
import { RenderContext } from "./render/context";

const DEFAULT_FRAME_DELAY = 30; // msec

export type IAnimationCallback = (timestamp: number, delta: number) => void;

interface IAnimationEvents {
    beforeFrame: IAnimationCallback;
    frame: IAnimationCallback;
    afterFrame: IAnimationCallback;
}

// The animator class is useful for creating an animation loop. We supply pre
// and post events for apply animation changes between frames.
export class Animator {
    private events = new Events<IAnimationEvents>();
    private on = this.events.on;
    private timestamp = 0;
    private running = false;
    private lastTime: number;
    private delayCompensation: number;
    private msecDelay: number;
    private lastTimestamp: number;
    private frameDelay: number;

    // Start the animation loop.
    public start() {
        this.running = true;

        if (this.frameDelay != null) {
            this.lastTime = new Date().valueOf();
            this.delayCompensation = 0;
        }

        this.animateFrame();
        return this;
    }

    // Stop the animation loop.
    public stop() {
        this.running = false;
        return this;
    }

    // Use requestAnimationFrame if available and we have no explicit frameDelay.
    // Otherwise, use a delay-compensated timeout.
    public animateFrame() {
        if (requestAnimationFrame != null && this.frameDelay == null) {
            requestAnimationFrame(this.frame);
        } else {
            // Perform frame delay compensation to make sure each frame is rendered at
            // the right time. This makes some animations more consistent
            const delta = new Date().valueOf() - this.lastTime;
            this.lastTime += delta;
            this.delayCompensation += delta;

            const frameDelay = this.frameDelay != null ? this.frameDelay : DEFAULT_FRAME_DELAY;
            setTimeout(this.frame, frameDelay - this.delayCompensation);
        }
        return this;
    }

    // The main animation frame method
    public frame = (t: number) => {
        if (!this.running) {
            return;
        }

        // create timestamp param even if requestAnimationFrame isn't available
        this.timestamp =
            t != null ? t : this.timestamp + (this.msecDelay != null ? this.msecDelay : DEFAULT_FRAME_DELAY);
        const deltaTimestamp = this.lastTimestamp != null ? this.timestamp - this.lastTimestamp : this.timestamp;

        this.events.emitter("beforeFrame")(this.timestamp, deltaTimestamp);
        this.events.emitter("frame")(this.timestamp, deltaTimestamp);
        this.events.emitter("afterFrame")(this.timestamp, deltaTimestamp);

        this.lastTimestamp = this.timestamp;

        this.animateFrame();
        return this;
    };

    // Add a callback that will be invoked before the frame
    public onBefore(handler: IAnimationCallback) {
        this.events.on("beforeFrame", handler);
        return this;
    }

    // Add a callback that will be invoked after the frame
    public onAfter(handler: IAnimationCallback) {
        this.events.on("afterFrame", handler);
        return this;
    }

    // Add a frame callback
    public onFrame(handler: IAnimationCallback) {
        this.events.on("frame", handler);
        return this;
    }
}

// A seen.Animator for rendering the seen.Context
export class RenderAnimator extends Animator {
    constructor(context: RenderContext) {
        super();
        this.onFrame(context.render);
    }
}

export interface ITransitionOptions {
    duration: number;
}

// A transition object to manage to animation of shapes
export abstract class Transition implements ITransitionOptions {
    public static defaults(): ITransitionOptions {
        return {
            duration: 100,
        };
    }

    private t: number;
    private startT: number;
    private tFrac: number;

    public duration: number;

    constructor(options: Partial<ITransitionOptions> = {}) {
        Util.defaults<ITransitionOptions>(this, options, Transition.defaults());
    }

    public update(t: number) {
        // Setup the first frame before the tick increment
        if (this.t == null) {
            this.firstFrame();
            this.startT = t;
        }

        // Execute a tick and draw a frame
        this.t = t;
        this.tFrac = (this.t - this.startT) / this.duration;
        this.frame();

        // Cleanup or update on last frame after tick
        if (this.tFrac >= 1.0) {
            this.lastFrame();
            return false;
        }

        return true;
    }

    abstract firstFrame();
    abstract frame();
    abstract lastFrame();
}

/**
 * A seen.Animator for updating seen.Transtions. We include keyframing to make
 * sure we wait for one transition to finish before starting the next one.
 */
export class TransitionAnimator extends Animator {
    private queue: Array<Transition[]> = [];
    private transitions: Transition[] = [];

    constructor() {
        super();
        this.onFrame(this.update);
    }

    /**
     * Adds a transition object to the current set of transitions. Note
     * thattransitions will not start until they have been enqueued by
     * invoking`keyframe()` on this object.
     */
    public add(txn) {
        return this.transitions.push(txn);
    }

    /**
     * Enqueues the current set of transitions into the keyframe queue and sets
     * up a new set of transitions.
     */
    public keyframe() {
        this.queue.push(this.transitions);
        return (this.transitions = []);
    }

    /**
     * When this animator updates, it invokes `update()` on all of the currently
     * animating transitions. If any of the current transitions are not done, we
     * re-enqueue them at the front. If all transitions are complete, we will
     * start animating the next set of transitions from the keyframe queue on the
     * next update.
     */
    public update(t) {
        if (!this.queue.length) {
            return;
        }
        let transitions = this.queue.shift();
        transitions = transitions.filter((transition) => transition.update(t));
        if (transitions.length) {
            return this.queue.unshift(transitions);
        }
    }
}
