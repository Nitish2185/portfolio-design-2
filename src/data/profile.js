// All site copy and links. Anything still in lorem ipsum is a placeholder.

export const profile = {
  name: "Nitish Narayan Singh",
  shortName: "Nitish Singh",
  heroWord: "NITISH",
  logo: { first: "N", rest: "S" },
  email: "nns.nitish2185@gmail.com",
  location: "Uttar Pradesh, India",
  availability: "Open to opportunities",
  resume: "/Nitish_Resume.pdf",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/nitish2185", icon: "https://cdn.simpleicons.org/github/ffffff" },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/Nitish2185",
    icon: "https://api.iconify.design/simple-icons:linkedin.svg?color=%23ffffff",
  },
  { label: "Twitter / X", href: "https://x.com/nitish2185", icon: "https://cdn.simpleicons.org/x/ffffff" },
];

export const hero = {
  eyebrow: "Building Practical Solutions.",
  tagline: "Software Engineer · Full Stack · ServiceNow",
  description:
    "Software Engineer with experience in full stack development and ServiceNow, building reliable web applications, business workflows, and user-focused digital solutions.",
};

export const philosophy = {
  label: "The Philosophy",
  title: "The Philosophy",
  hint: "Scroll to expand",
  image: "/images/philosophy-bg.jpg",
  imageAlt: "Atmospheric dark cinematic background",
  statement:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Every feature, every workflow, every line of code is an opportunity to build something people can rely on. Sed do eiusmod tempor incididunt ut labore.",
};

export const projectsIntro = {
  title: "SELECTED PROJECTS",
  subtitle: "FROM TRAVEL PLATFORMS TO HIRING SYSTEMS — FULL-STACK APPS BUILT WITH CARE, PURPOSE, AND PRECISION.",
};

export const projects = [
  {
    title: "Voyager",
    description:
      "Travel platform with a React frontend, Node.js backend, MongoDB data layer, and deployment-ready configuration.",
    image: "/projects/voyager.jpg",
    tags: ["REACT", "NODE.JS", "EXPRESS", "MONGODB", "TAILWIND"],
    githubUrl: "https://github.com/nitish2185/voyager",
    liveUrl: "https://voyager-frontend-3smj.vercel.app/",
  },
  {
    title: "LiftLife",
    description:
      "Medical crowdfunding platform for launching fundraisers, browsing cases, and supporting campaigns.",
    image: "/projects/liftlife.jpg",
    tags: ["REACT", "EXPRESS", "MONGODB", "REDUX", "CLOUDINARY"],
    githubUrl: "https://github.com/Nitish2185/crowd-funding",
  },
  {
    title: "RiDER — Food Delivery",
    description: "MERN food delivery platform with JWT auth, Stripe payments, and full order management.",
    image: "/projects/rider.jpg",
    tags: ["REACT", "NODE.JS", "MONGODB", "JWT", "STRIPE"],
    githubUrl: "https://github.com/Nitish2185/Food-Delivery",
    liveUrl: "https://food-delivery-frontend-fl09.onrender.com/",
  },
  {
    title: "Movie Finder",
    description:
      "React Native movie discovery app with live search, trending rankings, and Appwrite-powered popularity tracking.",
    image: "/projects/movie-finder.jpg",
    tags: ["REACT NATIVE", "EXPO", "TYPESCRIPT", "APPWRITE"],
    githubUrl: "https://github.com/Nitish2185/movie-app",
  },
  {
    title: "Job Portal",
    description:
      "Full-stack hiring platform with job search, applications, company management, and recruiter admin workflows.",
    image: "/projects/job-portal.jpg",
    tags: ["REACT", "EXPRESS", "MONGODB", "REDUX", "TAILWIND"],
    githubUrl: "https://github.com/Nitish2185/JobPortal",
  },
];

export const experienceIntro = {
  label: "Experience",
  title: "Where I've Been",
  subtitle: "My professional journey through different roles and environments.",
};

export const experience = [
  {
    period: "Jul 2025 — Oct 2025",
    company: "Bangmetric LLC · Noida",
    role: "ServiceNow Developer Intern",
    summary:
      "Built and customised server-side logic on the ServiceNow platform for ITSM use cases, working across the full software development life cycle.",
    points: [
      "Developed server-side logic using JavaScript and Glide APIs",
      "Implemented REST integrations between ServiceNow and external systems",
      "Worked on Incident, Problem and Change Management with Business Rules and Script Includes",
    ],
  },
  {
    period: "Sep 2024 — Dec 2024",
    company: "SoftApper Tech Solutions · Noida",
    role: "Full Stack Developer Intern",
    summary:
      "Built full-stack features with React.js, Node.js, Express.js and MongoDB, connecting frontend components to backend services.",
    points: [
      "Designed RESTful APIs supporting authentication, search and filtering",
      "Integrated frontend components with backend services for seamless data flow",
      "Implemented Express middleware and MongoDB schemas for data validation",
    ],
  },
  {
    period: "2025",
    company: "HackerRank Certifications",
    role: "Continuous Learning",
    summary:
      "Verified skills across databases, frontend and core programming. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    points: [
      "SQL (Intermediate) — Credential 01883498139E",
      "React (Basic) — Credential 9D58D35F3907",
      "Java (Basic) — Credential CACBB9C8E53E",
    ],
  },
];

export const contactIntro = {
  label: "Get in Touch",
  title: "Let's Create Something Extraordinary",
  subtitle: "Have a project in mind or want to collaborate? Send a message and let's talk.",
};

export const menuItems = [
  { label: "Projects", ariaLabel: "Go to Projects section", link: "#projects" },
  { label: "Experience", ariaLabel: "Go to Experience section", link: "#experience" },
  { label: "Contact", ariaLabel: "Go to Contact section", link: "#contact" },
];
