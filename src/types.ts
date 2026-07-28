export interface Skill {
  category: string;
  items: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  location: string;
  details?: string;
}

export interface TestLog {
  timestamp: string;
  level: 'INFO' | 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

export interface Project {
  id: string;
  title: string;
  type: 'Manual' | 'Automation' | 'API' | 'Performance';
  description: string;
  metrics?: {
    label: string;
    value: string;
  }[];
  assertions: {
    name: string;
    status: 'PASS' | 'FAIL';
    duration?: string;
  }[];
  logs: TestLog[];
  tags: string[];
  link?: string;
}

export interface BugReport {
  id: string;
  title: string;
  project: string;
  severity: 'Critical' | 'Major' | 'Minor';
  description: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  status: 'Open' | 'Investigating' | 'Resolved';
}

export interface Reference {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}
