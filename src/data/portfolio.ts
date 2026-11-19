// Replace pending social links with client-approved URLs before deployment.
export const portfolio = {
  name: 'Siddhi Bhogade', title: 'AI & DevOps Engineer', location: 'Pune, India',
  email: 'siddhibhogade@gmail.com',
  socials: [{ name: 'GitHub', url: null }, { name: 'LinkedIn', url: null }],
  biography: 'I’m Siddhi, working at the intersection of AI, software development and deployment. From exploring how models understand video to supporting ERP application workflows, I’m interested in the engineering that brings ideas into use.',
  education: { degree: 'Bachelor in Computer Applications (Science)', institution: 'Savitribai Phule Pune University', dates: '2023–2026' },
  experience: [
    { role: 'DevOps Engineering Intern', company: 'EvoTech IT Services', dates: 'March 2026 – October 2026' },
    { role: 'Marketing Intern', company: 'Corizo', dates: 'May 2025 – June 2025' },
  ],
  stack: [ ['Python', 'PyTorch', 'OpenCV', 'Machine Learning', 'AI'], ['AWS', 'DevOps', 'CI/CD', 'GitHub', 'Hostinger'], ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs'], ['PHP', 'MySQL', 'Java', 'DSA', 'Git'] ],
  services: ['AI & Machine Learning', 'DevOps & Deployment', 'Full-Stack Development', 'Database & API Integration', 'Cloud & CI/CD Workflows'],
  projects: [
    { name: 'CatersHub', subtitle: 'Intelligent Catering Service Aggregator', category: 'Software development', description: 'A centralized platform connecting customers and caterers. Caterers register and manage services; customers explore options by cuisine, budget and requirements, then place catering orders online.', tags: ['Multi-caterer platform', 'Preference-based selection', 'Online orders'], url: 'https://caters-hub-eta.vercel.app', media: '/images/projects/catershub.webp', visual: 'catershub' },
    { name: 'Iris Liveness', subtitle: 'Spatio-Temporal Deep Learning', category: 'AI / Research', description: 'A lightweight spatio-temporal deep learning framework for iris liveness detection against video replay attacks. MobileNetV3-Small extracts spatial features and an LSTM analyzes temporal sequences, with video preprocessing in Python, PyTorch and OpenCV.', tags: ['97.06% validation accuracy', 'Reported 100% test accuracy', '7.26 MB optimized model'], url: null, media: '/images/projects/iris-liveness.webp', visual: 'iris' },
    { name: 'ERP Deployment', subtitle: 'DevOps Engineering at EvoTech', category: 'Professional experience', description: 'During my internship at EvoTech IT Services, I supported staging and deployment activities across ERP projects using GitHub, Hostinger, PHP/MySQL and REST APIs. Work included database connectivity checks, API testing, backup and restoration testing, deployment verification, troubleshooting, technical documentation, and rollback and recovery procedures.', tags: ['Staging & verification', 'Backup & recovery', 'Deployment troubleshooting'], url: null, media: '/images/projects/erp-deployment.webp', visual: 'erp' },
  ],
  contactCopy: 'Have an opportunity in software, AI or DevOps? I’m looking to contribute, keep learning and build thoughtful systems with a team.',
} as const;
export const navigation = ['home', 'about', 'services', 'projects', 'contact'] as const;
