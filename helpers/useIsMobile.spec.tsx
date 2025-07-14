import { renderHook } from "@testing-library/react";
import { describe, it, beforeEach, expect } from "@jest/globals";
import { useIsMobile } from "./useIsMobile";

describe("useIsMobile", () => {
  let matchMedia: jest.Mock;
  beforeEach(() => {
    matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
    (window as any).matchMedia = matchMedia;
  });

  it("returns true when matchMedia matches", () => {
    matchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("calls matchMedia with mobile query", () => {
    renderHook(() => useIsMobile());
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });
});
