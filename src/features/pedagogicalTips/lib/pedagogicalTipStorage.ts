import { v4 as uuidv4 } from 'uuid';
import { AssessmentMethod } from '../features/assessmentBuilder/lib/assessmentTypes';

const PRIVATE_TIPS_STORAGE_KEY = 'pedagogical-lego-private-tips';
const PUBLIC_TIPS_STORAGE_KEY = 'pedagogical-lego-public-tips';

export interface NewTipData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  classSizes: string[];
  teachingMethods: string[];
  subjectAreas: string[];
  difficulty: string;
  timeInvestment: string;
  advantages: {
    pedagogical: string;
    practical: string;
    engagement: string;
  };
  disadvantages: {
    challenges: string;
    limitations: string;
    resources: string;
  };
  recommendedTools: string;
  toolsWithLinks: { name: string; link: string; description: string }[];
  furtherReading: { title: string; link: string }[];
  implementationGuidelines: string;
  rubricTemplate: string;
}


// Function to get all private tips from localStorage
export const getPrivateTips = (): AssessmentMethod[] => {
  try {
    const savedTips = localStorage.getItem(PRIVATE_TIPS_STORAGE_KEY);
    return savedTips ? JSON.parse(savedTips) : [];
  } catch (error) {
    console.error("Error retrieving private tips from localStorage:", error);
    return [];
  }
};

// Function to save a new private tip to localStorage
export const savePrivateTip = (newTipData: NewTipData): AssessmentMethod => {
  const privateTips = getPrivateTips();
  
  const newTip: AssessmentMethod = {
    id: `private_${Date.now()}`,
    title: newTipData.title,
    description: newTipData.shortDescription,
    fullDescription: newTipData.fullDescription,
    categories: newTipData.categories as any,
    class_size_suitability: newTipData.classSizes as any,
    teaching_methods: newTipData.teachingMethods as any,
    subject_areas: newTipData.subjectAreas as any,
    implementation_difficulty: parseInt(newTipData.difficulty, 10) as any,
    time_investment: newTipData.timeInvestment as any,
    advantages: {
      pedagogical: newTipData.advantages.pedagogical.split('\n'),
      practical: newTipData.advantages.practical.split('\n'),
      student_engagement: newTipData.advantages.engagement.split('\n'),
    },
    disadvantages: {
      challenges: newTipData.disadvantages.challenges.split('\n'),
      limitations: newTipData.disadvantages.limitations.split('\n'),
      resource_requirements: newTipData.disadvantages.resources.split('\n'),
    },
    suggested_tools: newTipData.recommendedTools.split(',').map(t => t.trim()),
    toolsWithLinks: newTipData.toolsWithLinks,
    furtherReading: newTipData.furtherReading,
    implementation_guidelines: newTipData.implementationGuidelines.split('\n'),
  };

  const updatedTips = [...privateTips, newTip];
  
  try {
    localStorage.setItem(PRIVATE_TIPS_STORAGE_KEY, JSON.stringify(updatedTips));
  } catch (error) {
    console.error("Error saving private tip to localStorage:", error);
  }

  return newTip;
};

// Function to delete a private tip from localStorage
export const deletePrivateTip = (tipId: string): void => {
  let privateTips = getPrivateTips();
  privateTips = privateTips.filter(tip => tip.id !== tipId);
  
  try {
    localStorage.setItem(PRIVATE_TIPS_STORAGE_KEY, JSON.stringify(privateTips));
  } catch (error) {
    console.error("Error deleting private tip from localStorage:", error);
  }
}; 