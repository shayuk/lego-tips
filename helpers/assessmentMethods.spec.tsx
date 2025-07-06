import { describe, it, expect } from '@jest/globals';
import { 
  calculateCompatibilityScore, 
  getTopCompatibleMethods, 
  getMethodsByCategory, 
  getMethodsByDifficulty,
  getMethodsByTimeInvestment,
  assessmentMethods,
  CourseParameters,
  AssessmentMethodCategory,
} from './assessmentMethods';

describe('assessmentMethods', () => {
  const mockCourseParams: CourseParameters = {
    course_type: "introduction",
    teaching_method: "lecture",
    class_size: "large",
    subject_area: "humanities",
    instructor_experience: 3,
    available_time: "moderate",
    technology_access: true
  };

  describe('calculateCompatibilityScore', () => {
    it('should return high score for perfect match', () => {
      const method = assessmentMethods[0]; // "מבחנים קצרים ומוגבלים בזמן"
      const score = calculateCompatibilityScore(method, mockCourseParams);
      expect(score).toBeGreaterThan(60);
    });

    it('should return lower score for poor match', () => {
      const advancedMethod = assessmentMethods.find(m => m.categories.includes("advanced") && !m.categories.includes("introduction"));
      if (advancedMethod) {
        const score = calculateCompatibilityScore(advancedMethod, mockCourseParams);
        expect(score).toBeLessThan(60);
      }
    });

    it('should return score between 0 and 100', () => {
      assessmentMethods.forEach(method => {
        const score = calculateCompatibilityScore(method, mockCourseParams);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('getTopCompatibleMethods', () => {
    it('should return requested number of methods', () => {
      const topMethods = getTopCompatibleMethods(mockCourseParams, 3);
      expect(topMethods).toHaveLength(3);
    });

    it('should return methods sorted by compatibility score descending', () => {
      const topMethods = getTopCompatibleMethods(mockCourseParams, 5);
      for (let i = 0; i < topMethods.length - 1; i++) {
        expect(topMethods[i].compatibilityScore).toBeGreaterThanOrEqual(topMethods[i + 1].compatibilityScore);
      }
    });

    it('should include compatibility score in results', () => {
      const topMethods = getTopCompatibleMethods(mockCourseParams, 2);
      topMethods.forEach(method => {
        expect(method.compatibilityScore).toBeDefined();
        expect(typeof method.compatibilityScore).toBe('number');
      });
    });
  });

  describe('getMethodsByCategory', () => {
    it('should return only methods from specified category', () => {
      const introMethods = getMethodsByCategory("introduction");
      introMethods.forEach(method => {
        expect(method.categories).toContain("introduction");
      });
    });

    it('should return empty array for non-existent category', () => {
      const methods = getMethodsByCategory("non-existent" as AssessmentMethodCategory);
      expect(methods).toHaveLength(0);
    });
  });

  describe('getMethodsByDifficulty', () => {
    it('should return only methods with specified difficulty', () => {
      const easyMethods = getMethodsByDifficulty(2);
      easyMethods.forEach(method => {
        expect(method.implementation_difficulty).toBe(2);
      });
    });

    it('should return empty array for non-existent difficulty', () => {
      const methods = getMethodsByDifficulty(0);
      expect(methods).toHaveLength(0);
    });
  });

  describe('getMethodsByTimeInvestment', () => {
    it('should return only methods with specified time investment', () => {
      const moderateMethods = getMethodsByTimeInvestment("moderate");
      moderateMethods.forEach(method => {
        expect(method.time_investment).toBe("moderate");
      });
    });
  });

  describe('assessmentMethods data integrity', () => {
    it('should have valid structure for all methods', () => {
      assessmentMethods.forEach(method => {
        expect(method.id).toBeDefined();
        expect(method.title).toBeDefined();
        expect(method.description).toBeDefined();
        expect(method.categories).toBeDefined();
        expect(method.teaching_methods).toBeDefined();
        expect(method.class_size_suitability).toBeDefined();
        expect(method.subject_areas).toBeDefined();
        expect(method.implementation_difficulty).toBeGreaterThanOrEqual(1);
        expect(method.implementation_difficulty).toBeLessThanOrEqual(5);
        expect(method.advantages).toBeDefined();
        expect(method.disadvantages).toBeDefined();
        expect(method.suggested_tools).toBeDefined();
        expect(method.time_investment).toBeDefined();
        expect(method.implementation_guidelines).toBeDefined();
      });
    });

    it('should have unique IDs for all methods', () => {
      const ids = assessmentMethods.map(m => m.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(assessmentMethods.length);
    });

    it('should have Hebrew titles for all methods', () => {
      assessmentMethods.forEach(method => {
        expect(method.title).toMatch(/[\u0590-\u05FF]/); // Hebrew characters
      });
    });
  });
});