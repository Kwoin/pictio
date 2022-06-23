import { writable } from "svelte/store";

const TIMER_REFRESH = 1000;

export function timer(duration: number) {
  let time;
  let interval;
  const $time = writable(time);

  return {
    get time() {
      return $time;
    },
    start() {
      clearInterval(interval);
      time = duration;
      $time.set(time);
      interval = setInterval(() => {
        time -= TIMER_REFRESH;
        if (time < 0) time = 0;
        $time.set(time);
        if (time === 0) clearInterval(interval);
      }, TIMER_REFRESH)
    },
    stop() {
      clearInterval(interval);
    }
  }
}
