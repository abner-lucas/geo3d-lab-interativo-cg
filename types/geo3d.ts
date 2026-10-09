export type SolidType = 'cube' | 'cuboid' | 'triangular_prism' | 'square_pyramid' | 'cylinder';

export type AssessmentMode = 'PRACTICE' | 'EVALUATION';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED';

export type QuestionBlock = 
  | 'BLOCK_1_RECOGNITION' 
  | 'BLOCK_2_NETS' 
  | 'BLOCK_3_FOLDING' 
  | 'BLOCK_4_SPATIAL' 
  | 'BLOCK_5_COMPOSITION';

export interface QuestionDef {
  id: number;
  block: QuestionBlock;
  blockTitle: string;
  title: string;
  visualPrompt: string; // Short visual command
  points: number;
  type: 'select_single' | 'classify_2d_3d' | 'select_net' | 'predict_solid' | 'valid_net' | 'cube_face_color' | 'orthographic_view' | 'compose_house';
  options?: any[];
  librasVideoUrl?: string; // Optional teacher-supplied video URL
}

export interface StudentAnswer {
  questionId: number;
  answerData: any;
  isCorrect?: boolean;
  score?: number;
  answeredAt: string;
}

export interface Student {
  id: string;
  classId: string;
  pseudonym: string;
  displayNumber: number;
  accessCode: string;
  createdAt: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  yearPeriod: string;
  isAssessmentActive: boolean;
  studentCount?: number;
  createdAt: string;
}

export interface Attempt {
  id: string;
  studentId: string;
  studentPseudonym: string;
  studentCode: string;
  classId: string;
  mode: AssessmentMode;
  status: AttemptStatus;
  responses: Record<number, StudentAnswer>;
  totalScore: number;
  scoreAdjusted?: number | null;
  adjustmentJustification?: string | null;
  adjustedBy?: string | null;
  startedAt: string;
  submittedAt?: string | null;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  teacherId: string;
  studentId: string;
  action: string;
  justification: string;
  previousScore: number;
  newScore: number;
  timestamp: string;
}

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'coordinator';
}
