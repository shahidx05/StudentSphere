/**
 * StudentSphere - Database Seed File
 * Run: node seed.js
 * Make sure MONGO_URI is set in .env or update the uri below
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ─── Import Models ────────────────────────────────────────────────────────────
const User = require('../models/User');
const Club = require('../models/Club');
const CampusPost = require('../models/CampusPost');
const ResourceItem = require('../models/ResourceItem');
const LostFoundItem = require('../models/LostFoundItem');
const MarketplaceItem = require('../models/MarketplaceItem');
const Opportunity = require('../models/Opportunity');
const LocalService = require('../models/LocalService');
const Task = require('../models/Task');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentsphere';

// ─── Dummy Image / File URLs (replace with real ones) ─────────────────────────
const DUMMY = {
  avatar: (n) => `https://i.pravatar.cc/150?img=${n}`,
  cover: 'https://placehold.co/1200x400/1a1a2e/white?text=StudentSphere',
  logo: (text) => `https://placehold.co/200x200/6c63ff/white?text=${encodeURIComponent(text)}`,
  image: (text) => `https://placehold.co/800x600/f5f5f5/333?text=${encodeURIComponent(text)}`,
  pdf: (name) => `https://example.com/resources/${name}.pdf`,
};

// ─── Seed Logic ───────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Wipe all collections
  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    CampusPost.deleteMany({}),
    ResourceItem.deleteMany({}),
    LostFoundItem.deleteMany({}),
    MarketplaceItem.deleteMany({}),
    Opportunity.deleteMany({}),
    LocalService.deleteMany({}),
    Task.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  const hashedPass = await bcrypt.hash('password123', 12);

  const usersData = [
    // PRIMARY USER — tasks & transactions will be linked to this one
    {
      name: 'Shahid Khan',
      email: 'shahid@mits.ac.in',
      password: hashedPass,
      role: 'student',
      department: 'Information Technology',
      branch: 'IT',
      year: 2,
      state: 'Madhya Pradesh',
      district: 'Gwalior',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'DSA', 'C++'],
      profilePhoto: DUMMY.avatar(10),
      bio: 'Full-stack dev | LeetCode Knight 🏅 | Building cool stuff at MITS Gwalior',
    },
    // ADMIN
    {
      name: 'Dr. Rajeev Sharma',
      email: 'admin@mits.ac.in',
      password: hashedPass,
      role: 'admin',
      department: 'Computer Science',
      branch: 'CSE',
      year: null,
      state: 'Madhya Pradesh',
      district: 'Gwalior',
      skills: ['Machine Learning', 'Python', 'Research'],
      profilePhoto: DUMMY.avatar(1),
      bio: 'HOD, CSE Department | MITS Gwalior',
    },
    // STUDENTS
    {
      name: 'Priya Gupta',
      email: 'priya@mits.ac.in',
      password: hashedPass,
      role: 'student',
      department: 'Electronics & Communication',
      branch: 'EC',
      year: 3,
      state: 'Madhya Pradesh',
      district: 'Gwalior',
      skills: ['Embedded Systems', 'Arduino', 'Python'],
      profilePhoto: DUMMY.avatar(5),
      bio: 'EC 3rd year | Robotics enthusiast 🤖',
    },
    {
      name: 'Arjun Verma',
      email: 'arjun@mits.ac.in',
      password: hashedPass,
      role: 'student',
      department: 'Mechanical Engineering',
      branch: 'ME',
      year: 4,
      state: 'Uttar Pradesh',
      district: 'Agra',
      skills: ['AutoCAD', 'SolidWorks', 'MATLAB'],
      profilePhoto: DUMMY.avatar(3),
      bio: 'Mech 4th year | Design & Manufacturing',
    },
    {
      name: 'Sneha Mishra',
      email: 'sneha@mits.ac.in',
      password: hashedPass,
      role: 'student',
      department: 'Information Technology',
      branch: 'IT',
      year: 3,
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      skills: ['UI/UX', 'Figma', 'React', 'CSS'],
      profilePhoto: DUMMY.avatar(9),
      bio: 'IT 3rd year | Frontend dev & design nerd 🎨',
    },
    {
      name: 'Rahul Tiwari',
      email: 'rahul@mits.ac.in',
      password: hashedPass,
      role: 'student',
      department: 'Computer Science',
      branch: 'CSE',
      year: 2,
      state: 'Madhya Pradesh',
      district: 'Indore',
      skills: ['Java', 'Spring Boot', 'SQL'],
      profilePhoto: DUMMY.avatar(6),
      bio: 'CSE 2nd year | Backend developer',
    },
    {
      name: 'Anjali Singh',
      email: 'anjali@mits.ac.in',
      password: hashedPass,
      role: 'student',
      department: 'Civil Engineering',
      branch: 'CE',
      year: 1,
      state: 'Rajasthan',
      district: 'Jaipur',
      skills: ['AutoCAD', 'Revit'],
      profilePhoto: DUMMY.avatar(7),
      bio: 'Civil 1st year | Future architect 🏛️',
    },
    {
      name: 'Dev Patel',
      email: 'dev@mits.ac.in',
      password: hashedPass,
      role: 'student',
      department: 'Information Technology',
      branch: 'IT',
      year: 4,
      state: 'Gujarat',
      district: 'Surat',
      skills: ['Flutter', 'Firebase', 'Dart'],
      profilePhoto: DUMMY.avatar(8),
      bio: 'IT Final year | Mobile app dev | Startup enthusiast',
    },
  ];

  const users = await User.insertMany(usersData);
  const [shahid, admin, priya, arjun, sneha, rahul, anjali, dev] = users;
  console.log(`👤 Created ${users.length} users`);

  // ── 2. CLUBS ──────────────────────────────────────────────────────────────
  const clubsData = [
    {
      name: 'CodeCraft Club',
      description:
        'Premier coding club of MITS Gwalior. We conduct weekly contests, DSA sessions, hackathons, and placement prep workshops. Join us to level up your coding game!',
      category: 'technical',
      logo: DUMMY.logo('CC'),
      coverImage: DUMMY.cover,
      members: [shahid._id, rahul._id, dev._id, sneha._id],
      recruitmentOpen: true,
      recruitmentStartDate: new Date('2026-04-10'),
      recruitmentEndDate: new Date('2026-04-30'),
      contactEmail: 'codecraft@mits.ac.in',
      createdBy: admin._id,
    },
    {
      name: 'Robotics & Innovation Society',
      description:
        'We build robots, IoT devices and compete in national robotics competitions. MITS Gwalior chapter of the national robotics league.',
      category: 'technical',
      logo: DUMMY.logo('RIS'),
      coverImage: DUMMY.cover,
      members: [priya._id, arjun._id, rahul._id],
      recruitmentOpen: false,
      contactEmail: 'robotics@mits.ac.in',
      createdBy: priya._id,
    },
    {
      name: 'Rangmanch — The Drama Club',
      description:
        'Express yourself through theatre, street plays, and mono-acting. We perform at Techfest, Gwalior Mahotsav, and inter-college competitions.',
      category: 'cultural',
      logo: DUMMY.logo('RD'),
      coverImage: DUMMY.cover,
      members: [anjali._id, sneha._id],
      recruitmentOpen: true,
      recruitmentStartDate: new Date('2026-04-15'),
      recruitmentEndDate: new Date('2026-05-05'),
      contactEmail: 'rangmanch@mits.ac.in',
      createdBy: admin._id,
    },
    {
      name: 'Sports Committee MITS',
      description:
        'Organising inter-college tournaments, intra-college sports day, and cricket/football leagues. Stay fit, stay competitive!',
      category: 'sports',
      logo: DUMMY.logo('SC'),
      coverImage: DUMMY.cover,
      members: [arjun._id, dev._id, rahul._id, anjali._id],
      recruitmentOpen: false,
      contactEmail: 'sports@mits.ac.in',
      createdBy: admin._id,
    },
    {
      name: 'NSS MITS Unit',
      description:
        'National Service Scheme unit of MITS. We organise blood donation camps, cleanliness drives, village adoption, and awareness campaigns.',
      category: 'social',
      logo: DUMMY.logo('NSS'),
      coverImage: DUMMY.cover,
      members: [anjali._id, priya._id, sneha._id, shahid._id],
      recruitmentOpen: true,
      recruitmentStartDate: new Date('2026-04-01'),
      recruitmentEndDate: new Date('2026-04-20'),
      contactEmail: 'nss@mits.ac.in',
      createdBy: admin._id,
    },
  ];

  const clubs = await Club.insertMany(clubsData);
  const [codeClub, roboticsClub, dramaClub, sportsClub, nssClub] = clubs;
  console.log(`🏛️  Created ${clubs.length} clubs`);

  // ── 3. CAMPUS POSTS ───────────────────────────────────────────────────────
  const campusPostsData = [
    {
      title: 'Techfest 2026 — Registration Open! 🚀',
      content:
        'MITS Gwalior proudly presents Techfest 2026! Events include Hackathon, Code Sprint, Robo-War, and Circuit Design. Register before 20th April. Prize pool ₹1,50,000. Teams of 2–4 members. All branches welcome!',
      type: 'event',
      club: codeClub._id,
      postedBy: admin._id,
      images: [DUMMY.image('Techfest+2026')],
      eventDate: new Date('2026-04-25'),
      eventVenue: 'Main Auditorium, MITS Gwalior',
      likes: [shahid._id, priya._id, rahul._id, dev._id],
    },
    {
      title: 'CodeCraft Weekly Contest — Saturday 9 PM',
      content:
        'Hey coders! Weekly contest this Saturday at 9 PM on Codeforces. Division B level, 5 problems, 2 hours. Join the CodeCraft discord for the link. Consistent participation will be tracked for club leaderboard.',
      type: 'announcement',
      club: codeClub._id,
      postedBy: shahid._id,
      likes: [rahul._id, dev._id, sneha._id],
    },
    {
      title: 'Robotics Club — Drone Building Workshop',
      content:
        'Join us for a hands-on drone building workshop on 18th April. Materials provided. Learn about flight controllers, ESCs, and basic drone programming. Limited seats — 20 only. DM @roboticsmits to register.',
      type: 'event',
      club: roboticsClub._id,
      postedBy: priya._id,
      images: [DUMMY.image('Drone+Workshop')],
      eventDate: new Date('2026-04-18'),
      eventVenue: 'ECE Lab Block B, MITS Gwalior',
      likes: [arjun._id, rahul._id, shahid._id, anjali._id],
    },
    {
      title: 'Blood Donation Camp — NSS MITS',
      content:
        'NSS MITS is organising a blood donation camp on 22nd April in collaboration with Gwalior District Hospital. All students are encouraged to participate. Certificates will be provided. Venue: MITS Ground near Admin Block.',
      type: 'event',
      club: nssClub._id,
      postedBy: admin._id,
      images: [DUMMY.image('Blood+Donation+Camp')],
      eventDate: new Date('2026-04-22'),
      eventVenue: 'MITS Ground, Near Admin Block',
      likes: [sneha._id, anjali._id, priya._id],
    },
    {
      title: 'End Semester Exam Schedule Released',
      content:
        'The End Semester Examination schedule for April-May 2026 has been released on the MITS website. IT 4th sem starts from 5th May. CSE starts from 6th May. All students must carry their hall ticket. No entry without valid ID.',
      type: 'announcement',
      postedBy: admin._id,
      likes: [shahid._id, rahul._id, sneha._id, dev._id, anjali._id, arjun._id],
    },
    {
      title: 'Intra-College Cricket Tournament 🏏',
      content:
        'Sports Committee MITS presents the annual Intra-College Cricket Tournament starting 28th April. Teams of 11. Register your department team before 20th April. Prize: Trophy + ₹5000. Contact: sports@mits.ac.in',
      type: 'event',
      club: sportsClub._id,
      postedBy: arjun._id,
      images: [DUMMY.image('Cricket+Tournament')],
      eventDate: new Date('2026-04-28'),
      eventVenue: 'MITS Cricket Ground, Gwalior',
      likes: [dev._id, rahul._id, arjun._id],
    },
    {
      title: 'Recruitment Open: CodeCraft Club 2026',
      content:
        'CodeCraft Club is recruiting for the batch 2026-27! We are looking for passionate coders, problem solvers, content creators, and social media managers. Apply through the club portal before 30th April.',
      type: 'recruitment',
      club: codeClub._id,
      postedBy: shahid._id,
      likes: [anjali._id, priya._id],
    },
    {
      title: 'Street Play on Cybercrime Awareness',
      content:
        'Rangmanch Drama Club presents a street play on Cybercrime Awareness this Friday at 5 PM near the central lawn. Free entry. The play covers phishing, online scams, and digital safety. Bring your friends!',
      type: 'event',
      club: dramaClub._id,
      postedBy: sneha._id,
      eventDate: new Date('2026-04-11'),
      eventVenue: 'Central Lawn, MITS Gwalior',
      likes: [shahid._id, anjali._id, priya._id, rahul._id],
    },
  ];

  await CampusPost.insertMany(campusPostsData);
  console.log(`📢 Created ${campusPostsData.length} campus posts`);

  // ── 4. RESOURCE ITEMS ─────────────────────────────────────────────────────
  const resourcesData = [
    // ── Notes
    {
      title: 'Data Structures & Algorithms - Complete Notes',
      description:
        'Covers Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching. Handwritten + typed. Unit 1–5.',
      type: 'notes',
      subject: 'Data Structures & Algorithms',
      department: 'IT',
      year: 2,
      fileUrl: DUMMY.pdf('dsa-complete-notes'),
      uploadedBy: shahid._id,
      tags: ['DSA', 'IT', '4th sem', 'graphs', 'trees'],
      downloadCount: 238,
    },
    {
      title: 'Operating System - Short Notes + PYQ Solved',
      description:
        'OS theory short notes covering Process Scheduling, Memory Management, Deadlock, File System. With 5 years PYQ.',
      type: 'notes',
      subject: 'Operating System',
      department: 'CSE',
      year: 3,
      fileUrl: DUMMY.pdf('os-short-notes'),
      uploadedBy: rahul._id,
      tags: ['OS', 'CSE', '5th sem', 'scheduling'],
      downloadCount: 176,
    },
    {
      title: 'DBMS - ER Diagram + SQL Cheatsheet',
      description:
        'ER to Relational mapping, normalization (1NF–BCNF), SQL queries with examples, indexing. Unit 3 & 4 focused.',
      type: 'notes',
      subject: 'Database Management System',
      department: 'IT',
      year: 2,
      fileUrl: DUMMY.pdf('dbms-notes'),
      uploadedBy: sneha._id,
      tags: ['DBMS', 'SQL', '4th sem', 'normalization'],
      downloadCount: 312,
    },
    {
      title: 'Computer Networks - Layer-wise Notes',
      description:
        'OSI Model, TCP/IP stack, Subnetting, Routing Protocols (RIP, OSPF, BGP), Transport & Application layers.',
      type: 'notes',
      subject: 'Computer Networks',
      department: 'CSE',
      year: 3,
      fileUrl: DUMMY.pdf('cn-notes'),
      uploadedBy: dev._id,
      tags: ['CN', 'networking', '5th sem', 'TCP', 'routing'],
      downloadCount: 201,
    },
    {
      title: 'Engineering Mathematics III - Unit 1 & 2',
      description: 'Fourier Series, Fourier Transform, Laplace Transform with solved examples and previous year questions.',
      type: 'notes',
      subject: 'Engineering Mathematics III',
      department: 'IT',
      year: 2,
      fileUrl: DUMMY.pdf('maths3-unit1-2'),
      uploadedBy: shahid._id,
      tags: ['Maths', 'Fourier', 'Laplace', '3rd sem'],
      downloadCount: 143,
    },
    {
      title: 'Analog & Digital Circuits - ECE Notes',
      description:
        'Covers Op-Amps, Oscillators, Logic Gates, Flip-Flops, Counters, ADC/DAC. Complete semester notes.',
      type: 'department_notes',
      subject: 'Analog & Digital Circuits',
      department: 'EC',
      year: 2,
      fileUrl: DUMMY.pdf('adc-ec-notes'),
      uploadedBy: priya._id,
      tags: ['EC', 'circuits', 'digital', 'ADC'],
      downloadCount: 98,
    },

    // ── PYQs
    {
      title: 'DSA PYQ - Last 7 Years (2017-2024)',
      description: 'Previous year question papers for Data Structures from 2017 to 2024 with solutions for 2022-2024.',
      type: 'pyq',
      subject: 'Data Structures & Algorithms',
      department: 'IT',
      year: 2,
      fileUrl: DUMMY.pdf('dsa-pyq-7years'),
      uploadedBy: shahid._id,
      tags: ['PYQ', 'DSA', 'IT', '4th sem', 'exam prep'],
      downloadCount: 445,
    },
    {
      title: 'DBMS PYQ - 2019 to 2024',
      description: 'All previous year DBMS exam papers. Includes SQL queries, ER diagrams, and theory questions.',
      type: 'pyq',
      subject: 'Database Management System',
      department: 'CSE',
      year: 3,
      fileUrl: DUMMY.pdf('dbms-pyq-2019-2024'),
      uploadedBy: rahul._id,
      tags: ['PYQ', 'DBMS', 'CSE'],
      downloadCount: 389,
    },
    {
      title: 'Operating System PYQ - 5 Years',
      description: 'OS PYQ from RGPV (Rajiv Gandhi Proudyogiki Vishwavidyalaya) Bhopal, 2020-2024.',
      type: 'pyq',
      subject: 'Operating System',
      department: 'CSE',
      year: 3,
      fileUrl: DUMMY.pdf('os-pyq-5years'),
      uploadedBy: dev._id,
      tags: ['PYQ', 'OS', 'RGPV', 'exam'],
      downloadCount: 267,
    },
    {
      title: 'Computer Networks PYQ - 2021 to 2024',
      description: 'CN exam papers with detailed answer keys for 2022, 2023, and 2024.',
      type: 'pyq',
      subject: 'Computer Networks',
      department: 'IT',
      year: 3,
      fileUrl: DUMMY.pdf('cn-pyq-2021-2024'),
      uploadedBy: sneha._id,
      tags: ['PYQ', 'CN', 'networking'],
      downloadCount: 198,
    },

    // ── GATE
    {
      title: 'GATE CS 2025 - Complete Study Plan & Resources',
      description:
        'Topic-wise study plan for GATE CS. Covers DSA, OS, DBMS, CN, TOC, Digital Logic, COA, Algorithms, Aptitude.',
      type: 'gate',
      subject: 'GATE Computer Science',
      department: 'CSE',
      year: 4,
      fileUrl: DUMMY.pdf('gate-cs-study-plan'),
      uploadedBy: dev._id,
      tags: ['GATE', 'CS', 'study plan', 'competitive'],
      downloadCount: 532,
    },
    {
      title: 'Theory of Computation - GATE Level Notes',
      description: 'Finite Automata, PDA, Turing Machine, Decidability, Context-Free Grammars. GATE-focused.',
      type: 'gate',
      subject: 'Theory of Computation',
      department: 'CSE',
      year: 3,
      fileUrl: DUMMY.pdf('toc-gate-notes'),
      uploadedBy: rahul._id,
      tags: ['GATE', 'TOC', 'automata', 'CSE'],
      downloadCount: 210,
    },

    // ── Course Resources
    {
      title: 'MERN Stack - Full Roadmap + Project Ideas',
      description:
        'Complete MERN learning path from basics to deployment. Includes 10 project ideas with increasing complexity.',
      type: 'course_resource',
      subject: 'Web Development',
      department: 'IT',
      year: 2,
      fileUrl: DUMMY.pdf('mern-roadmap'),
      uploadedBy: shahid._id,
      tags: ['MERN', 'Web Dev', 'React', 'Node.js', 'MongoDB'],
      downloadCount: 421,
    },
    {
      title: 'DSA Roadmap for Placements - 6 Month Plan',
      description:
        '6-month structured DSA preparation plan for campus placements. Topic-wise resources, LeetCode lists, mock interview tips.',
      type: 'learning_path',
      subject: 'Data Structures & Algorithms',
      department: 'IT',
      year: 3,
      fileUrl: DUMMY.pdf('dsa-placement-roadmap'),
      uploadedBy: shahid._id,
      tags: ['DSA', 'placement', 'LeetCode', 'roadmap'],
      downloadCount: 678,
    },
  ];

  await ResourceItem.insertMany(resourcesData);
  console.log(`📚 Created ${resourcesData.length} resource items`);

  // ── 5. LOST & FOUND ───────────────────────────────────────────────────────
  const lostFoundData = [
    // ── RESOLVED
    {
      title: 'Found: Blue Jansport Backpack near Library',
      description:
        'Found a blue Jansport backpack near the MITS library entrance. Contains notebooks and a pencil case. Please contact to claim.',
      status: 'found',
      images: [DUMMY.image('Blue+Backpack')],
      locationLost: 'MITS Library, Ground Floor Entrance',
      contactInfo: 'priya@mits.ac.in | 9876543210',
      postedBy: priya._id,
      isResolved: true,
    },
    {
      title: 'Lost: HP Laptop Charger (65W)',
      description: 'Lost a black HP 65W laptop charger in the IT Department lab. Has a small scratch on the adapter.',
      status: 'lost',
      locationLost: 'IT Lab, Block A, 2nd Floor',
      contactInfo: 'shahid@mits.ac.in',
      postedBy: shahid._id,
      isResolved: true,
    },
    {
      title: 'Found: Student ID Card — Anjali Singh',
      description: 'Found a student ID card near the hostel gate. Name: Anjali Singh, Civil Engineering.',
      status: 'found',
      locationLost: 'Girls Hostel Gate, MITS',
      contactInfo: 'Contact hostel warden or rahul@mits.ac.in',
      postedBy: rahul._id,
      isResolved: true,
    },
    {
      title: 'Lost: Scientific Calculator (Casio fx-991ES)',
      description:
        'Lost my Casio fx-991ES Plus scientific calculator during the internal exam. Has my name written on the back: Arjun Verma.',
      status: 'lost',
      locationLost: 'Examination Hall, Block C',
      contactInfo: 'arjun@mits.ac.in | 9988776655',
      postedBy: arjun._id,
      isResolved: true,
    },
    {
      title: 'Found: Umbrella near Canteen',
      description: 'Found a black umbrella with red handle near the MITS canteen. DM to claim.',
      status: 'found',
      locationLost: 'MITS Canteen, Ground Floor',
      contactInfo: 'sneha@mits.ac.in',
      postedBy: sneha._id,
      isResolved: true,
    },

    // ── UNRESOLVED - LOST
    {
      title: 'Lost: Amazon Kindle Paperwhite',
      description:
        'Lost my Kindle Paperwhite (10th gen, black) in the college bus route 3. Last seen on 3rd April. Has a brown leather case with "SK" initials.',
      status: 'lost',
      images: [DUMMY.image('Kindle+Paperwhite')],
      locationLost: 'College Bus Route 3, Gwalior',
      contactInfo: 'shahid@mits.ac.in | 7654321098',
      externalLink: 'https://forms.gle/example',
      postedBy: shahid._id,
      isResolved: false,
    },
    {
      title: 'Lost: Blue Water Bottle (Milton)',
      description: 'Lost a blue 1L Milton thermosteel bottle in the sports ground during football practice on 1st April.',
      status: 'lost',
      locationLost: 'Sports Ground, MITS Gwalior',
      contactInfo: 'dev@mits.ac.in',
      postedBy: dev._id,
      isResolved: false,
    },
    {
      title: 'Lost: Earphones (OnePlus Bullets Z2)',
      description:
        'Lost my OnePlus Bullets Z2 wired earphones (green colour) somewhere in the CSE department block. Please check if you find them.',
      status: 'lost',
      locationLost: 'CSE Department, Block B',
      contactInfo: 'rahul@mits.ac.in | 9123456789',
      postedBy: rahul._id,
      isResolved: false,
    },
    {
      title: 'Lost: Wallet near ATM',
      description:
        'Lost a brown leather wallet near the SBI ATM inside MITS campus. Contains some cash and important cards. Please contact immediately.',
      status: 'lost',
      locationLost: 'SBI ATM, MITS Campus',
      contactInfo: 'anjali@mits.ac.in | 8765432109',
      externalLink: null,
      postedBy: anjali._id,
      isResolved: false,
    },
    {
      title: 'Found: Car Keys with Maruti Logo',
      description: 'Found a car key with Maruti Suzuki logo and a yellow keychain near the faculty parking area.',
      status: 'found',
      locationLost: 'Faculty Parking Area, MITS',
      contactInfo: 'priya@mits.ac.in',
      postedBy: priya._id,
      isResolved: false,
    },
    {
      title: 'Lost: Maths Assignment Notebook',
      description:
        'Lost my Engineering Maths III assignment notebook. Green cover, name "Sneha Mishra" written on first page. Was in the library yesterday.',
      status: 'lost',
      locationLost: 'MITS Library, Reading Hall',
      contactInfo: 'sneha@mits.ac.in',
      postedBy: sneha._id,
      isResolved: false,
    },
    {
      title: 'Found: Spectacles near Workshop',
      description: 'Found a black framed spectacles (power glasses) near the mechanical workshop. Claim ASAP.',
      status: 'found',
      locationLost: 'Mechanical Workshop, MITS',
      contactInfo: 'arjun@mits.ac.in',
      postedBy: arjun._id,
      isResolved: false,
    },
  ];

  await LostFoundItem.insertMany(lostFoundData);
  console.log(`🔍 Created ${lostFoundData.length} lost & found items`);

  // ── 6. MARKETPLACE ITEMS ──────────────────────────────────────────────────
  const marketplaceData = [
    {
      title: 'Data Structures by Narasimha Karumanchi - Like New',
      description: 'Used for one semester. No markings, excellent condition. Great for placement prep.',
      category: 'book',
      price: 280,
      condition: 'good',
      images: [DUMMY.image('DS+Book')],
      seller: shahid._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'shahid@mits.ac.in',
    },
    {
      title: 'Casio fx-991ES Plus Scientific Calculator',
      description: 'Bought in 1st year, barely used. All functions working perfectly. Original case included.',
      category: 'calculator',
      price: 350,
      condition: 'good',
      seller: sneha._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'sneha@mits.ac.in | 9876543210',
    },
    {
      title: 'Arduino Starter Kit (UNO + sensors)',
      description: 'Arduino UNO R3, 5 sensors, jumper wires, breadboard. Used for one project. All working.',
      category: 'project_component',
      price: 600,
      condition: 'good',
      images: [DUMMY.image('Arduino+Kit')],
      seller: priya._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'priya@mits.ac.in',
    },
    {
      title: 'Hostel Single Mattress (foam, 6x3 ft)',
      description: 'Leaving hostel, selling foam mattress. Clean, no stains. Pickup from Boys Hostel Room 204.',
      category: 'hostel_item',
      price: 400,
      isFree: false,
      condition: 'fair',
      seller: arjun._id,
      status: 'sold',
      section: 'secondhand',
      contactInfo: 'arjun@mits.ac.in',
    },
    {
      title: 'Engineering Drawing Set - FREE',
      description: 'Drafter, compass, divider, French curves - full set. No longer needed. First come first served.',
      category: 'other',
      price: 0,
      isFree: true,
      condition: 'fair',
      seller: anjali._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'anjali@mits.ac.in',
    },
    {
      title: 'Raspberry Pi 4 (4GB RAM)',
      description: 'Raspberry Pi 4 Model B with 4GB RAM, official power adapter, 32GB SD card with Raspbian.',
      category: 'electronics',
      price: 3500,
      condition: 'good',
      images: [DUMMY.image('Raspberry+Pi+4')],
      seller: dev._id,
      status: 'reserved',
      section: 'secondhand',
      contactInfo: 'dev@mits.ac.in',
    },
    // Local shop items
    {
      title: 'MADE EASY GATE CSE Study Material 2025',
      description: 'Complete GATE 2025 study material from MADE EASY — all subjects. New stock arrived.',
      category: 'book',
      price: 1200,
      condition: 'new',
      seller: admin._id,
      status: 'available',
      section: 'local_shop',
      shopAddress: 'Gupta Book Store, University Road, Near MITS Gate, Gwalior',
      contactInfo: '0751-2345678',
    },
    {
      title: 'Graph Paper Sheets & Lab Record Books',
      description: 'Graph paper (A3), practical record books, drawing sheets. Available in bulk.',
      category: 'other',
      price: 30,
      condition: 'new',
      seller: admin._id,
      status: 'available',
      section: 'local_shop',
      shopAddress: 'Raj Stationery, Sector 6, Near MITS, Gwalior',
      contactInfo: '0751-3456789',
    },
  ];

  await MarketplaceItem.insertMany(marketplaceData);
  console.log(`🛒 Created ${marketplaceData.length} marketplace items`);

  // ── 7. OPPORTUNITIES ──────────────────────────────────────────────────────
  const opportunitiesData = [
    {
      title: 'SDE Intern — TCS iON (Summer 2026)',
      description:
        'TCS is hiring summer interns for their iON product division. Work on real Ed-Tech features. 2-month stipend: ₹15,000/month. Open to 3rd and 4th year CS/IT students. Apply via TCS NextStep portal.',
      type: 'internship',
      organization: 'Tata Consultancy Services (TCS)',
      applyLink: 'https://nextstep.tcs.com',
      startDate: new Date('2026-05-15'),
      lastDate: new Date('2026-04-20'),
      postedBy: admin._id,
      tags: ['SDE', 'internship', 'TCS', 'summer', 'CS', 'IT'],
      isActive: true,
    },
    {
      title: 'Hackathon — Smart India Hackathon 2026',
      description:
        'Smart India Hackathon 2026 registrations open! 36-hour national hackathon. Form teams of 6. Problem statements from government ministries. Prize pool: ₹1,00,000 per winning team.',
      type: 'hackathon',
      organization: 'Ministry of Education, Government of India',
      applyLink: 'https://www.sih.gov.in',
      startDate: new Date('2026-08-01'),
      lastDate: new Date('2026-05-15'),
      postedBy: shahid._id,
      tags: ['SIH', 'hackathon', 'government', 'national level'],
      isActive: true,
    },
    {
      title: 'NTPC Scholarship for Engineering Students 2026',
      description:
        'NTPC offers merit-cum-means scholarship of ₹2000/month to engineering students from SC/ST/OBC background with 60%+ marks. Apply with income certificate and marksheet.',
      type: 'scholarship',
      organization: 'NTPC Limited',
      applyLink: 'https://ntpccsr.in/scholarship',
      lastDate: new Date('2026-04-30'),
      postedBy: admin._id,
      tags: ['scholarship', 'NTPC', 'engineering', 'SC/ST/OBC'],
      isActive: true,
    },
    {
      title: 'Software Engineer — Infosys Campus Drive',
      description:
        'Infosys visiting MITS Gwalior for campus recruitment. Package: ₹4.5 LPA (DSE role) and ₹6.5 LPA (SP role). Eligibility: 60%+ aggregate, no active backlogs. Registration mandatory through TPO.',
      type: 'job',
      organization: 'Infosys Limited',
      applyLink: 'mailto:tpo@mits.ac.in',
      startDate: new Date('2026-04-20'),
      lastDate: new Date('2026-04-15'),
      postedBy: admin._id,
      tags: ['placement', 'Infosys', 'campus drive', 'SDE', 'job'],
      isActive: true,
    },
    {
      title: 'ICPC 2026 — Amritapuri Regional Registration',
      description:
        'ICPC Amritapuri Regional Contest 2026 registrations are live. Form teams of 3 and register on the ICPC website. Qualify for the World Finals. Strong DSA background required.',
      type: 'competition',
      organization: 'ICPC Foundation',
      applyLink: 'https://icpc.global',
      startDate: new Date('2026-11-01'),
      lastDate: new Date('2026-09-30'),
      postedBy: shahid._id,
      tags: ['ICPC', 'competitive programming', 'CP', 'team'],
      isActive: true,
    },
    {
      title: 'Frontend Developer Intern — Remote (Startup)',
      description:
        'Gwalior-based ed-tech startup hiring frontend dev interns. React.js required. Stipend: ₹8,000/month. 3-month internship with PPO possibility. Work from home.',
      type: 'internship',
      organization: 'EduTech Startup (Gwalior)',
      applyLink: 'https://forms.gle/example-intern',
      startDate: new Date('2026-05-01'),
      lastDate: new Date('2026-04-18'),
      postedBy: sneha._id,
      tags: ['frontend', 'React', 'internship', 'remote', 'startup', 'Gwalior'],
      isActive: true,
    },
    {
      title: 'Google Summer of Code 2026',
      description:
        'GSoC 2026 contributor applications are open! Work with open-source organizations over 12 weeks. Stipend: $1500–$3000 depending on project size. Strong coding and Git skills needed.',
      type: 'internship',
      organization: 'Google',
      applyLink: 'https://summerofcode.withgoogle.com',
      startDate: new Date('2026-05-27'),
      lastDate: new Date('2026-04-02'),
      postedBy: dev._id,
      tags: ['GSoC', 'Google', 'open source', 'internship', 'international'],
      isActive: false,
    },
    {
      title: 'Reliance Foundation Undergraduate Scholarship',
      description:
        'Scholarship for 1st and 2nd year undergrad students. ₹4 Lakh total support over 4 years. Based on merit and financial need. Apply online with 12th marksheet and income proof.',
      type: 'scholarship',
      organization: 'Reliance Foundation',
      applyLink: 'https://rf-she.in',
      lastDate: new Date('2026-05-31'),
      postedBy: admin._id,
      tags: ['scholarship', 'Reliance', '1st year', '2nd year'],
      isActive: true,
    },
  ];

  await Opportunity.insertMany(opportunitiesData);
  console.log(`💼 Created ${opportunitiesData.length} opportunities`);

  // ── 8. LOCAL SERVICES ─────────────────────────────────────────────────────
  // Gwalior coordinates: 26.2183° N, 78.1828° E
  const localServicesData = [
    {
      name: 'Shri Ram Boys Hostel PG',
      type: 'pg',
      description: 'Clean, affordable PG near MITS Gwalior. AC and non-AC rooms available. Attached bathroom, WiFi, 24/7 water supply.',
      address: 'Plot No. 45, Sector 6, Near MITS Gate, Gwalior - 474005',
      cost: '₹4,500 - ₹7,000/month',
      facilities: ['WiFi', 'AC Rooms', 'Laundry', '24/7 Water', 'Mess Facility', 'CCTV'],
      rating: 4.1,
      contactNumber: '9876501234',
      location: { type: 'Point', coordinates: [78.1780, 26.2260] },
      photos: [DUMMY.image('PG+Hostel')],
      postedBy: admin._id,
    },
    {
      name: 'Annapurna Mess & Tiffin Service',
      type: 'mess',
      description: 'Pure veg mess with monthly subscription. Homely food, clean environment. Breakfast, lunch, and dinner.',
      address: 'University Road, Near MITS Colony, Gwalior - 474005',
      cost: '₹2,800/month (all meals)',
      facilities: ['Pure Veg', 'Monthly Subscription', 'Home-style Food', 'RO Water'],
      rating: 4.4,
      contactNumber: '9871234567',
      location: { type: 'Point', coordinates: [78.1835, 26.2195] },
      photos: [DUMMY.image('Mess+Food')],
      postedBy: sneha._id,
    },
    {
      name: 'Gupta Book Store & Stationery',
      type: 'stationery',
      description: 'All textbooks, lab manuals, graph papers, drawing sheets, calculators, and study material available. Best prices in Gwalior.',
      address: 'Near MITS Main Gate, University Road, Gwalior - 474005',
      cost: 'Varies by item',
      facilities: ['Photocopying', 'Spiral Binding', 'Lamination', 'Bulk Discount'],
      rating: 4.2,
      contactNumber: '9812345678',
      location: { type: 'Point', coordinates: [78.1810, 26.2215] },
      photos: [DUMMY.image('Book+Store')],
      postedBy: admin._id,
    },
    {
      name: 'TechFix Computer Repair Centre',
      type: 'hardware',
      description: 'Laptop repair, SSD/RAM upgrade, OS installation, data recovery. Trusted by MITS students for 5+ years.',
      address: 'Sector 7, Opposite MITS Hostel Block, Gwalior',
      cost: 'Diagnosis Free | Repair: ₹200 onwards',
      facilities: ['SSD Upgrade', 'RAM Upgrade', 'OS Installation', 'Data Recovery', 'Screen Replacement'],
      rating: 4.0,
      contactNumber: '9800012345',
      location: { type: 'Point', coordinates: [78.1860, 26.2240] },
      photos: [DUMMY.image('Laptop+Repair')],
      postedBy: dev._id,
    },
    {
      name: 'Saraswati Girls Hostel',
      type: 'hostel',
      description: 'Safe and secure girls hostel 500m from MITS. Warden on campus. Visiting hours strictly maintained.',
      address: 'Maharani Laxmibai Road, Near MITS, Gwalior - 474009',
      cost: '₹3,200/month (non-AC) | ₹5,500/month (AC)',
      facilities: ['24/7 Security', 'Mess', 'WiFi', 'CCTV', 'Indoor Games', 'Study Room'],
      rating: 4.3,
      contactNumber: '9870012345',
      location: { type: 'Point', coordinates: [78.1795, 26.2270] },
      photos: [DUMMY.image('Girls+Hostel')],
      postedBy: priya._id,
    },
  ];

  await LocalService.insertMany(localServicesData);
  console.log(`🏠 Created ${localServicesData.length} local services`);

  // ── 9. TASKS (for Shahid only — primary user) ─────────────────────────────
  const now = new Date();
  const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const tasksData = [
    // Completed
    { userId: shahid._id, title: 'Solve 3 LeetCode problems', description: 'Daily DSA practice', subject: 'DSA', deadline: daysFromNow(-5), priority: 'high', status: 'completed' },
    { userId: shahid._id, title: 'DBMS Assignment Unit 3', description: 'ER diagram + normalization questions', subject: 'DBMS', deadline: daysFromNow(-3), priority: 'high', status: 'completed' },
    { userId: shahid._id, title: 'Push StudentSphere auth module', description: 'Complete login/register with JWT', subject: 'Web Dev', deadline: daysFromNow(-7), priority: 'high', status: 'completed' },
    { userId: shahid._id, title: 'Maths III Unit 1 revision', description: 'Fourier series formula practice', subject: 'Maths', deadline: daysFromNow(-2), priority: 'medium', status: 'completed' },
    { userId: shahid._id, title: 'LinkedIn post — Day 90 update', description: 'Write and post coding journey update', subject: 'Personal Brand', deadline: daysFromNow(-1), priority: 'low', status: 'completed' },

    // In Progress
    { userId: shahid._id, title: 'Build Resource Module — StudentSphere', description: 'Notes + PYQ upload, filter by subject/year/branch', subject: 'Web Dev', deadline: daysFromNow(3), priority: 'high', status: 'in-progress' },
    { userId: shahid._id, title: 'OS Internal Exam Prep', description: 'Scheduling algorithms + memory management', subject: 'Operating System', deadline: daysFromNow(5), priority: 'high', status: 'in-progress' },
    { userId: shahid._id, title: 'Solve Codeforces Div 2 C problems (5)', description: 'Focus on graphs and greedy', subject: 'DSA', deadline: daysFromNow(2), priority: 'medium', status: 'in-progress' },

    // Pending
    { userId: shahid._id, title: 'End Sem Exam Timetable Study Plan', description: 'Create subject-wise daily schedule', subject: 'Academic', deadline: daysFromNow(7), priority: 'high', status: 'pending' },
    { userId: shahid._id, title: 'StudentSphere — Lost & Found module routes', description: 'CRUD + resolve endpoint', subject: 'Web Dev', deadline: daysFromNow(8), priority: 'medium', status: 'pending' },
    { userId: shahid._id, title: 'Add AI generation to StudentSphere', description: 'OpenRouter API integration for resource summaries', subject: 'Web Dev', deadline: daysFromNow(14), priority: 'low', status: 'pending' },
    { userId: shahid._id, title: 'Update Resume for internship applications', description: 'Add StudentSphere project + update LeetCode stats', subject: 'Career', deadline: daysFromNow(10), priority: 'medium', status: 'pending' },
    { userId: shahid._id, title: 'DBMS End Sem — all units revision', description: 'Transactions, concurrency, indexing', subject: 'DBMS', deadline: daysFromNow(20), priority: 'high', status: 'pending' },
    { userId: shahid._id, title: 'Participate in CodeChef Long Challenge', description: 'April Long Challenge — target 4★', subject: 'CP', deadline: daysFromNow(15), priority: 'medium', status: 'pending' },
    { userId: shahid._id, title: 'Write blog post: MERN Project learnings', description: 'Document StudentSphere build journey on Hashnode', subject: 'Personal Brand', deadline: daysFromNow(21), priority: 'low', status: 'pending' },
  ];

  await Task.insertMany(tasksData);
  console.log(`✅ Created ${tasksData.length} tasks for Shahid`);

  // ── 10. TRANSACTIONS (for Shahid — enough for graphs) ─────────────────────
  // Spread over last 3 months for meaningful graph data
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const transactionsData = [
    // ── MARCH 2026
    { user: shahid._id, type: 'income', amount: 3000, description: 'Monthly pocket money from home', category: 'other', date: daysAgo(35) },
    { user: shahid._id, type: 'expense', amount: 1400, description: 'Hostel mess fee — March', category: 'food', date: daysAgo(34) },
    { user: shahid._id, type: 'expense', amount: 50, description: 'Auto from campus to Gwalior station', category: 'transport', date: daysAgo(33) },
    { user: shahid._id, type: 'expense', amount: 120, description: 'Stationery: pen, highlighter, graph sheets', category: 'stationery', date: daysAgo(32) },
    { user: shahid._id, type: 'expense', amount: 200, description: 'Movie ticket at PVR Gwalior — Avengers', category: 'entertainment', date: daysAgo(30) },
    { user: shahid._id, type: 'expense', amount: 350, description: 'Books: let us C by Yashwant Kanetkar', category: 'stationery', date: daysAgo(28) },
    { user: shahid._id, type: 'income', amount: 800, description: 'Freelance: Landing page for local shop', category: 'other', date: daysAgo(25) },
    { user: shahid._id, type: 'expense', amount: 180, description: 'Canteen food — snacks & coffee', category: 'food', date: daysAgo(24) },
    { user: shahid._id, type: 'expense', amount: 75, description: 'Bus pass Gwalior city', category: 'transport', date: daysAgo(22) },
    { user: shahid._id, type: 'expense', amount: 499, description: 'Leetcode Premium monthly', category: 'other', date: daysAgo(20) },
    { user: shahid._id, type: 'expense', amount: 280, description: 'DataStructures book from secondhand', category: 'stationery', date: daysAgo(18) },
    { user: shahid._id, type: 'expense', amount: 90, description: 'Maggi + juice at canteen', category: 'food', date: daysAgo(16) },

    // ── EARLY APRIL 2026
    { user: shahid._id, type: 'income', amount: 3000, description: 'Monthly pocket money from home', category: 'other', date: daysAgo(5) },
    { user: shahid._id, type: 'expense', amount: 1400, description: 'Hostel mess fee — April', category: 'food', date: daysAgo(4) },
    { user: shahid._id, type: 'expense', amount: 240, description: 'Dinner at Dominos with friends', category: 'food', date: daysAgo(3) },
    { user: shahid._id, type: 'income', amount: 1500, description: 'Freelance: Logo design for startup', category: 'other', date: daysAgo(3) },
    { user: shahid._id, type: 'expense', amount: 60, description: 'Auto to Gwalior city', category: 'transport', date: daysAgo(2) },
    { user: shahid._id, type: 'expense', amount: 150, description: 'Pen drive 32GB (stationery)', category: 'stationery', date: daysAgo(2) },
    { user: shahid._id, type: 'expense', amount: 499, description: 'Leetcode Premium monthly', category: 'other', date: daysAgo(1) },
    { user: shahid._id, type: 'expense', amount: 320, description: 'Grocery & snacks for room', category: 'food', date: daysAgo(1) },

    // ── FEBRUARY 2026 (for more graph coverage)
    { user: shahid._id, type: 'income', amount: 3000, description: 'Monthly pocket money from home', category: 'other', date: daysAgo(65) },
    { user: shahid._id, type: 'expense', amount: 1400, description: 'Hostel mess fee — February', category: 'food', date: daysAgo(64) },
    { user: shahid._id, type: 'expense', amount: 350, description: 'Books for semester', category: 'stationery', date: daysAgo(60) },
    { user: shahid._id, type: 'expense', amount: 499, description: 'Leetcode Premium monthly', category: 'other', date: daysAgo(58) },
    { user: shahid._id, type: 'income', amount: 2000, description: 'Prize money — Intra college coding contest', category: 'other', date: daysAgo(55) },
    { user: shahid._id, type: 'expense', amount: 200, description: 'Cricket match entry + snacks', category: 'entertainment', date: daysAgo(52) },
    { user: shahid._id, type: 'expense', amount: 180, description: 'Canteen spends — weekly', category: 'food', date: daysAgo(50) },
    { user: shahid._id, type: 'expense', amount: 100, description: 'Printing + spiral binding notes', category: 'stationery', date: daysAgo(48) },
    { user: shahid._id, type: 'expense', amount: 75, description: 'Transport to Gwalior city', category: 'transport', date: daysAgo(45) },
  ];

  await Transaction.insertMany(transactionsData);
  console.log(`💰 Created ${transactionsData.length} transactions for Shahid`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seeding complete! Summary:');
  console.log(`   👤 Users: ${users.length}`);
  console.log(`   🏛️  Clubs: ${clubs.length}`);
  console.log(`   📢 Campus Posts: ${campusPostsData.length}`);
  console.log(`   📚 Resources: ${resourcesData.length}`);
  console.log(`   🔍 Lost & Found: ${lostFoundData.length} (${lostFoundData.filter(i => i.isResolved).length} resolved)`);
  console.log(`   🛒 Marketplace: ${marketplaceData.length}`);
  console.log(`   💼 Opportunities: ${opportunitiesData.length}`);
  console.log(`   🏠 Local Services: ${localServicesData.length}`);
  console.log(`   ✅ Tasks (Shahid): ${tasksData.length}`);
  console.log(`   💰 Transactions (Shahid): ${transactionsData.length}`);
  console.log('\n   Primary user credentials:');
  console.log('   Email:    shahid@mits.ac.in');
  console.log('   Password: password123');
  console.log('   Admin:    admin@mits.ac.in / password123');

  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB. All done!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});