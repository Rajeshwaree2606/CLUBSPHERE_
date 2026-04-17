export const initialClubs = [
  { 
    id: '1', 
    name: 'Media Club', 
    description: 'Tell the Polaris story - one frame at a time.\nIf something memorable happens on campus, this team captures it.',
    icon: 'camera-alt',
    adminId: 'admin1', 
    memberCount: 120, 
    joined: false 
  },
  { 
    id: '2', 
    name: 'Tech Club (Tesseract)', 
    description: 'Where curiosity becomes code - and code becomes something real.\nHackathons, workshops, and real-world building.',
    icon: 'laptop-code',
    adminId: 'admin1', 
    memberCount: 150, 
    joined: true 
  },
  { 
    id: '3', 
    name: 'Sports & E-Sports Club', 
    description: 'Compete hard. Play often. Show up for each other.',
    icon: 'trophy',
    adminId: 'admin2', 
    memberCount: 200, 
    joined: false 
  },
  { 
    id: '4', 
    name: 'Entrepreneurship Club', 
    description: 'From idea to pitch - think like a builder and create impact.',
    icon: 'lightbulb',
    adminId: 'admin2', 
    memberCount: 85, 
    joined: false 
  },
  { 
    id: '5', 
    name: 'Student Council', 
    description: 'Your voice on campus, formalised.',
    icon: 'users',
    adminId: 'admin1', 
    memberCount: 45, 
    joined: false 
  },
  { 
    id: '6', 
    name: 'Events OG OC', 
    description: 'The team behind Polaris\'s biggest events and experiences.',
    icon: 'star',
    adminId: 'admin3', 
    memberCount: 60, 
    joined: false 
  }
];

export const initialEvents = [
  { id: '101', title: 'Hackathon 2026', clubId: '1', date: '2026-05-15', time: '10:00 AM', venue: 'Main Auditorium', maxParticipants: 200, description: '24-hour coding competition' },
  { id: '102', title: 'Photo Walk', clubId: '2', date: '2026-04-10', time: '04:00 PM', venue: 'Campus Gardens', maxParticipants: 30, description: 'Learn outdoor photography.' }
];

export const initialNotifications = [
  { id: '201', title: 'Welcome to Campus Clubs!', message: 'Explore and join clubs that match your interests.', date: '2026-04-01' },
  { id: '202', title: 'Coding Club Meeting', message: 'First meeting this Friday at 5 PM.', date: '2026-04-02' }
];

export const initialBudgets = [
  { id: '301', title: 'University Grant', amount: 5000, type: 'income', date: '2026-03-01' },
  { id: '302', title: 'Hackathon Server Costs', amount: 500, type: 'expense', date: '2026-03-15' },
];

export const initialCertificates = [
  { id: '401', eventTitle: 'React Native Workshop', date: '2026-02-20', url: 'https://example.com/cert1.pdf' },
];
