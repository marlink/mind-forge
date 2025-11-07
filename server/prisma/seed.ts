import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  await prisma.readReceipt.deleteMany();
  await prisma.communicationRecipient.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.progressRecord.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.sessionActivity.deleteMany();
  await prisma.session.deleteMany();
  await prisma.discussionTopic.deleteMany();
  await prisma.studentKnowledgeStream.deleteMany();
  await prisma.knowledgeLevel.deleteMany();
  await prisma.knowledgeStream.deleteMany();
  await prisma.rubricLevel.deleteMany();
  await prisma.assessmentRubric.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.bootcamp.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.facilitator.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.teachingExample.deleteMany();

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create Users
  console.log('👥 Creating users...');
  
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mindforge.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      Admin: {
        create: {
          permissions: ['all'],
          department: 'Operations',
        },
      },
    },
  });

  // Facilitators
  const facilitator1 = await prisma.user.create({
    data: {
      email: 'sarah.chen@mindforge.com',
      name: 'Dr. Sarah Chen',
      passwordHash,
      role: 'FACILITATOR',
      Facilitator: {
        create: {
          specialties: ['Logic', 'Cognitive Science', 'Education'],
          bio: 'Former university professor with 15 years experience in critical thinking education.',
          rating: 4.9,
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: ['09:00-15:00'],
          },
        },
      },
    },
    include: { Facilitator: true },
  });

  const facilitator2 = await prisma.user.create({
    data: {
      email: 'marcus.rodriguez@mindforge.com',
      name: 'Marcus Rodriguez',
      passwordHash,
      role: 'FACILITATOR',
      Facilitator: {
        create: {
          specialties: ['Mathematics', 'Data Visualization', 'Storytelling'],
          bio: 'Math educator passionate about making numbers meaningful and accessible.',
          rating: 4.7,
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: ['10:00-16:00'],
          },
        },
      },
    },
    include: { Facilitator: true },
  });

  // Parents
  const parent1User = await prisma.user.create({
    data: {
      email: 'david.johnson@email.com',
      name: 'David Johnson',
      passwordHash,
      role: 'PARENT',
      Parent: {
        create: {
          subscriptionStatus: 'active',
          notificationPreferences: {
            email: true,
            sms: false,
            push: true,
          },
        },
      },
    },
    include: { Parent: true },
  });

  const parent2User = await prisma.user.create({
    data: {
      email: 'priya.patel@email.com',
      name: 'Priya Patel',
      passwordHash,
      role: 'PARENT',
      Parent: {
        create: {
          subscriptionStatus: 'trial',
          notificationPreferences: {
            email: true,
            sms: false,
            push: false,
          },
        },
      },
    },
    include: { Parent: true },
  });

  // Students
  const student1 = await prisma.user.create({
    data: {
      email: 'alex.johnson@email.com',
      name: 'Alex Johnson',
      passwordHash,
      role: 'STUDENT',
      Student: {
        create: {
          age: 14,
          grade: '8th',
          interests: ['Physics', 'Coding', 'Robotics'],
          learningStyle: 'Visual, Hands-on',
          parentId: parent1User.Parent!.id,
          progress: {
            critical_thinking: 85,
            communication: 72,
            problem_solving: 90,
          },
        },
      },
    },
    include: { Student: true },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'maya.patel@email.com',
      name: 'Maya Patel',
      passwordHash,
      role: 'STUDENT',
      Student: {
        create: {
          age: 13,
          grade: '7th',
          interests: ['Creative Writing', 'History', 'Languages'],
          learningStyle: 'Verbal, Collaborative',
          parentId: parent2User.Parent!.id,
          progress: {
            critical_thinking: 65,
            communication: 88,
            problem_solving: 70,
          },
        },
      },
    },
    include: { Student: true },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'sam.williams@email.com',
      name: 'Sam Williams',
      passwordHash,
      role: 'STUDENT',
      Student: {
        create: {
          age: 15,
          grade: '9th',
          interests: ['Mathematics', 'Science', 'Engineering'],
          learningStyle: 'Analytical, Structured',
          progress: {
            critical_thinking: 78,
            communication: 65,
            problem_solving: 82,
          },
        },
      },
    },
    include: { Student: true },
  });

  // Create Bootcamps
  console.log('📚 Creating bootcamps...');

  const bootcamp1 = await prisma.bootcamp.create({
    data: {
      title: 'The Logic Explorer',
      subtitle: 'Thinking Like a Problem Solver',
      description: 'A one-week intensive where students become detectives of reasoning. We\'ll dissect arguments, spot logical fallacies, and build bullet-proof thinking skills.',
      duration: '5 days',
      format: ['IN_PERSON', 'ONLINE'],
      ageRange: '12-15',
      subjects: ['Logic', 'Critical Thinking', 'Problem Solving'],
      facilitatorId: facilitator1.Facilitator!.id,
      schedule: 'Mon-Fri, 9am-3pm',
      capacity: 8,
      price: 499,
      learningOutcomes: [
        'Identify and avoid common logical fallacies',
        'Construct valid arguments from evidence',
        'Solve complex problems using systematic approaches',
        'Present reasoning clearly to peers',
      ],
      weeklySchedule: {
        Monday: {
          theme: 'The Detective\'s Mindset',
          activities: ['Introduction to logical reasoning', 'Mystery solving exercises', 'Group debate foundations'],
        },
        Tuesday: {
          theme: 'Argument Architecture',
          activities: ['Building valid arguments', 'Spotting fallacies in media', 'Peer review sessions'],
        },
        Wednesday: {
          theme: 'Evidence and Proof',
          activities: ['Evidence evaluation', 'Scientific method application', 'Case study analysis'],
        },
        Thursday: {
          theme: 'Persuasion and Communication',
          activities: ['Ethical persuasion', 'Debate practice', 'Presentation skills'],
        },
        Friday: {
          theme: 'Master Problem Solver',
          activities: ['Complex problem solving', 'Final project presentation', 'Reflection and next steps'],
        },
      },
      prerequisites: ['Basic reading comprehension', 'Willingness to engage in discussion'],
      status: 'PUBLISHED',
      enrollmentCount: 2,
    },
  });

  const bootcamp2 = await prisma.bootcamp.create({
    data: {
      title: 'Numbers That Tell Stories',
      subtitle: 'Making Math Meaningful',
      description: 'Transform abstract numbers into compelling narratives. From train carriages of apples to real-world data analysis.',
      duration: '5 days',
      format: ['ONLINE'],
      ageRange: '13-15',
      subjects: ['Mathematics', 'Data Visualization', 'Storytelling'],
      facilitatorId: facilitator2.Facilitator!.id,
      schedule: 'Mon-Fri, 10am-4pm',
      capacity: 6,
      price: 449,
      learningOutcomes: [
        'Visualize large numbers using relatable analogies',
        'Create data stories that engage audiences',
        'Apply mathematical concepts to real-world problems',
        'Develop confidence in mathematical communication',
      ],
      weeklySchedule: {
        Monday: {
          theme: 'Numbers in Context',
          activities: ['Understanding scale', 'Analogies and metaphors', 'Real-world number exploration'],
        },
        Tuesday: {
          theme: 'Data Visualization',
          activities: ['Creating visual stories', 'Chart and graph design', 'Interactive data exploration'],
        },
        Wednesday: {
          theme: 'Mathematical Narratives',
          activities: ['Storytelling with numbers', 'Problem-solving narratives', 'Peer presentations'],
        },
        Thursday: {
          theme: 'Real-World Applications',
          activities: ['Data analysis projects', 'Community data collection', 'Presentation preparation'],
        },
        Friday: {
          theme: 'Data Storyteller',
          activities: ['Final project presentations', 'Peer feedback', 'Reflection and growth'],
        },
      },
      prerequisites: ['Basic math skills', 'Interest in storytelling'],
      status: 'PUBLISHED',
      enrollmentCount: 1,
    },
  });

  const bootcamp3 = await prisma.bootcamp.create({
    data: {
      title: 'Creative Problem Solving',
      subtitle: 'Innovation Through Design Thinking',
      description: 'Learn to approach problems creatively using design thinking methodologies.',
      duration: '5 days',
      format: ['HYBRID'],
      ageRange: '14-16',
      subjects: ['Design Thinking', 'Innovation', 'Collaboration'],
      facilitatorId: facilitator1.Facilitator!.id,
      schedule: 'Mon-Fri, 9am-3pm',
      capacity: 10,
      price: 549,
      learningOutcomes: [
        'Apply design thinking to real problems',
        'Prototype and test solutions',
        'Collaborate effectively in teams',
        'Present innovative ideas',
      ],
      weeklySchedule: {},
      prerequisites: [],
      status: 'DRAFT',
      enrollmentCount: 0,
    },
  });

  // Create Sessions
  console.log('📅 Creating sessions...');

  const session1 = await prisma.session.create({
    data: {
      bootcampId: bootcamp1.id,
      day: 1,
      theme: 'The Detective\'s Mindset',
      date: new Date('2024-02-05T09:00:00Z'),
      startTime: '09:00',
      endTime: '15:00',
      activities: {
        create: [
          {
            time: '9:00-10:30',
            type: 'Interactive Lecture',
            title: 'What is Logical Reasoning?',
            description: 'Introduction to the tools detectives and scientists use to think clearly',
            materials: ['slides_intro.pdf', 'reasoning_examples.pdf'],
            learningObjectives: ['Define logical reasoning', 'Identify basic argument structures'],
            facilitatorNotes: 'Focus on making abstract concepts concrete through examples',
            studentDeliverables: ['Notes on key concepts', 'Example argument analysis'],
          },
          {
            time: '10:30-12:00',
            type: 'Group Exercise',
            title: 'The Mystery of the Missing Cake',
            description: 'Solve a classroom mystery using logical deduction',
            materials: ['mystery_case.pdf', 'evidence_cards.pdf'],
            learningObjectives: ['Apply reasoning to solve problems', 'Work collaboratively'],
            facilitatorNotes: 'Encourage students to explain their reasoning process',
            studentDeliverables: ['Mystery solution with reasoning', 'Group presentation'],
          },
          {
            time: '13:00-14:30',
            type: 'Peer Teaching',
            title: 'Becoming the Reasoning Expert',
            description: 'Students teach each other the concepts learned in the morning',
            materials: ['teaching_guidelines.pdf'],
            learningObjectives: ['Reinforce learning through teaching', 'Develop communication skills'],
            facilitatorNotes: 'Rotate teaching roles to give everyone a chance',
            studentDeliverables: ['Teaching notes', 'Peer feedback forms'],
          },
        ],
      },
    },
  });

  const session2 = await prisma.session.create({
    data: {
      bootcampId: bootcamp1.id,
      day: 2,
      theme: 'Argument Architecture',
      date: new Date('2024-02-06T09:00:00Z'),
      startTime: '09:00',
      endTime: '15:00',
      activities: {
        create: [
          {
            time: '9:00-10:30',
            type: 'Workshop',
            title: 'Building Valid Arguments',
            description: 'Learn the structure of sound arguments',
            materials: ['argument_structure.pdf'],
            learningObjectives: ['Identify premises and conclusions', 'Construct valid arguments'],
            studentDeliverables: ['Argument construction exercise'],
          },
        ],
      },
    },
  });

  const session3 = await prisma.session.create({
    data: {
      bootcampId: bootcamp2.id,
      day: 1,
      theme: 'Numbers in Context',
      date: new Date('2024-02-12T10:00:00Z'),
      startTime: '10:00',
      endTime: '16:00',
      activities: {
        create: [
          {
            time: '10:00-11:30',
            type: 'Interactive Lecture',
            title: 'Understanding Scale',
            description: 'Exploring large numbers through relatable analogies',
            materials: ['scale_examples.pdf'],
            learningObjectives: ['Visualize large numbers', 'Create meaningful analogies'],
            studentDeliverables: ['Scale visualization project'],
          },
        ],
      },
    },
  });

  // Create Enrollments
  console.log('🎓 Creating enrollments...');

  await prisma.enrollment.create({
    data: {
      studentId: student1.Student!.id,
      bootcampId: bootcamp1.id,
      status: 'ACTIVE',
      enrolledAt: new Date('2024-01-15T10:00:00Z'),
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: student2.Student!.id,
      bootcampId: bootcamp1.id,
      status: 'ACTIVE',
      enrolledAt: new Date('2024-01-20T10:00:00Z'),
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: student1.Student!.id,
      bootcampId: bootcamp2.id,
      status: 'ACTIVE',
      enrolledAt: new Date('2024-01-25T10:00:00Z'),
    },
  });

  // Create Attendance Records
  console.log('✅ Creating attendance records...');

  await prisma.attendanceRecord.create({
    data: {
      sessionId: session1.id,
      studentId: student1.Student!.id,
      status: 'PRESENT',
      joinTime: new Date('2024-02-05T09:00:00Z'),
      leaveTime: new Date('2024-02-05T15:00:00Z'),
      engagementScore: 8,
    },
  });

  await prisma.attendanceRecord.create({
    data: {
      sessionId: session1.id,
      studentId: student2.Student!.id,
      status: 'PRESENT',
      joinTime: new Date('2024-02-05T09:05:00Z'),
      leaveTime: new Date('2024-02-05T15:00:00Z'),
      engagementScore: 9,
    },
  });

  await prisma.attendanceRecord.create({
    data: {
      sessionId: session2.id,
      studentId: student1.Student!.id,
      status: 'LATE',
      joinTime: new Date('2024-02-06T09:15:00Z'),
      leaveTime: new Date('2024-02-06T15:00:00Z'),
      engagementScore: 7,
    },
  });

  // Create Progress Records
  console.log('📊 Creating progress records...');

  await prisma.progressRecord.create({
    data: {
      studentId: student1.Student!.id,
      bootcampId: bootcamp1.id,
      sessionId: session1.id,
      skill: 'Critical Thinking',
      level: 'Intermediate',
      assessmentDate: new Date('2024-02-05T15:00:00Z'),
      facilitatorId: facilitator1.Facilitator!.id,
      evidence: 'Successfully solved mystery case using logical deduction',
      nextSteps: 'Continue practicing argument construction',
    },
  });

  await prisma.progressRecord.create({
    data: {
      studentId: student2.Student!.id,
      bootcampId: bootcamp1.id,
      sessionId: session1.id,
      skill: 'Communication',
      level: 'Advanced',
      assessmentDate: new Date('2024-02-05T15:00:00Z'),
      facilitatorId: facilitator1.Facilitator!.id,
      evidence: 'Excellent peer teaching presentation',
      nextSteps: 'Focus on argument structure',
    },
  });

  // Create Knowledge Streams
  console.log('🌊 Creating knowledge streams...');

  const knowledgeStream1 = await prisma.knowledgeStream.create({
    data: {
      name: 'Science & Technology',
      description: 'From physics fundamentals to cutting-edge technology',
      color: '#3B82F6',
      icon: '🔬',
      levels: {
        create: [
          {
            level: 1,
            title: 'Science Explorer',
            skills: ['Scientific Method', 'Basic Physics', 'Data Analysis'],
            prerequisites: [],
            nextLevel: 2,
            estimatedCompletionTime: '5 weeks',
            bootcampIds: [bootcamp2.id],
          },
          {
            level: 2,
            title: 'Tech Innovator',
            skills: ['Coding Fundamentals', 'Engineering Principles', 'Project Development'],
            prerequisites: [1],
            nextLevel: 3,
            estimatedCompletionTime: '8 weeks',
            bootcampIds: [],
          },
        ],
      },
    },
  });

  const knowledgeStream2 = await prisma.knowledgeStream.create({
    data: {
      name: 'Humanities & Communication',
      description: 'Mastering language, history, and persuasive communication',
      color: '#10B981',
      icon: '📚',
      levels: {
        create: [
          {
            level: 1,
            title: 'Storyteller',
            skills: ['Logical Reasoning', 'Narrative Structure', 'Clear Communication'],
            prerequisites: [],
            nextLevel: 2,
            estimatedCompletionTime: '5 weeks',
            bootcampIds: [bootcamp1.id],
          },
        ],
      },
    },
  });

  // Assign Knowledge Streams to Students
  await prisma.studentKnowledgeStream.create({
    data: {
      studentId: student1.Student!.id,
      knowledgeStreamId: knowledgeStream1.id,
    },
  });

  await prisma.studentKnowledgeStream.create({
    data: {
      studentId: student1.Student!.id,
      knowledgeStreamId: knowledgeStream2.id,
    },
  });

  await prisma.studentKnowledgeStream.create({
    data: {
      studentId: student2.Student!.id,
      knowledgeStreamId: knowledgeStream2.id,
    },
  });

  // Create Discussion Topics
  console.log('💬 Creating discussion topics...');

  await prisma.discussionTopic.create({
    data: {
      bootcampId: bootcamp1.id,
      day: 2,
      title: 'The Ethics of Persuasion',
      prompt: 'If you can use logic to persuade people of anything, what responsibilities do you have? Is it ethical to persuade someone of something that benefits you but might not benefit them?',
      guidance: 'Consider real-world examples like advertising, political campaigns, and social media',
      expectedOutcomes: ['Understand ethical dimensions of persuasion', 'Develop critical stance toward persuasive messages'],
      tags: ['ethics', 'persuasion', 'critical thinking'],
    },
  });

  await prisma.discussionTopic.create({
    data: {
      bootcampId: bootcamp2.id,
      day: 3,
      title: 'Numbers in the Real World',
      prompt: 'Find a statistic in the news today. How could you make it more understandable using the apple/train method or another analogy? What might be hidden or misleading about this statistic?',
      guidance: 'Look for numbers about climate change, economics, or technology',
      expectedOutcomes: ['Apply visualization techniques to real data', 'Develop skepticism toward statistics'],
      tags: ['data', 'visualization', 'critical thinking'],
    },
  });

  // Create Assessment Rubrics
  console.log('📋 Creating assessment rubrics...');

  const rubric1 = await prisma.assessmentRubric.create({
    data: {
      skill: 'Critical Thinking',
      assessmentActivities: ['Argument analysis', 'Problem solving', 'Evidence evaluation'],
      levels: {
        create: [
          {
            level: 'Beginner',
            description: 'Can identify basic argument structures',
            criteria: ['Recognizes premises and conclusions', 'Identifies simple logical connections'],
          },
          {
            level: 'Intermediate',
            description: 'Can construct valid arguments and identify fallacies',
            criteria: ['Builds sound arguments', 'Spots common logical fallacies', 'Uses evidence effectively'],
          },
          {
            level: 'Advanced',
            description: 'Can analyze complex arguments and construct sophisticated reasoning',
            criteria: ['Evaluates complex arguments', 'Constructs nuanced reasoning', 'Applies critical thinking to novel situations'],
          },
        ],
      },
    },
  });

  const rubric2 = await prisma.assessmentRubric.create({
    data: {
      skill: 'Communication',
      assessmentActivities: ['Peer teaching', 'Presentations', 'Written arguments'],
      levels: {
        create: [
          {
            level: 'Beginner',
            description: 'Can express ideas clearly',
            criteria: ['Clear articulation', 'Basic organization'],
          },
          {
            level: 'Intermediate',
            description: 'Can present ideas persuasively',
            criteria: ['Structured presentation', 'Uses evidence', 'Engages audience'],
          },
          {
            level: 'Advanced',
            description: 'Can adapt communication style to audience',
            criteria: ['Tailors message to audience', 'Uses multiple communication modes', 'Handles questions effectively'],
          },
        ],
      },
    },
  });

  // Create Teaching Examples
  console.log('📖 Creating teaching examples...');

  await prisma.teachingExample.create({
    data: {
      concept: 'Logical Fallacies',
      abstractDescription: 'Errors in reasoning that undermine the validity of arguments',
      concreteAnalogy: 'Like a bridge with weak supports - it might look solid but will collapse under pressure',
      visualAid: 'Bridge diagram showing weak vs strong supports',
      discussionQuestions: [
        'Can you think of a time you were persuaded by a weak argument?',
        'Why do logical fallacies work even though they\'re flawed?',
        'How can we spot fallacies in everyday life?',
      ],
      subjectArea: 'Logic',
      difficultyLevel: 'Intermediate',
    },
  });

  await prisma.teachingExample.create({
    data: {
      concept: 'Large Numbers',
      abstractDescription: 'Understanding scale and magnitude of large numbers',
      concreteAnalogy: 'If one apple represents 1,000,000, then a train car full of apples represents 1 billion',
      visualAid: 'Visual representation of apples in train cars',
      discussionQuestions: [
        'How does visualizing numbers help us understand them?',
        'What other analogies can we use for large numbers?',
        'Why do large numbers feel abstract?',
      ],
      subjectArea: 'Mathematics',
      difficultyLevel: 'Beginner',
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('  Admin: admin@mindforge.com / password123');
  console.log('  Facilitator: sarah.chen@mindforge.com / password123');
  console.log('  Parent: david.johnson@email.com / password123');
  console.log('  Student: alex.johnson@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

