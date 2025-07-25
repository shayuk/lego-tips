/* eslint-env jest */
import { renderHook, act } from "@testing-library/react";
import { useAssessmentBuilder, AssessmentComponentType } from "./useAssessmentBuilder";

describe("connectComponents", () => {
  it("does not create duplicate connections and updates updatedAt", () => {
    const { result } = renderHook(() => useAssessmentBuilder());

    let sourceId = "";
    let targetId = "";
    act(() => {
      sourceId = result.current.addComponent({
        type: "section-header" as AssessmentComponentType,
        title: "source",
        content: "",
        position: { x: 0, y: 0 },
        connections: []
      });
      targetId = result.current.addComponent({
        type: "section-header" as AssessmentComponentType,
        title: "target",
        content: "",
        position: { x: 0, y: 0 },
        connections: []
      });
    });

    const firstUpdate = result.current.assessment.updatedAt;

    act(() => {
      result.current.connectComponents(sourceId, targetId);
    });

    const afterFirst = result.current.assessment.updatedAt;

    act(() => {
      result.current.connectComponents(sourceId, targetId);
    });

    const afterSecond = result.current.assessment.updatedAt;

    const source = result.current.assessment.components.find(c => c.id === sourceId);
    expect(source?.connections).toEqual([targetId]);
    expect(afterFirst.getTime()).toBeGreaterThanOrEqual(firstUpdate.getTime());
    expect(afterSecond.getTime()).toBeGreaterThanOrEqual(afterFirst.getTime());
  });
});
