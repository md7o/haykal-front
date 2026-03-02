export interface Question {
  id: string;
  section: string;
  sectionLabel: string;
  title: string;
  question: string;
  description?: string;
  answer?: string; // Temporary answer for testing
}

export const questionsData: Question[] = [
  // Section A: The Core "Why" and "Who"
  {
    id: "a1",
    section: "A",
    sectionLabel: "The Core Why & Who",
    title: "Core Value",
    question: "In one sentence, what is the primary problem your software solves for its users?",
    description:
      "e.g., 'It makes it effortless for small groups to split bills' or 'It automatically generates social media posts from a blog article.'",
    answer:
      "I'm going to allow whoever wants to build their own clothes online store by displaying a 3D model for T-shirt first and starting to add color, sizes, shapes, and T-shirt material and so on. That will help them design their t-shirts before going to printing and physical production stage",
  },
  {
    id: "a2",
    section: "A",
    sectionLabel: "The Core Why & Who",
    title: "Main User",
    question: "Who is the single most important type of person (user) you are building this for? Be as specific as possible.",
    description: "e.g., 'A busy freelance graphic designer' or 'A project manager in a tech company.'",
    answer: "Anyone who wants to open a clothes store (for now) and design the product",
  },
  {
    id: "a3",
    section: "A",
    sectionLabel: "The Core Why & Who",
    title: "Magic Action",
    question: "What is the one key thing a user can do on your website that they can't do easily now?",
    description:
      "e.g., 'Visualize their entire team's workflow on one shared board' or 'Find and book a local service in under 60 seconds.'",
    answer: "Design the T-shirt without going to learn photoshop and 3D programs or print, then discover that it's bad",
  },

  // Section B: The "What" - Features & Content
  {
    id: "b1",
    section: "B",
    sectionLabel: "The What - Features",
    title: "Must-Have Features (MVP)",
    question: "List 3-5 absolutely essential features a user needs to get that core value. Think input, process, output.",
    description: "e.g., For a task app: 1. Create a task, 2. Set a due date, 3. Mark it as complete, 4. See a list of all tasks.",
    answer: "Color changing, shape or images can add to t-shirt, clothes material, t-shirt type (polo or oversize)",
  },
  {
    id: "b2",
    section: "B",
    sectionLabel: "The What - Features",
    title: "User Account & Data",
    question: "Do users need to create their own private accounts to save their data? Or is it a public, one-time-use tool?",
    description: "This impacts authentication and data storage complexity.",
    answer: "Absolutely account",
  },
  {
    id: "b3",
    section: "B",
    sectionLabel: "The What - Features",
    title: "Payments",
    question:
      "Will you be charging users directly? (e.g., subscriptions, one-time purchases). Or will money come from somewhere else (ads, sponsors)?",
    description: "This determines monetization strategy and complexity.",
    answer: "Because it is a website and not an app, I want to make the payment by monthly subscription",
  },
  {
    id: "b4",
    section: "B",
    sectionLabel: "The What - Features",
    title: "Content",
    question:
      "Is this a tool that performs an action, or is it also a website with articles, blogs, and public pages (like a resource library)?",
    description: "This affects overall scope and content management needs.",
    answer: "I didn't understand this question",
  },

  // Section C: The "How" - Look, Feel, and Scale
  {
    id: "c1",
    section: "C",
    sectionLabel: "The How - Look & Scale",
    title: "Visual Examples",
    question:
      "Are there 2-3 existing websites or apps whose overall look and feel you admire? (Not their function, but their style)",
    description: "e.g., 'Clean like Notion,' 'Playful like Duolingo,' 'Professional like Salesforce.'",
    answer: "I don't know",
  },
  {
    id: "c2",
    section: "C",
    sectionLabel: "The How - Look & Scale",
    title: "Starting Scale",
    question: "On day one of launch, how many users do you realistically hope to have?",
    description: "e.g., '100,' '1000,' '10,000'. This influences initial server costs.",
    answer: "10-100",
  },
  {
    id: "c3",
    section: "C",
    sectionLabel: "The How - Look & Scale",
    title: "Future Vision",
    question: "Imagine your software is wildly successful in 3 years. What one advanced feature would it definitely have?",
    description:
      "e.g., 'Real-time collaboration,' 'AI-powered suggestions,' 'A full mobile app,' 'Complex data analytics dashboards.'",
    answer: "Expand the 3D to something like perfume bottle design not just clothes",
  },

  // Section D: Your Role & Resources
  {
    id: "d1",
    section: "D",
    sectionLabel: "Your Role & Resources",
    title: "Your Involvement",
    question: "Will you be managing the project full-time, or are you looking to hand the idea to a team and be more passive?",
    description: "This helps decide if you need a full team or a single developer/agency.",
    answer: "I'm going to managing the project alone for now",
  },
  {
    id: "d2",
    section: "D",
    sectionLabel: "Your Role & Resources",
    title: "Initial Budget Range",
    question: "Do you have a rough financial bracket in mind for the entire first version?",
    description: "e.g., 'Under $10k,' '$30k-$50k,' 'Seeking investment for $100k+'. This sets realistic expectations.",
    answer: "I have 5K Saudi Riyal",
  },
  {
    id: "d3",
    section: "D",
    sectionLabel: "Your Role & Resources",
    title: "Timeline",
    question: "Do you have a desired launch timeframe?",
    description: "e.g., 'Within 3 months,' '6-12 months,' 'No rush, quality is key.' This affects planning and scope.",
  },
];

export const getQuestionByIndex = (index: number): Question | undefined => {
  return questionsData[Math.min(index, questionsData.length - 1)];
};

export const getTotalQuestions = (): number => {
  return questionsData.length;
};

export const getProgressPercentage = (current: number, total: number): number => {
  return total === 0 ? 0 : Math.round((current / total) * 100);
};
