const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User         = require('../models/User');
const ResourceItem = require('../models/ResourceItem');
const Transaction  = require('../models/Transaction');
const Opportunity  = require('../models/Opportunity');
const LocalService = require('../models/LocalService');
const MarketplaceItem = require('../models/MarketplaceItem');
const LostFoundItem   = require('../models/LostFoundItem');
const Club         = require('../models/Club');
const CampusPost   = require('../models/CampusPost');
const Task         = require('../models/Task');
const connectDB    = require('../config/db');

// ─── Dummy image/file URLs ────────────────────────────────────────────────────
const IMG = {
  avatar1: 'https://ui-avatars.com/api/?name=Aryan+Singh&background=6366f1&color=fff&size=200',
  avatar2: 'https://ui-avatars.com/api/?name=Pooja+Sharma&background=ec4899&color=fff&size=200',
  avatar3: 'https://ui-avatars.com/api/?name=Rohan+Gupta&background=10b981&color=fff&size=200',
  avatar4: 'https://ui-avatars.com/api/?name=Neha+Tiwari&background=f59e0b&color=fff&size=200',
  avatar5: 'https://ui-avatars.com/api/?name=Vivek+Joshi&background=3b82f6&color=fff&size=200',
  avatar6: 'https://ui-avatars.com/api/?name=Ritu+Dubey&background=8b5cf6&color=fff&size=200',
  campus1: 'https://picsum.photos/seed/mits1/800/400',
  campus2: 'https://picsum.photos/seed/mits2/800/400',
  item1:   'https://picsum.photos/seed/item1/400/400',
  item2:   'https://picsum.photos/seed/item2/400/400',
  item3:   'https://picsum.photos/seed/item3/400/400',
  pdf:     'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
const daysAgo   = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);

const seed = async () => {
  await connectDB();

  console.log('🌱 Clearing old data...');
  await Promise.all([
    User.deleteMany({}),
    ResourceItem.deleteMany({}),
    Transaction.deleteMany({}),
    Opportunity.deleteMany({}),
    LocalService.deleteMany({}),
    MarketplaceItem.deleteMany({}),
    LostFoundItem.deleteMany({}),
    Club.deleteMany({}),
    CampusPost.deleteMany({}),
    Task.deleteMany({}),
  ]);

  // ── USERS ──────────────────────────────────────────────────────────────────
  console.log('👥 Seeding users...');

  const hashPwd = async (p) => bcrypt.hash(p, 10);

  const adminRaw = {
    name: 'Dr. Suresh Agarwal',
    email: 'admin@mits.ac.in',
    password: await hashPwd('Admin@1234'),
    role: 'admin',
    department: 'Administration',
    branch: 'Admin',
    year: 1,
    state: 'Madhya Pradesh',
    district: 'Gwalior',
    bio: 'Director of MITS Gwalior. Overseeing academic and student affairs.',
    profilePhoto: 'https://ui-avatars.com/api/?name=Suresh+Agarwal&background=1e293b&color=fff&size=200',
  };

  const studentsRaw = [
    {
      name: 'Aryan Singh',
      email: 'aryan@mits.ac.in',
      password: await hashPwd('Student@1234'),
      role: 'student',
      department: 'Engineering',
      branch: 'Computer Science',
      year: 3,
      state: 'Madhya Pradesh',
      district: 'Gwalior',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
      bio: 'CSE 3rd year at MITS Gwalior. Full-stack dev and open source contributor.',
      profilePhoto: IMG.avatar1,
    },
    {
      name: 'Pooja Sharma',
      email: 'pooja@mits.ac.in',
      password: await hashPwd('Student@1234'),
      role: 'student',
      department: 'Engineering',
      branch: 'Electronics & Communication',
      year: 2,
      state: 'Madhya Pradesh',
      district: 'Gwalior',
      skills: ['Python', 'Machine Learning', 'Arduino', 'Embedded Systems'],
      bio: 'ECE 2nd year. Interested in IoT and embedded systems projects.',
      profilePhoto: IMG.avatar2,
    },
    {
      name: 'Rohan Gupta',
      email: 'rohan@mits.ac.in',
      password: await hashPwd('Student@1234'),
      role: 'student',
      department: 'Engineering',
      branch: 'Mechanical Engineering',
      year: 4,
      state: 'Madhya Pradesh',
      district: 'Gwalior',
      skills: ['CAD', 'SolidWorks', 'MATLAB', 'AutoCAD'],
      bio: 'Final year ME student. Passionate about robotics and automation.',
      profilePhoto: IMG.avatar3,
    },
    {
      name: 'Neha Tiwari',
      email: 'neha@mits.ac.in',
      password: await hashPwd('Student@1234'),
      role: 'student',
      department: 'Engineering',
      branch: 'Information Technology',
      year: 1,
      state: 'Madhya Pradesh',
      district: 'Morena',
      skills: ['HTML', 'CSS', 'Python', 'SQL'],
      bio: 'First year IT student. Eager to learn and build cool things.',
      profilePhoto: IMG.avatar4,
    },
    {
      name: 'Vivek Joshi',
      email: 'vivek@mits.ac.in',
      password: await hashPwd('Student@1234'),
      role: 'student',
      department: 'Engineering',
      branch: 'Civil Engineering',
      year: 3,
      state: 'Madhya Pradesh',
      district: 'Gwalior',
      skills: ['AutoCAD', 'STAAD Pro', 'Revit', 'Site Management'],
      bio: 'Civil Engg 3rd year. Dream of designing smart cities.',
      profilePhoto: IMG.avatar5,
    },
    {
      name: 'Ritu Dubey',
      email: 'ritu@mits.ac.in',
      password: await hashPwd('Student@1234'),
      role: 'student',
      department: 'Engineering',
      branch: 'Computer Science',
      year: 2,
      state: 'Madhya Pradesh',
      district: 'Bhind',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Git'],
      bio: 'CSE 2nd year. Backend enthusiast and competitive programmer.',
      profilePhoto: IMG.avatar6,
    },
  ];

  // Insert admin directly (bypass pre-save hook since we already hashed)
  const admin = await User.collection.insertOne({ ...adminRaw, createdAt: new Date(), updatedAt: new Date() });
  const adminId = admin.insertedId;

  const insertedStudents = await User.collection.insertMany(
    studentsRaw.map(s => ({ ...s, connections: [], notifications: [], savedResources: [], savedOpportunities: [], createdAt: new Date(), updatedAt: new Date() }))
  );
  const studentIds = Object.values(insertedStudents.insertedIds);
  const [s1, s2, s3, s4, s5, s6] = studentIds; // Aryan is s1 — finance/tasks hero

  console.log('✅ Users seeded');

  // ── TASKS for Aryan (s1) ──────────────────────────────────────────────────
  console.log('✅ Seeding tasks...');
  await Task.insertMany([
    { userId: s1, title: 'Complete DSA Assignment', description: 'Solve 20 problems on trees and graphs', subject: 'Data Structures', deadline: daysAhead(2), priority: 'high', status: 'in-progress' },
    { userId: s1, title: 'Submit DBMS Lab File', description: 'Complete all 10 experiments and get signed', subject: 'DBMS Lab', deadline: daysAhead(4), priority: 'high', status: 'pending' },
    { userId: s1, title: 'Prepare for OS Mid-Sem', description: 'Revise process management and memory chapter', subject: 'Operating Systems', deadline: daysAhead(6), priority: 'high', status: 'pending' },
    { userId: s1, title: 'Complete React Project', description: 'Finish the college management frontend for minor project', subject: 'Web Development', deadline: daysAhead(10), priority: 'medium', status: 'in-progress' },
    { userId: s1, title: 'Attend Coding Club Session', description: 'Weekly DSA session by seniors', subject: 'Extra Curricular', deadline: daysAhead(1), priority: 'low', status: 'pending' },
    { userId: s1, title: 'Submit CN Assignment', description: 'Write answers for unit 3 computer networks', subject: 'Computer Networks', deadline: daysAhead(3), priority: 'medium', status: 'pending' },
    { userId: s1, title: 'Read Chapter 5 - Compiler Design', description: 'Syntax directed translation and SDT schemes', subject: 'Compiler Design', deadline: daysAhead(5), priority: 'low', status: 'pending' },
    { userId: s1, title: 'Push Project to GitHub', description: 'Push latest changes to the team repo before code freeze', subject: 'Minor Project', deadline: daysAhead(1), priority: 'high', status: 'completed' },
    { userId: s1, title: 'Solve Codeforces Div 2', description: 'Participate in Sunday round and solve at least 3 problems', subject: 'Competitive Programming', deadline: daysAhead(3), priority: 'medium', status: 'completed' },
    { userId: s1, title: 'Apply for Google STEP Internship', description: 'Submit resume and SOP before deadline', subject: 'Career', deadline: daysAhead(7), priority: 'high', status: 'pending' },
    { userId: s1, title: 'Revise Software Engineering chapter', description: 'SDLC models and agile for exams', subject: 'Software Engineering', deadline: daysAhead(8), priority: 'medium', status: 'pending' },
    { userId: s1, title: 'Create PPT for seminar', description: 'Topic: Cloud Computing and Serverless Architecture', subject: 'Technical Seminar', deadline: daysAhead(9), priority: 'medium', status: 'in-progress' },
    { userId: s1, title: 'Pay mess fees', description: 'Pay the monthly mess fee before 5th', subject: 'Personal', deadline: daysAhead(0), priority: 'high', status: 'completed' },
    { userId: s1, title: 'Fix bugs in backend API', description: 'Resolve image upload issue and auth token expiry', subject: 'Web Development', deadline: daysAhead(2), priority: 'high', status: 'in-progress' },
    { userId: s1, title: 'Watch NPTEL lecture series', description: 'Complete week 6 and 7 of ML course before quiz', subject: 'Machine Learning', deadline: daysAhead(12), priority: 'low', status: 'pending' },
  ]);
  console.log('✅ Tasks seeded');

  // ── TRANSACTIONS for Aryan (s1) — past 3 months for good graph ────────────
  console.log('💰 Seeding transactions...');
  const txns = [];
  const months = [2, 1, 0]; // 2 months ago, 1 month ago, current month
  for (const mOffset of months) {
    const mo = (d, day) => new Date(new Date().getFullYear(), new Date().getMonth() - mOffset, day);
    txns.push(
      // Income
      { user: s1, type: 'income',  amount: 12000, description: 'Monthly allowance from home', category: 'other', date: mo(0, 1) },
      { user: s1, type: 'income',  amount: 3500,  description: 'Freelance web project payment', category: 'other', date: mo(0, 18) },
      { user: s1, type: 'income',  amount: 2000,  description: 'Tutoring juniors - Python batch', category: 'other', date: mo(0, 25) },
      // Expenses
      { user: s1, type: 'expense', amount: 3500,  description: 'PG rent - Shivaji Nagar', category: 'rent', date: mo(0, 2) },
      { user: s1, type: 'expense', amount: 2200,  description: 'Monthly mess fees', category: 'food', date: mo(0, 3) },
      { user: s1, type: 'expense', amount: 350,   description: 'City bus pass', category: 'transport', date: mo(0, 5) },
      { user: s1, type: 'expense', amount: 480,   description: 'Textbooks from Hazira market', category: 'stationery', date: mo(0, 8) },
      { user: s1, type: 'expense', amount: 650,   description: 'Movie at Cinepolis with friends', category: 'entertainment', date: mo(0, 14) },
      { user: s1, type: 'expense', amount: 120,   description: 'Pani puri & snacks near gate', category: 'food', date: mo(0, 16) },
      { user: s1, type: 'expense', amount: 900,   description: 'Bought Arduino kit for project', category: 'stationery', date: mo(0, 20) },
      { user: s1, type: 'expense', amount: 200,   description: 'Auto from station to college', category: 'transport', date: mo(0, 22) },
    );
  }
  await Transaction.insertMany(txns);
  console.log('✅ Transactions seeded');

  // ── OPPORTUNITIES ─────────────────────────────────────────────────────────
  console.log('🎯 Seeding opportunities...');
  await Opportunity.insertMany([
    {
      title: 'Google Summer of Code 2025',
      description: 'Work with open source organizations under Google mentorship for 3 months. Stipend provided. Perfect for CSE/IT students with strong coding skills.',
      type: 'internship',
      organization: 'Google',
      applyLink: 'https://summerofcode.withgoogle.com',
      startDate: daysAhead(60),
      lastDate: daysAhead(20),
      postedBy: adminId,
      tags: ['open source', 'Google', 'internship', 'coding'],
      isActive: true,
    },
    {
      title: 'TCS Smart Hiring 2025 - Off Campus',
      description: 'TCS is hiring fresh engineering graduates for System Engineer and Digital roles. Apply with CGPA 6.0+. Training provided in Chennai or Pune.',
      type: 'job',
      organization: 'Tata Consultancy Services',
      applyLink: 'https://careers.tcs.com',
      lastDate: daysAhead(15),
      postedBy: adminId,
      tags: ['TCS', 'job', 'placement', 'fresher', 'IT'],
      isActive: true,
    },
    {
      title: 'Smart India Hackathon 2025 - Internal Round',
      description: 'MITS Gwalior is conducting its internal SIH round. Form teams of 6 and submit problems in healthcare, agriculture, or smart city domain. Top 2 teams represent college.',
      type: 'hackathon',
      organization: 'MITS Gwalior / AICTE',
      applyLink: 'https://sih.gov.in',
      startDate: daysAhead(30),
      lastDate: daysAhead(10),
      postedBy: adminId,
      tags: ['SIH', 'hackathon', 'MITS', 'Gwalior', 'innovation'],
      isActive: true,
    },
    {
      title: 'MP Government Scholarship - Gaon Ki Beti',
      description: 'Scholarship for girl students scoring 60%+ in 12th from MP. Rs 500/month per girl student studying in college. Simple online application on MP Scholarship portal.',
      type: 'scholarship',
      organization: 'Government of Madhya Pradesh',
      applyLink: 'http://scholarshipportal.mp.nic.in',
      lastDate: daysAhead(45),
      postedBy: adminId,
      tags: ['scholarship', 'MP government', 'girls', 'financial aid'],
      isActive: true,
    },
    {
      title: 'Infosys Springboard Internship',
      description: '2-month virtual internship in web development, data science, or cloud computing. Certificate provided. Open to 2nd and 3rd year students.',
      type: 'internship',
      organization: 'Infosys',
      applyLink: 'https://infosys.com/careers',
      startDate: daysAhead(40),
      lastDate: daysAhead(12),
      postedBy: s1,
      tags: ['Infosys', 'internship', 'virtual', 'web dev', 'data science'],
      isActive: true,
    },
    {
      title: 'CodeChef Gwalior Chapter - Monthly Contest',
      description: 'Monthly competitive programming contest open to all MITS students. Top 3 get cash prizes and CodeChef goodies. Register on the link below.',
      type: 'competition',
      organization: 'CodeChef - MITS Chapter',
      applyLink: 'https://www.codechef.com',
      startDate: daysAhead(7),
      lastDate: daysAhead(5),
      postedBy: s1,
      tags: ['competitive programming', 'CodeChef', 'Gwalior', 'contest'],
      isActive: true,
    },
    {
      title: 'AWS Cloud Quest Scholarship',
      description: 'Free AWS Certified Cloud Practitioner certification course and exam voucher for students. Complete 40h of learning and get certified for free.',
      type: 'scholarship',
      organization: 'Amazon Web Services',
      applyLink: 'https://aws.amazon.com/training',
      lastDate: daysAhead(30),
      postedBy: adminId,
      tags: ['AWS', 'cloud', 'certification', 'free', 'scholarship'],
      isActive: true,
    },
    {
      title: 'Wipro WILP - Work Integrated Learning',
      description: 'Get a job at Wipro while continuing BE/BTech. Only for 3rd year students. Salary + degree together. Limited seats per college.',
      type: 'job',
      organization: 'Wipro Technologies',
      applyLink: 'https://careers.wipro.com',
      lastDate: daysAhead(25),
      postedBy: adminId,
      tags: ['Wipro', 'WILP', 'job', 'work integrated learning'],
      isActive: true,
    },
  ]);
  console.log('✅ Opportunities seeded');

  // ── LOCAL SERVICES (near Gwalior / MITS) ─────────────────────────────────
  console.log('🏠 Seeding local services...');
  await LocalService.insertMany([
    {
      name: 'Shivaji Nagar Boys PG',
      type: 'pg',
      description: 'Well-furnished PG near MITS college with attached bathrooms, WiFi, and home-cooked meals. 5 min walk from college.',
      address: 'Plot 14, Shivaji Nagar, Near MITS Gate 1, Gwalior - 474005',
      cost: '₹3800/month with meals, ₹2500/month without meals',
      facilities: ['WiFi', 'Hot Water', 'Meals', 'Washing Machine', '24hr Security', 'Study Room'],
      rating: 4.3,
      contactNumber: '+91-9425012345',
      location: { type: 'Point', coordinates: [78.1828, 26.2150] },
      photos: [IMG.campus1],
      postedBy: adminId,
    },
    {
      name: 'Annapurna Mess & Tiffin Center',
      type: 'mess',
      description: 'Popular mess near MITS Gwalior. Home-style veg food. Special student monthly package available at just Rs 1800/month.',
      address: 'Near MITS Back Gate, Gole Ka Mandir Road, Gwalior',
      cost: '₹1800/month (veg thali), ₹60/meal',
      facilities: ['Veg Only', 'Monthly Package', 'Tiffin Delivery', 'Clean Kitchen'],
      rating: 4.6,
      contactNumber: '+91-9871234567',
      location: { type: 'Point', coordinates: [78.1842, 26.2138] },
      photos: [],
      postedBy: adminId,
    },
    {
      name: 'Gwalior Boys Hostel - Block C',
      type: 'hostel',
      description: 'College approved private hostel. Triple sharing rooms with attached bathroom. Walking distance from MITS.',
      address: 'Hostel Colony, Thatipur, Gwalior - 474011',
      cost: '₹4500/month (triple sharing)',
      facilities: ['WiFi', 'Mess', 'Laundry', 'Library Room', 'Sports Area', 'Medical Room'],
      rating: 4.0,
      contactNumber: '+91-7512367890',
      location: { type: 'Point', coordinates: [78.1797, 26.2178] },
      photos: [IMG.campus2],
      postedBy: adminId,
    },
    {
      name: 'SK Electronics & Hardware - Hazira',
      type: 'hardware',
      description: 'Best place in Gwalior for Arduino, Raspberry Pi, sensors, PCB, and all electronics components. Student discounts on bulk orders.',
      address: 'Shop 8, Hazira Market, Gwalior - 474001',
      cost: 'Component prices vary',
      facilities: ['Arduino', 'Raspberry Pi', 'PCB', 'Sensors', 'Student Discount', 'Project Help'],
      rating: 4.5,
      contactNumber: '+91-9760001234',
      location: { type: 'Point', coordinates: [78.1641, 26.2124] },
      photos: [],
      postedBy: adminId,
    },
    {
      name: 'Raj Stationery & Xerox',
      type: 'stationery',
      description: 'Printouts, spiral binding, lab files, notebooks and all stationery at rock-bottom prices. Right at MITS main gate.',
      address: 'Shop 2, MITS Main Gate Market, Gole Ka Mandir, Gwalior',
      cost: 'Printout: ₹1/page B&W, ₹5/page colour',
      facilities: ['Printout', 'Xerox', 'Binding', 'Lab Files', 'Notebooks', 'Pen Drive Sale'],
      rating: 4.8,
      contactNumber: '+91-9425098765',
      location: { type: 'Point', coordinates: [78.1835, 26.2148] },
      photos: [],
      postedBy: adminId,
    },
  ]);
  console.log('✅ Local services seeded');

  // ── RESOURCES (notes) ─────────────────────────────────────────────────────
  console.log('📚 Seeding resources...');
  await ResourceItem.insertMany([
    {
      title: 'Data Structures & Algorithms - Complete Notes',
      description: 'Arrays, linked lists, stacks, queues, trees, graphs, and DP. Handwritten + typed combined notes from 3rd year CSE seniors.',
      type: 'notes',
      subject: 'Data Structures',
      department: 'Engineering',
      year: 2,
      fileUrl: IMG.pdf,
      uploadedBy: s1,
      tags: ['DSA', 'algorithms', 'CS'],
      downloadCount: 312,
    },
    {
      title: 'DBMS Previous Year Questions 2020-2024',
      description: 'Compiled PYQs for DBMS with answers. All RGPV question papers from 2020 to 2024 in one PDF.',
      type: 'pyq',
      subject: 'Database Management Systems',
      department: 'Engineering',
      year: 3,
      fileUrl: IMG.pdf,
      uploadedBy: s2,
      tags: ['DBMS', 'SQL', 'RGPV', 'PYQ'],
      downloadCount: 218,
    },
    {
      title: 'Machine Learning - Unit Wise Notes',
      description: 'All 5 units of ML covered with diagrams. Includes regression, classification, neural networks, SVM, and clustering.',
      type: 'department_notes',
      subject: 'Machine Learning',
      department: 'Engineering',
      year: 4,
      fileUrl: IMG.pdf,
      uploadedBy: s2,
      tags: ['ML', 'AI', 'data science'],
      downloadCount: 445,
    },
    {
      title: 'GATE CS 2024 - Full Paper with Solutions',
      description: 'Official GATE Computer Science 2024 paper with detailed solutions and topic-wise analysis.',
      type: 'gate',
      subject: 'Computer Science',
      department: 'Engineering',
      year: 4,
      fileUrl: IMG.pdf,
      uploadedBy: adminId,
      tags: ['GATE', 'CS', '2024'],
      downloadCount: 980,
    },
    {
      title: 'Operating Systems - Handwritten Notes (MITS)',
      description: 'OS notes specifically following MITS Gwalior syllabus. Process, threads, scheduling, memory, file systems.',
      type: 'notes',
      subject: 'Operating Systems',
      department: 'Engineering',
      year: 3,
      fileUrl: IMG.pdf,
      uploadedBy: s6,
      tags: ['OS', 'MITS', 'Gwalior'],
      downloadCount: 178,
    },
    {
      title: 'Computer Networks - Unit 3 & 4 Notes',
      description: 'Transport layer, TCP/UDP, network layer, routing protocols. Easy language with diagrams.',
      type: 'notes',
      subject: 'Computer Networks',
      department: 'Engineering',
      year: 3,
      fileUrl: IMG.pdf,
      uploadedBy: s1,
      tags: ['CN', 'networking', 'TCP/IP'],
      downloadCount: 134,
    },
    {
      title: 'React.js + Node.js Full Stack Guide',
      description: 'Complete development guide from zero to deployment. Covers React hooks, Context API, Express, MongoDB, JWT auth.',
      type: 'course_resource',
      subject: 'Web Development',
      department: 'Engineering',
      year: 3,
      fileUrl: IMG.pdf,
      uploadedBy: s1,
      tags: ['React', 'Node', 'MERN', 'web dev'],
      downloadCount: 267,
    },
    {
      title: 'Engineering Mathematics PYQ 2019-2024',
      description: 'Maths PYQ for all branches. Covers calculus, matrices, Laplace, Fourier series, and probability.',
      type: 'pyq',
      subject: 'Engineering Mathematics',
      department: 'Engineering',
      year: 1,
      fileUrl: IMG.pdf,
      uploadedBy: s4,
      tags: ['maths', 'calculus', 'RGPV', 'PYQ'],
      downloadCount: 543,
    },
  ]);
  console.log('✅ Resources seeded');

  // ── LOST & FOUND ──────────────────────────────────────────────────────────
  console.log('🔍 Seeding Lost & Found...');
  await LostFoundItem.insertMany([
    // Resolved
    {
      title: 'Lost - Black JBL Earphones',
      description: 'Lost my JBL TWS earphones near the library reading hall. Black case with a small star sticker. Very dear to me.',
      status: 'lost',
      locationLost: 'Central Library, MITS Gwalior - 2nd Floor Reading Hall',
      contactInfo: 'aryan@mits.ac.in | 9876543210',
      isResolved: true,
      images: [IMG.item1],
      postedBy: s1,
      createdAt: daysAgo(15),
    },
    {
      title: 'Found - Casio Scientific Calculator',
      description: 'Found a Casio FX-991EX calculator on a bench near Lab Block B. Name written - "Rahul" on the back.',
      status: 'found',
      locationLost: 'Lab Block B, Near Bench 4, MITS Gwalior',
      contactInfo: 'pooja@mits.ac.in | 8765432109',
      isResolved: true,
      images: [],
      postedBy: s2,
      createdAt: daysAgo(20),
    },
    {
      title: 'Found - MITS Student ID Card',
      description: 'Found an ID card near the main canteen. Name: Priya Kumari, Roll: 0901CS211012. Please contact to claim.',
      status: 'found',
      locationLost: 'Main Canteen Area, MITS Campus',
      contactInfo: 'rohan@mits.ac.in | 7654321098',
      isResolved: true,
      images: [],
      postedBy: s3,
      createdAt: daysAgo(10),
    },
    // Active - Lost
    {
      title: 'Lost - Blue Milton Water Bottle (1L)',
      description: 'Lost my blue 1L Milton bottle near the gym area. Has "VJ" written in black marker on the lid. Please contact if found.',
      status: 'lost',
      locationLost: 'College Gymnasium, MITS Gwalior',
      contactInfo: 'vivek@mits.ac.in | 6543210987',
      isResolved: false,
      images: [IMG.item2],
      postedBy: s5,
      createdAt: daysAgo(3),
    },
    {
      title: 'Lost - Charger Adapter (Type-C)',
      description: 'Lost my Samsung 25W Type-C fast charger in the CS lab during practicals. Grey coloured. Please check if you picked it by mistake.',
      status: 'lost',
      locationLost: 'CS Lab 3, Department Block, MITS Gwalior',
      contactInfo: 'ritu@mits.ac.in | 9432100001',
      isResolved: false,
      images: [],
      postedBy: s6,
      createdAt: daysAgo(2),
    },
    {
      title: 'Lost - Black Leather Wallet',
      description: 'Lost wallet near the college bus stop. Contains Aadhar card, college ID, and some cash. No questions asked, please return.',
      status: 'lost',
      locationLost: 'College Bus Stop, MITS Main Gate, Gole Ka Mandir',
      contactInfo: 'aryan@mits.ac.in | 9876543210',
      isResolved: false,
      images: [],
      postedBy: s1,
      createdAt: daysAgo(1),
    },
    {
      title: 'Lost - Engineering Drawing Instruments Box',
      description: 'Lost my Staedtler instruments box during civil drawing class. Has name "Neha Tiwari" written inside. Very important for practicals.',
      status: 'lost',
      locationLost: 'Drawing Hall, Ground Floor, MITS Gwalior',
      contactInfo: 'neha@mits.ac.in | 8901234567',
      isResolved: false,
      images: [IMG.item3],
      postedBy: s4,
      createdAt: daysAgo(5),
    },
    // Active - Found
    {
      title: 'Found - Purple Umbrella',
      description: 'Found a purple colour umbrella in front of the girls hostel. Seems to be left after recent rains.',
      status: 'found',
      locationLost: 'Girls Hostel Gate, MITS Gwalior',
      contactInfo: 'neha@mits.ac.in | 8901234567',
      isResolved: false,
      images: [],
      postedBy: s4,
      createdAt: daysAgo(1),
    },
    {
      title: 'Found - Red Notebook (Algorithms)',
      description: 'Found a red notebook with "Algorithms" written on cover near the library exit. Hand-written notes inside.',
      status: 'found',
      locationLost: 'Library Exit, Near Magazine Section, MITS',
      contactInfo: 'pooja@mits.ac.in | 8765432109',
      isResolved: false,
      images: [],
      postedBy: s2,
      createdAt: daysAgo(4),
    },
    {
      title: 'Found - Power Bank (Realme)',
      description: 'White Realme 10000mAh power bank found in Seminar Hall 2 after the Thursday guest lecture. Claim it from the security desk.',
      status: 'found',
      locationLost: 'Seminar Hall 2, Academic Block, MITS Gwalior',
      contactInfo: 'vivek@mits.ac.in | 6543210987',
      isResolved: false,
      images: [IMG.item1],
      postedBy: s5,
      createdAt: daysAgo(2),
    },
  ]);
  console.log('✅ Lost & Found seeded');

  // ── MARKETPLACE ───────────────────────────────────────────────────────────
  console.log('🛒 Seeding marketplace...');
  await MarketplaceItem.insertMany([
    {
      title: 'B.S. Grewal Engineering Mathematics',
      description: '44th Edition. Used for 1 semester. Good condition, some pencil marks. Perfect for 1st and 2nd year students.',
      category: 'book',
      price: 280,
      isFree: false,
      condition: 'good',
      images: [],
      seller: s3,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'rohan@mits.ac.in | Call 9876543210',
    },
    {
      title: 'Casio FX-991EX Scientific Calculator',
      description: 'Used for 2 semesters. All functions working. Good condition. Perfect for engineering maths and physics.',
      category: 'calculator',
      price: 700,
      isFree: false,
      condition: 'good',
      images: [],
      seller: s6,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'ritu@mits.ac.in',
    },
    {
      title: 'NodeMCU ESP8266 + DHT11 Sensor Kit',
      description: 'Complete IoT starter kit. New condition, bought extra for project. Unused. Great for mini-projects.',
      category: 'project_component',
      price: 350,
      isFree: false,
      condition: 'new',
      images: [IMG.item3],
      seller: s2,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'pooja@mits.ac.in | 8765432109',
    },
    {
      title: 'Study Table Lamp',
      description: 'LED study lamp with USB charging port. Leaving hostel so selling. Works perfectly.',
      category: 'hostel_item',
      price: 250,
      isFree: false,
      condition: 'good',
      images: [],
      seller: s3,
      status: 'sold',
      section: 'secondhand',
      contactInfo: 'rohan@mits.ac.in',
    },
    {
      title: 'Arduino Uno Starter Kit',
      description: 'Brand new Arduino Uno kit from SK Electronics Hazira. Includes breadboard, jumpers, LEDs, resistors.',
      category: 'project_component',
      price: 750,
      isFree: false,
      condition: 'new',
      images: [],
      seller: s1,
      status: 'available',
      section: 'local_shop',
      shopAddress: 'SK Electronics, Shop 8, Hazira Market, Gwalior',
      contactInfo: 'aryan@mits.ac.in',
    },
    {
      title: 'C Programming - Balagurusamy (Free)',
      description: 'Old edition of Balagurusamy C programming. Free to take, just reach me on campus.',
      category: 'book',
      price: 0,
      isFree: true,
      condition: 'fair',
      images: [],
      seller: s4,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'neha@mits.ac.in',
    },
  ]);
  console.log('✅ Marketplace seeded');

  // ── CLUBS ─────────────────────────────────────────────────────────────────
  console.log('🎭 Seeding clubs...');
  const clubs = await Club.insertMany([
    {
      name: 'MITS Coding Club',
      description: 'The official coding community of MITS Gwalior. We conduct weekly DSA sessions, hackathons, and competitive programming contests.',
      category: 'technical',
      members: [s1, s2, s4, s6],
      recruitmentOpen: true,
      recruitmentStartDate: new Date(),
      recruitmentEndDate: daysAhead(30),
      contactEmail: 'codingclub@mits.ac.in',
      createdBy: adminId,
      logo: IMG.avatar1,
    },
    {
      name: 'Rangmanch Cultural Club',
      description: 'Cultural events, dance, drama, and music at MITS. We organize college cultural fest RANGOTSAV every year.',
      category: 'cultural',
      members: [s3, s4, s5],
      recruitmentOpen: true,
      recruitmentStartDate: new Date(),
      recruitmentEndDate: daysAhead(20),
      contactEmail: 'rangmanch@mits.ac.in',
      createdBy: adminId,
    },
    {
      name: 'MITS Sports Club',
      description: 'Representing MITS in inter-college and university level sports events. Cricket, football, badminton and more.',
      category: 'sports',
      members: [s3, s5],
      recruitmentOpen: false,
      contactEmail: 'sports@mits.ac.in',
      createdBy: adminId,
    },
    {
      name: 'IEEE Student Branch - MITS',
      description: 'IEEE student chapter at MITS Gwalior. Technical workshops, paper presentations, and national competitions.',
      category: 'technical',
      members: [s1, s2, s6],
      recruitmentOpen: true,
      recruitmentEndDate: daysAhead(15),
      contactEmail: 'ieee@mits.ac.in',
      createdBy: adminId,
    },
    {
      name: 'NSS Unit - MITS Gwalior',
      description: 'National Service Scheme at MITS. Blood donation camps, cleanliness drives, rural outreach in villages near Gwalior.',
      category: 'social',
      members: [s4, s5, s6],
      recruitmentOpen: true,
      contactEmail: 'nss@mits.ac.in',
      createdBy: adminId,
    },
  ]);
  const [codingClub, culturalClub, sportsClub, ieeeClub, nssClub] = clubs;

  // ── CAMPUS POSTS ──────────────────────────────────────────────────────────
  console.log('📢 Seeding campus posts...');
  await CampusPost.insertMany([
    {
      title: 'Mid-Semester Examination Schedule - 2025',
      content: 'The mid-semester examination timetable for April 2025 has been released by the Examination Cell. All students are requested to check the official MITS portal (mits.ac.in) for department-wise schedules. Exams begin from 14th April.',
      type: 'announcement',
      postedBy: adminId,
      images: [],
      likes: [s1, s2, s3, s4, s5, s6],
      comments: [
        { user: s1, text: 'Finally! Please also upload the syllabus coverage list.' },
        { user: s2, text: 'Thanks for the update sir 🙏' },
        { user: s4, text: 'Is the practical exam schedule out too?' },
      ],
    },
    {
      title: 'TechFiesta 2025 - Annual Tech Fest Registration Open!',
      content: 'MITS Coding Club presents TechFiesta 2025! 🎉 Events include:\n• 24-hr Hackathon with ₹50,000 prize pool\n• Competitive Programming Contest\n• Tech Quiz\n• Project Exhibition\n\nVenue: Main Auditorium & CS Lab Block\nDate: 25-26 April 2025\n\nRegister at: techfiesta.mits.ac.in\nLast date: 20 April 2025',
      type: 'event',
      club: codingClub._id,
      postedBy: s1,
      eventDate: daysAhead(20),
      eventVenue: 'Main Auditorium, MITS Gwalior',
      images: [IMG.campus1],
      likes: [s2, s3, s4, s5, s6],
      comments: [
        { user: s2, text: 'Super excited! Already formed our team 🔥' },
        { user: s3, text: 'Will robotics projects also be accepted in exhibition?' },
        { user: s1, text: 'Yes Rohan! Multi-domain projects welcome.' },
        { user: s6, text: 'Is there a solo participation option for coding contest?' },
      ],
    },
    {
      title: 'IEEE Workshop: Introduction to VLSI Design',
      content: 'IEEE Student Branch MITS is organizing a 2-day workshop on VLSI Design using Cadence tools.\n\nTopics covered:\n✅ Digital circuit design\n✅ Logic synthesis\n✅ Cadence Virtuoso basics\n\nDate: 18-19 April | Venue: ECE Lab, 2nd Floor\nFree for IEEE members, ₹100 for others.\nContact: ieee@mits.ac.in',
      type: 'event',
      club: ieeeClub._id,
      postedBy: s2,
      eventDate: daysAhead(13),
      eventVenue: 'ECE Lab, 2nd Floor, MITS',
      images: [],
      likes: [s1, s4, s6],
      comments: [
        { user: s1, text: 'Is this for 2nd year students also?' },
        { user: s2, text: 'Yes, open to all years!' },
      ],
    },
    {
      title: 'MITS Coding Club: Recruitment for 2025-26 Open!',
      content: 'We are recruiting fresh members for MITS Coding Club!\n\nWhat we offer:\n🔹 Weekly DSA sessions by seniors\n🔹 Mentorship for competitive programming\n🔹 Access to paid coding platforms\n🔹 Team formation for SIH & hackathons\n\nEligibility: Any branch, Any year. Just a love for coding!\n\nFill the form: forms.mits.ac.in/codingclub\nLast Date: 15 April 2025',
      type: 'recruitment',
      club: codingClub._id,
      postedBy: s1,
      images: [],
      likes: [s4, s6, s5],
      comments: [
        { user: s4, text: 'Filled the form! Hope I get selected 😊' },
      ],
    },
    {
      title: 'NSS Blood Donation Camp - 10 April 2025',
      content: 'NSS Unit MITS is organizing a Blood Donation Camp in collaboration with JAH Hospital Gwalior.\n\n📅 Date: 10 April 2025\n🕙 Time: 9 AM - 2 PM\n📍 Venue: MITS Seminar Hall\n\nDonating blood saves lives. All healthy students above 18 can donate. Free health check-up & certificate provided.\n\nRegister with NSS desk outside admin block.',
      type: 'event',
      club: nssClub._id,
      postedBy: s5,
      eventDate: daysAhead(5),
      eventVenue: 'Seminar Hall, MITS Gwalior',
      images: [],
      likes: [s1, s2, s3, s4, s6],
      comments: [
        { user: s6, text: 'Will definitely come! 💉' },
        { user: s3, text: 'Great initiative 👏' },
        { user: s2, text: 'Registering today!' },
      ],
    },
    {
      title: 'Rangotsav 2025 - Cultural Fest Coming Soon!',
      content: 'MITS Gwalior\'s biggest cultural extravaganza - RANGOTSAV 2025 is here! 🎭🎶\n\nEvents include:\n🎤 Solo & Group Singing\n💃 Classical & Western Dance\n🎭 Nukkad Natak & Skit\n🎨 Fine Arts Exhibition\n\nDate: 2-3 May 2025 | Open to all colleges!\n\nPrize money worth ₹1 Lakh. Guest performers from Bollywood.\nStay tuned for updates!',
      type: 'event',
      club: culturalClub._id,
      postedBy: s3,
      eventDate: daysAhead(27),
      eventVenue: 'Open Air Theatre & Main Auditorium, MITS',
      images: [IMG.campus2],
      likes: [s1, s2, s4, s5, s6],
      comments: [
        { user: s4, text: 'Can\'t wait! Preparing for the dance event 💃' },
        { user: s5, text: 'The guest performer announcement is making me excited!' },
      ],
    },
    {
      title: 'New Canteen Menu & Timings Update',
      content: 'The college canteen has updated its menu and timings for the summer semester.\n\n⏰ New Timings:\n• Breakfast: 7:30 AM - 9:30 AM\n• Lunch: 12 PM - 2:30 PM\n• Snacks: 4 PM - 6 PM\n• Dinner: 7:30 PM - 9 PM\n\n🍽️ New items added: Rajma Chawal, South Indian Combo, Fresh Juice Counter\n\nAll prices remain student-friendly. Keep the canteen clean!',
      type: 'announcement',
      postedBy: adminId,
      images: [],
      likes: [s1, s2, s3, s4, s5, s6],
      comments: [
        { user: s1, text: 'Finally rajma chawal! Best update of the year 😂' },
        { user: s6, text: 'The fresh juice counter is a great idea in summer!' },
      ],
    },
    {
      title: 'Inter-College Cricket Tournament - March for MITS!',
      content: 'MITS Sports Club is proud to announce that our cricket team has qualified for the RGPV Inter-college Tournament 2025!\n\n🏆 Tournament: RGPV Sports Meet 2025\n📅 Dates: 22-24 April 2025\n📍 Venue: LNCT Campus, Bhopal\n\nCome support our boys! Let\'s bring the trophy home 🏏',
      type: 'announcement',
      club: sportsClub._id,
      postedBy: s5,
      images: [],
      likes: [s1, s2, s3, s4, s6],
    },
  ]);
  console.log('✅ Campus posts seeded');

  // ── CONNECTIONS (social graph) ─────────────────────────────────────────────
  console.log('🤝 Setting up social connections...');
  // Aryan connected with Pooja and Ritu (accepted)
  await User.updateOne({ _id: s1 }, {
    $push: {
      connections: [
        { user: s2, status: 'accepted' },
        { user: s6, status: 'accepted' },
        { user: s3, status: 'pending' },
      ],
    },
  });
  await User.updateOne({ _id: s2 }, { $push: { connections: [{ user: s1, status: 'accepted' }] } });
  await User.updateOne({ _id: s6 }, { $push: { connections: [{ user: s1, status: 'accepted' }] } });
  await User.updateOne({ _id: s3 }, { $push: { connections: [{ user: s1, status: 'pending' }] } });
  console.log('✅ Connections seeded');

  // ── DONE ──────────────────────────────────────────────────────────────────
  console.log('\n✅ ============ DATABASE SEEDED SUCCESSFULLY ============');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🔐 LOGIN CREDENTIALS');
  console.log('───────────────────────────────────────────────────────');
  console.log('  Admin   : admin@mits.ac.in       | Admin@1234');
  console.log('  Aryan   : aryan@mits.ac.in        | Student@1234  ← main (tasks+finance)');
  console.log('  Pooja   : pooja@mits.ac.in        | Student@1234');
  console.log('  Rohan   : rohan@mits.ac.in        | Student@1234');
  console.log('  Neha    : neha@mits.ac.in         | Student@1234');
  console.log('  Vivek   : vivek@mits.ac.in        | Student@1234');
  console.log('  Ritu    : ritu@mits.ac.in         | Student@1234');
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message || err);
  process.exit(1);
});
