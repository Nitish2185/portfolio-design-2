// Everything the site says lives here. Fields marked "Lorem" are placeholders.

export const profile = {
  firstName: "Nitish",
  lastName: "Singh",
  fullName: "Nitish Narayan Singh",
  role: "Software Engineer",
  location: "UP, India",
  email: "nns.nitish2185@gmail.com",
  resume: "/Nitish_Resume.pdf",
  socials: {
    github: { label: "github.com/nitish2185", href: "https://github.com/nitish2185" },
    linkedin: { label: "linkedin.com/in/Nitish2185", href: "https://linkedin.com/in/Nitish2185" },
    x: { label: "@nitish2185", href: "https://x.com/nitish2185" },
  },
};

// Two paragraphs that float beside the camera while its top cover lifts off
export const intro = [
  "Software Engineer with experience in full stack development and ServiceNow, building reliable web applications, business workflows, and user-focused digital solutions. Every feature starts with understanding the people who will use it.",
  "Based in Uttar Pradesh, India, I work across React, Node.js, Express and MongoDB on the web, and Glide APIs, Business Rules and REST integrations on ServiceNow. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
];

// Camera parts that lift off the body on scroll. Keys must match the GLB mesh names.
export const topCoverParts = [
  { key: "pentaprism", label: "pentaprism" },
  { key: "focus_screen", label: "focus screen" },
  { key: "focus_screen_box", label: "focus screen box" },
];

export const cameraCta = ["Explore my toolkit:", "hover the lens parts"];

// Shown in the part viewer when a lens element is hovered. Keys must match GLB mesh names.
export const lensParts = {
  lense: {
    title: "Frontend",
    description:
      "React.js · React Native · Redux · JavaScript (ES6+) · HTML5 · CSS3 · Tailwind CSS · Bootstrap",
  },
  front_ring: {
    title: "Backend",
    description: "Node.js · Express.js · RESTful APIs · JWT Authentication · MVC Architecture",
  },
  name_ring: {
    title: "Databases",
    description: "MySQL · MongoDB — schema design, validation and query tuning for real workloads.",
  },
  rubber_ring: {
    title: "ServiceNow",
    description:
      "ITSM · Glide API · Business Rules · Client Scripts · Script Includes · REST Integrations",
  },
  focusing_ring: {
    title: "Tools",
    description: "Git · Postman · NPM · VS Code · IntelliJ · Eclipse",
  },
  preset_aperture_ring: {
    title: "Core Concepts",
    description:
      "Data Structures · OOP · Agile · SDLC · API Design · Authentication · Problem Solving",
  },
  mount_ring: {
    title: "Lorem Ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus.",
  },
};

export const experienceIntro = [
  "Shipping software demands anticipation. Every release is a commitment, so I like to understand the requirement, the data and the edge cases before writing the first line of code.",
  "From ITSM workflows on ServiceNow to MERN applications with authentication and payments, I choose the stack that fits the problem and keep the codebase easy for the next engineer to read.",
];

export const experienceTable = {
  heading: "Experience & Certifications",
  valueHeading: "Year",
  rows: [
    { title: "ServiceNow Developer Intern • Bangmetric LLC", value: "2025" },
    { title: "Full Stack Developer Intern • SoftApper Tech", value: "2024" },
    { title: "SQL (Intermediate) • HackerRank", value: "2025" },
    { title: "React (Basic) • HackerRank", value: "2025" },
    { title: "Java (Basic) • HackerRank", value: "2025" },
  ],
};

export const workIntro =
  "Every project is a synthesis of requirements, intention and engineering. From travel platforms to crowdfunding and food delivery, each one is an exercise in building something people can rely on. Explore the selected work below.";

// The four stages the scan shader walks through (negative → corrected print)
export const scanSteps = ["Requirements", "Architecture", "Build & Test", "Ship to Production"];

// Eight cards that slide in, skewed, then pop on hover (cards 2 and 4 are desktop only).
export const projects = [
  {
    title: "Voyager",
    image: "/images/projects/voyager-bg.jpg",
    href: "https://voyager-frontend-3smj.vercel.app/",
  },
  {
    title: "LiftLife",
    image: "/images/projects/liftlife-bg.jpg",
    href: "https://github.com/Nitish2185/crowd-funding",
  },
  {
    title: "RiDER",
    image: "/images/projects/rider-bg.jpg",
    href: "https://food-delivery-frontend-fl09.onrender.com/",
  },
  {
    title: "Movie Finder",
    image: "/images/projects/movie-app-bg.jpg",
    href: "https://github.com/Nitish2185/movie-app",
  },
  {
    title: "Job Portal",
    image: "/images/frames/yellow-filter.jpg",
    href: "https://github.com/Nitish2185/JobPortal",
  },
  {
    title: "Lorem Ipsum",
    image: "/images/frames/blue-light-sensitive-layer.jpg",
    href: "https://github.com/nitish2185",
  },
  {
    title: "Dolor Sit",
    image: "/images/frames/uv-filter.jpg",
    href: "https://github.com/nitish2185",
  },
  {
    title: "Amet Elit",
    image: "/images/frames/master-print.jpg",
    href: "https://github.com/nitish2185",
  },
];

export const footer = {
  eyebrow: "Opportunities & Collaborations",
  heading: "Let's build something reliable.",
  lede: "Open to full-time roles, internships and freelance work across full stack development and ServiceNow. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  availability: "Open to new opportunities",
  tagline: "Built with React, Three.js & GSAP",
};
