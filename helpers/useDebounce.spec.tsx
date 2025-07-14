import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { useDebounce } from "./useDebounce";

// Using fake timers to control the debounce delay

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("updates the debounced value only after the specified delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } }
    );

    // Initial value should be returned immediately
    expect(result.current).toBe("initial");

    // Change the value
    rerender({ value: "changed", delay: 300 });

    // Value should remain the previous one before delay elapsed
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(299);
    });
    // Still the previous value
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    // After the delay the value updates
    expect(result.current).toBe("changed");
  });

  it("returns the previous value when changed again before delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "start", delay: 200 } }
    );

    expect(result.current).toBe("start");

    // First change
    rerender({ value: "first", delay: 200 });
    // Advance half the delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    // Second change before the first delay completes
    rerender({ value: "second", delay: 200 });

    // Should still return the original value
    expect(result.current).toBe("start");

    // Advance time less than remaining delay
    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(result.current).toBe("start");

    // After total delay from last change, value updates
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second");
  });
});
