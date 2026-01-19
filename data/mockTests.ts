
import { MockTest, Section } from '../types';

export const CMAT_MOCK_TESTS: MockTest[] = [
  {
    id: 'cmat-full-1',
    title: 'CMAT 2024 Full Length Mock #1',
    duration: 180,
    totalMarks: 400,
    questions: [
      {
        id: 'q1',
        section: Section.QUANT,
        question: "A sum of money doubles itself in 10 years at simple interest. In how many years will it triple itself?",
        options: ["15 years", "20 years", "25 years", "30 years"],
        correctAnswer: 1,
        explanation: "Simple Interest = P*R*T/100. If amount doubles, SI = P. So P = P*R*10/100 => R = 10%. To triple, SI must be 2P. 2P = P*10*T/100 => T = 20 years."
      },
      {
        id: 'q2',
        section: Section.LOGICAL,
        question: "In a certain code, 'ORANGE' is written as 'PSBOHF'. How is 'APPLE' written in that code?",
        options: ["BQQMF", "BQQLF", "BPQMF", "BQQNF"],
        correctAnswer: 0,
        explanation: "Each letter is shifted by one position forward (O+1=P, R+1=S, etc.). So A+1=B, P+1=Q, P+1=Q, L+1=M, E+1=F."
      },
      {
        id: 'q3',
        section: Section.LANGUAGE,
        question: "Choose the synonym of 'Ephemeral'.",
        options: ["Eternal", "Fleeting", "Grand", "Stable"],
        correctAnswer: 1,
        explanation: "Ephemeral means lasting for a very short time."
      },
      {
        id: 'q4',
        section: Section.GENERAL,
        question: "Who is the current Governor of the Reserve Bank of India (as of late 2023)?",
        options: ["Urjit Patel", "Raghuram Rajan", "Shaktikanta Das", "Nirmala Sitharaman"],
        correctAnswer: 2
      },
      {
        id: 'q5',
        section: Section.INNOVATION,
        question: "What is 'Angel Investing'?",
        options: ["Investing in religious organizations", "High-net-worth individuals providing capital for startups", "Government funding for public projects", "Bank loans for small businesses"],
        correctAnswer: 1
      },
      // Adding more variety for demo
      {
        id: 'q6',
        section: Section.QUANT,
        question: "If log 2 = 0.3010, what is the value of log 80?",
        options: ["1.9030", "1.6020", "2.1030", "1.8010"],
        correctAnswer: 0,
        explanation: "log 80 = log (8 * 10) = log 8 + log 10 = log 2^3 + 1 = 3 log 2 + 1 = 3(0.3010) + 1 = 0.9030 + 1 = 1.9030"
      }
    ]
  }
];
