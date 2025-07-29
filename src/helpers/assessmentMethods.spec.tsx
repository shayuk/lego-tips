import { assessmentMethods, AssessmentMethod, AssessmentMethodCategory, CourseParameters, TeachingMethodCompatibility } from '../features/assessmentBuilder/lib/assessmentTypes';
import { calculateCompatibilityScore } from './compatibilityCalculator';


describe('Assessment Methods Data', () => {

  it('should contain a list of assessment methods', () => {
    expect(Array.isArray(assessmentMethods)).toBe(true);
    expect(assessmentMethods.length).toBeGreaterThan(0);
  });

  it('should have a unique ID for each method', () => {
    const ids = new Set();
    assessmentMethods.forEach((method: AssessmentMethod) => {
      expect(ids.has(method.id)).toBe(false);
      ids.add(method.id);
    });
  });

  it('should have required properties for each method', () => {
    assessmentMethods.forEach((method: AssessmentMethod) => {
      expect(method.id).toBeDefined();
      expect(method.title).toBeDefined();
      expect(method.description).toBeDefined();
      expect(Array.isArray(method.categories)).toBe(true);
      expect(method.implementation_difficulty).toBeGreaterThanOrEqual(1);
      expect(method.implementation_difficulty).toBeLessThanOrEqual(5);
    });
  });

  it('should contain at least one method of each category', () => {
    const categories: AssessmentMethodCategory[] = ["introduction", "large", "advanced"];
    categories.forEach(category => {
      const hasMethod = assessmentMethods.some((m: AssessmentMethod) => m.categories.includes(category));
      expect(hasMethod).toBe(true);
    });
  });

  it('should have valid compatibility scores for all methods', () => {
    const courseParams: CourseParameters = {
      course_type: 'introduction',
      teaching_method: 'lecture',
      class_size: 'large',
      subject_area: 'humanities',
      instructor_experience: 3,
      available_time: 'moderate',
      technology_access: true,
    };
    assessmentMethods.forEach((method: AssessmentMethod) => {
      const score = calculateCompatibilityScore(method, courseParams);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
