const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const ResourceItem = require('../models/ResourceItem');
const Transaction = require('../models/Transaction');
const Opportunity = require('../models/Opportunity');
const LocalService = require('../models/LocalService');
const MarketplaceItem = require('../models/MarketplaceItem');
const LostFoundItem = require('../models/LostFoundItem');
const Club = require('../models/Club');
const CampusPost = require('../models/CampusPost');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  console.log('🌱 Clearing existing data...');
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
  ]);

  // ─── Users ────────────────────────────────────────────────────────────────
  console.log('👥 Seeding users...');
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@studentsphere.com',
    password: 'Admin@1234',
    role: 'admin',
    department: 'Administration',
    branch: 'Admin',
    year: 1,
    state: 'Maharashtra',
    district: 'Pune',
    bio: 'Platform administrator',
  });

  const students = await User.create([
    {
      name: 'Aarav Sharma',
      email: 'aarav@student.com',
      password: 'Student@1234',
      role: 'student',
      department: 'Engineering',
      branch: 'Computer Science',
      year: 3,
      state: 'Maharashtra',
      district: 'Pune',
      skills: ['JavaScript', 'React', 'Node.js'],
      bio: 'Full stack developer in making',
    },
    {
      name: 'Priya Patel',
      email: 'priya@student.com',
      password: 'Student@1234',
      role: 'student',
      department: 'Engineering',
      branch: 'Electronics',
      year: 2,
      state: 'Gujarat',
      district: 'Ahmedabad',
      skills: ['Python', 'Machine Learning', 'TensorFlow'],
      bio: 'AI enthusiast',
    },
    {
      name: 'Rahul Verma',
      email: 'rahul@student.com',
      password: 'Student@1234',
      role: 'student',
      department: 'Engineering',
      branch: 'Mechanical',
      year: 4,
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      skills: ['CAD', 'SolidWorks', 'MATLAB'],
      bio: 'Mechanical engineering final year',
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha@student.com',
      password: 'Student@1234',
      role: 'student',
      department: 'Science',
      branch: 'Data Science',
      year: 1,
      state: 'Telangana',
      district: 'Hyderabad',
      skills: ['Python', 'SQL', 'Tableau'],
      bio: 'Data science freshman',
    },
  ]);

  const [student1, student2, student3, student4] = students;

  // ─── Resources ────────────────────────────────────────────────────────────
  console.log('📚 Seeding resources...');
  await ResourceItem.create([
    {
      title: 'Data Structures & Algorithms - Complete Notes',
      description: 'Comprehensive notes covering arrays, linked lists, trees, graphs, DP',
      type: 'notes',
      subject: 'Data Structures',
      department: 'Engineering',
      year: 2,
      fileUrl: 'https://example.com/files/dsa-notes.pdf',
      uploadedBy: student1._id,
      tags: ['DSA', 'algorithms', 'data structures'],
      downloadCount: 245,
    },
    {
      title: 'Database Management Systems - PYQ 2022',
      description: 'Previous year questions for DBMS from 2018-2022',
      type: 'pyq',
      subject: 'DBMS',
      department: 'Engineering',
      year: 3,
      fileUrl: 'https://example.com/files/dbms-pyq.pdf',
      uploadedBy: student2._id,
      tags: ['DBMS', 'SQL', 'PYQ'],
      downloadCount: 180,
    },
    {
      title: 'Machine Learning Fundamentals - Department Notes',
      description: 'Official department notes for ML course with implementation examples',
      type: 'department_notes',
      subject: 'Machine Learning',
      department: 'Science',
      year: 3,
      fileUrl: 'https://example.com/files/ml-notes.pdf',
      uploadedBy: student2._id,
      tags: ['ML', 'AI', 'neural networks'],
      downloadCount: 312,
    },
    {
      title: 'GATE Computer Science 2023 Questions',
      description: 'Official GATE CS 2023 paper with solutions',
      type: 'gate',
      subject: 'Computer Science',
      department: 'Engineering',
      year: 4,
      fileUrl: 'https://example.com/files/gate-cs-2023.pdf',
      uploadedBy: adminUser._id,
      tags: ['GATE', 'CS', '2023'],
      downloadCount: 890,
    },
    {
      title: 'React.js - Complete Course Resource Pack',
      description: 'Complete resource pack for learning React including hooks, context API, Redux',
      type: 'course_resource',
      subject: 'Web Development',
      department: 'Engineering',
      year: 2,
      fileUrl: 'https://example.com/files/react-pack.pdf',
      uploadedBy: student1._id,
      tags: ['React', 'JavaScript', 'web dev', 'frontend'],
      downloadCount: 156,
    },
  ]);

  // ─── Transactions ─────────────────────────────────────────────────────────
  console.log('💰 Seeding transactions...');
  const now = new Date();
  await Transaction.create([
    { user: student1._id, type: 'income', amount: 15000, description: 'Monthly stipend', category: 'other', date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { user: student1._id, type: 'expense', amount: 3500, description: 'Room rent', category: 'rent', date: new Date(now.getFullYear(), now.getMonth(), 2) },
    { user: student1._id, type: 'expense', amount: 800, description: 'Mess fees for the week', category: 'food', date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { user: student1._id, type: 'expense', amount: 250, description: 'Bus pass', category: 'transport', date: new Date(now.getFullYear(), now.getMonth(), 7) },
    { user: student1._id, type: 'expense', amount: 450, description: 'Textbooks from library', category: 'stationery', date: new Date(now.getFullYear(), now.getMonth(), 10) },
    { user: student1._id, type: 'expense', amount: 300, description: 'Movie night', category: 'entertainment', date: new Date(now.getFullYear(), now.getMonth(), 15) },
    { user: student1._id, type: 'income', amount: 5000, description: 'Freelance project payment', category: 'other', date: new Date(now.getFullYear(), now.getMonth(), 20) },
  ]);

  // ─── Opportunities ────────────────────────────────────────────────────────
  console.log('🎯 Seeding opportunities...');
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoMonths = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  await Opportunity.create([
    {
      title: 'Google Summer of Code 2024',
      description: 'Contribute to open source projects under the guidance of Google mentors.',
      type: 'internship',
      organization: 'Google',
      applyLink: 'https://summerofcode.withgoogle.com',
      startDate: nextMonth,
      lastDate: nextWeek,
      postedBy: adminUser._id,
      tags: ['open source', 'coding', 'internship', 'Google'],
      isActive: true,
    },
    {
      title: 'National Scholarship Programme for Higher Education',
      description: 'Government scholarship for meritorious students pursuing higher education.',
      type: 'scholarship',
      organization: 'Ministry of Education, India',
      applyLink: 'https://scholarships.gov.in',
      lastDate: nextMonth,
      postedBy: adminUser._id,
      tags: ['scholarship', 'government', 'higher education'],
      isActive: true,
    },
    {
      title: 'Smart India Hackathon 2024',
      description: 'National level hackathon to develop innovative solutions for Indian industries.',
      type: 'hackathon',
      organization: 'Ministry of Education',
      applyLink: 'https://www.sih.gov.in',
      startDate: nextMonth,
      lastDate: twoMonths,
      postedBy: adminUser._id,
      tags: ['hackathon', 'SIH', 'innovation', 'coding'],
      isActive: true,
    },
    {
      title: 'Amazon SDE Internship 2024',
      description: '6-month Software Development Engineering internship at Amazon India.',
      type: 'internship',
      organization: 'Amazon',
      applyLink: 'https://amazon.jobs',
      lastDate: nextWeek,
      postedBy: adminUser._id,
      tags: ['Amazon', 'SDE', 'internship', 'software'],
      isActive: true,
    },
    {
      title: 'ICPC Regional Contest 2024',
      description: 'ACM International Collegiate Programming Contest regional round.',
      type: 'competition',
      organization: 'ACM ICPC',
      applyLink: 'https://icpc.global',
      startDate: twoMonths,
      lastDate: nextMonth,
      postedBy: adminUser._id,
      tags: ['ICPC', 'competitive programming', 'algorithms'],
      isActive: true,
    },
  ]);

  // ─── Local Services ───────────────────────────────────────────────────────
  console.log('🏠 Seeding local services...');
  await LocalService.create([
    {
      name: 'Galaxy Boys Hostel',
      type: 'hostel',
      description: 'Well-maintained hostel with AC rooms, WiFi, and 24/7 security',
      address: 'Near Campus Gate 2, Kothrud, Pune',
      cost: '₹4500/month',
      facilities: ['WiFi', 'AC', 'Laundry', '24/7 Security', 'Hot Water'],
      rating: 4.2,
      contactNumber: '+91-9876543210',
      location: { type: 'Point', coordinates: [73.8097, 18.5074] },
      photos: [],
      postedBy: adminUser._id,
    },
    {
      name: 'Shree Ganesh Mess',
      type: 'mess',
      description: 'Home-cooked veg meals, monthly subscription available',
      address: '15, Paud Road, Kothrud, Pune',
      cost: '₹2200/month',
      facilities: ['Veg', 'Home-cooked', 'Monthly Plan', 'Tiffin Service'],
      rating: 4.5,
      contactNumber: '+91-9876543211',
      location: { type: 'Point', coordinates: [73.8120, 18.5089] },
      photos: [],
      postedBy: adminUser._id,
    },
    {
      name: 'Campus Tech Hardware Store',
      type: 'hardware',
      description: 'Electronics components, PCB, Arduino kits, and project materials',
      address: 'Shop 3, Student Bazaar, Near Main Gate',
      cost: 'Varies',
      facilities: ['Arduino Kits', 'PCB', 'Sensors', 'Bulk Discount'],
      rating: 4.0,
      contactNumber: '+91-9876543212',
      location: { type: 'Point', coordinates: [73.8078, 18.5060] },
      photos: [],
      postedBy: adminUser._id,
    },
    {
      name: 'Sunrise PG for Girls',
      type: 'pg',
      description: 'Girls only PG with all amenities and healthy meals',
      address: '7, Model Colony, Pune',
      cost: '₹6000/month',
      facilities: ['WiFi', 'Meals', 'AC', 'Geyser', 'Girls Only'],
      rating: 4.7,
      contactNumber: '+91-9876543213',
      location: { type: 'Point', coordinates: [73.8045, 18.5110] },
      photos: [],
      postedBy: adminUser._id,
    },
  ]);

  // ─── Marketplace ──────────────────────────────────────────────────────────
  console.log('🛒 Seeding marketplace items...');
  await MarketplaceItem.create([
    {
      title: 'Engineering Mathematics Textbook',
      description: 'B.S. Grewal Engineering Mathematics, 44th Edition. Excellent condition.',
      category: 'book',
      price: 350,
      isFree: false,
      condition: 'good',
      images: [],
      seller: student2._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'priya@student.com',
    },
    {
      title: 'Casio FX-991EX Scientific Calculator',
      description: 'Used for 1 semester. All functions working perfectly.',
      category: 'calculator',
      price: 800,
      isFree: false,
      condition: 'good',
      images: [],
      seller: student3._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'rahul@student.com',
    },
    {
      title: 'Raspberry Pi 4 (4GB) with accessories',
      description: 'Complete kit with power supply, case, and 32GB SD card',
      category: 'electronics',
      price: 4500,
      isFree: false,
      condition: 'new',
      images: [],
      seller: student1._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'aarav@student.com',
    },
    {
      title: 'Hostel Room Chair & Study Table Set',
      description: 'Solid wood study table and chair. Moving out, selling cheap.',
      category: 'hostel_item',
      price: 1200,
      isFree: false,
      condition: 'fair',
      images: [],
      seller: student3._id,
      status: 'available',
      section: 'secondhand',
      contactInfo: 'rahul@student.com',
    },
    {
      title: 'Arduino Starter Kit',
      description: 'Unopened Arduino Uno starter kit from local shop.',
      category: 'project_component',
      price: 1500,
      isFree: false,
      condition: 'new',
      images: [],
      seller: student1._id,
      status: 'available',
      section: 'local_shop',
      shopAddress: 'Campus Tech Hardware Store, Near Main Gate',
      contactInfo: 'aarav@student.com',
    },
  ]);

  // ─── Lost & Found ─────────────────────────────────────────────────────────
  console.log('🔍 Seeding lost & found posts...');
  await LostFoundItem.create([
    {
      title: 'Lost - Black JBL Earphones',
      description: 'Lost my JBL earphones near the library entrance. Have a small star sticker on the case.',
      status: 'lost',
      locationLost: 'Central Library, 2nd Floor',
      contactInfo: 'aarav@student.com | 9876543210',
      isResolved: false,
      images: [],
      postedBy: student1._id,
    },
    {
      title: 'Found - Student ID Card',
      description: 'Found a student ID card near the canteen. Name on card: Mayur Joshi',
      status: 'found',
      locationLost: 'Main Canteen',
      contactInfo: 'priya@student.com | 9876543211',
      isResolved: false,
      images: [],
      postedBy: student2._id,
    },
    {
      title: 'Lost - Blue Water Bottle (Milton)',
      description: 'Lost my 1L Milton water bottle near the gym. Has "RV" written in marker.',
      status: 'lost',
      locationLost: 'College Gymnasium',
      contactInfo: 'rahul@student.com',
      isResolved: false,
      images: [],
      postedBy: student3._id,
    },
  ]);

  // ─── Clubs ────────────────────────────────────────────────────────────────
  console.log('🎭 Seeding clubs...');
  const clubs = await Club.create([
    {
      name: 'Coding Club',
      description: 'A community for tech enthusiasts to learn, build, and compete together.',
      category: 'technical',
      members: [student1._id, student2._id],
      recruitmentOpen: true,
      recruitmentStartDate: new Date(),
      recruitmentEndDate: nextMonth,
      contactEmail: 'codingclub@college.edu',
      createdBy: adminUser._id,
    },
    {
      name: 'Cultural Fest Committee',
      description: 'Organizing and managing all cultural events on campus.',
      category: 'cultural',
      members: [student3._id, student4._id],
      recruitmentOpen: true,
      contactEmail: 'cultural@college.edu',
      createdBy: adminUser._id,
    },
    {
      name: 'Cricket Team',
      description: 'College cricket team competing at inter-college and state levels.',
      category: 'sports',
      members: [student2._id, student3._id],
      recruitmentOpen: false,
      contactEmail: 'cricket@college.edu',
      createdBy: adminUser._id,
    },
  ]);

  // ─── Campus Posts ─────────────────────────────────────────────────────────
  console.log('📢 Seeding campus posts...');
  await CampusPost.create([
    {
      title: 'Mid-Semester Examinations Schedule Released',
      content: 'The mid-semester examination schedule has been released. Please check the official portal for your timetable. Exams start from next Monday.',
      type: 'announcement',
      postedBy: adminUser._id,
      likes: [student1._id, student2._id, student3._id],
    },
    {
      title: 'TechFest 2024 - Register Now!',
      content: 'The annual college tech festival TechFest 2024 is here! Participate in hackathons, coding contests, tech talks, and exhibitions. Register at techfest.college.edu',
      type: 'event',
      club: clubs[0]._id,
      postedBy: student1._id,
      eventDate: nextMonth,
      eventVenue: 'Main Auditorium',
      likes: [student2._id, student4._id],
      comments: [
        { user: student2._id, text: 'Excited for this! Already registered!' },
        { user: student3._id, text: 'Will the prizes be announced beforehand?' },
      ],
    },
    {
      title: 'Coding Club - New Members Recruitment Open',
      content: 'The Coding Club is now recruiting new members for the academic year 2024-25! We welcome all branches and years. Fill the form in bio to apply.',
      type: 'recruitment',
      club: clubs[0]._id,
      postedBy: student1._id,
      likes: [student4._id],
    },
    {
      title: 'Canteen Menu Updated for Winter',
      content: 'The canteen committee has released the updated winter menu. New items include hot soups, dosas, and special combos at student prices!',
      type: 'general',
      postedBy: adminUser._id,
      likes: [student1._id, student2._id, student3._id, student4._id],
    },
    {
      title: 'Annual Sports Meet Registration',
      content: 'Registration for the Annual Sports Meet is now open. Events include cricket, football, badminton, table tennis, athletics, and chess.',
      type: 'event',
      club: clubs[2]._id,
      postedBy: student3._id,
      eventDate: twoMonths,
      eventVenue: 'College Sports Ground',
      likes: [student1._id, student4._id],
    },
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('───────────────────────────────────────────');
  console.log('📧 Admin:    admin@studentsphere.com / Admin@1234');
  console.log('📧 Student1: aarav@student.com      / Student@1234');
  console.log('📧 Student2: priya@student.com      / Student@1234');
  console.log('📧 Student3: rahul@student.com      / Student@1234');
  console.log('📧 Student4: sneha@student.com      / Student@1234');
  console.log('───────────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});