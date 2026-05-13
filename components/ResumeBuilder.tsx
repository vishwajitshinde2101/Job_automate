import React, { useState } from 'react';
import {
  FileUser,
  Download,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  FolderOpen,
  Coffee,
  Monitor,
} from 'lucide-react';
import jsPDF from 'jspdf';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface Experience {
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
}

interface Project {
  name: string;
  description: string;
  responsibilities: string;
}

interface SkillCategory {
  heading: string;
  items: string;
}

interface Education {
  degree: string;
  institute: string;
  year: string;
  gpa?: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  professionalSummary: string;
  skills: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  certifications: string;
}

interface TemplateStyle {
  layout: 'classic' | 'modern' | 'executive' | 'minimal';
  accent: string;
}

interface Template {
  id: string;
  name: string;
  tagline: string;
  style: TemplateStyle;
  data: ResumeData;
}

type Position = 'java' | 'dotnet';
type Step = 'position' | 'template' | 'editor';

// ─── Java Developer Templates ─────────────────────────────────────────────────

const JAVA_TEMPLATES: Template[] = [
  {
    id: 'java-1',
    name: 'Classic Navy',
    tagline: 'Clean & Professional',
    style: { layout: 'classic', accent: '#1e3a5f' },
    data: {
      fullName: 'Rahul Singh',
      email: 'rahul.singh@email.com',
      phone: '+91 98765 43210',
      location: 'Mumbai, Maharashtra',
      linkedin: 'linkedin.com/in/rahulsingh',
      github: 'github.com/rahulsingh',
      portfolio: '',
      professionalSummary: 'Java Developer with 2+ years of experience building RESTful APIs and backend services using Spring Boot. Passionate about clean code, SOLID principles, and delivering scalable solutions.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 17, Spring Boot, Spring MVC, Hibernate, JPA, REST APIs, MySQL, Maven, Git, JUnit, Postman' },
        { heading: 'Soft Skills', items: 'Problem Solving, Team Collaboration, Communication, Quick Learner' },
      ],
      experiences: [
        {
          company: 'Infosys Ltd',
          role: 'Associate Software Engineer',
          duration: 'Jul 2022 - Present',
          responsibilities: 'Developed RESTful APIs using Spring Boot serving 50K+ daily requests\nIntegrated third-party payment APIs and reduced transaction errors by 30%\nWrote unit tests with JUnit achieving 80% code coverage',
        },
        {
          company: 'Tech Mahindra',
          role: 'Intern - Java Developer',
          duration: 'Jan 2022 - Jun 2022',
          responsibilities: 'Built CRUD modules for internal HR management system\nAssisted in database schema design and query optimization with MySQL',
        },
      ],
      projects: [
        {
          name: 'Online Library Management System',
          description: 'Full-featured library management system with book catalog, member management, and borrowing workflows',
          responsibilities: 'Designed and developed book catalog and member management modules\nImplemented borrowing workflow with automated due-date tracking\nCreated responsive UI using Thymeleaf templates',
        },
        {
          name: 'Employee Payroll REST API',
          description: 'RESTful API for payroll processing with JWT authentication and role-based access control',
          responsibilities: 'Built RESTful API endpoints with JWT-based authentication\nImplemented role-based access control for admin and employee roles\nDesigned payroll calculation logic with tax deduction rules',
        },
      ],
      educations: [
        { degree: 'B.E. in Computer Science', institute: 'Mumbai University', year: '2022', gpa: '8.2/10' },
      ],
      certifications: 'Oracle Certified Associate Java SE 11, Spring Boot Fundamentals - Udemy',
    },
  },
  {
    id: 'java-2',
    name: 'Modern Green',
    tagline: 'Sidebar Layout · Microservices',
    style: { layout: 'modern', accent: '#2d6a4f' },
    data: {
      fullName: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      phone: '+91 90123 45678',
      location: 'Pune, Maharashtra',
      linkedin: 'linkedin.com/in/arjunmehta',
      github: 'github.com/arjunmehta',
      portfolio: 'arjunmehta.dev',
      professionalSummary: 'Backend Java Developer with 4 years of experience in microservices architecture, container orchestration, and high-throughput distributed systems. Delivered production systems handling 500K+ daily transactions.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 17, Spring Boot, Spring Cloud, Microservices, Docker, Kubernetes, Kafka, Redis, PostgreSQL, Maven, Jenkins, Git, REST APIs, GraphQL' },
        { heading: 'Soft Skills', items: 'Analytical Thinking, Agile/Scrum, Technical Documentation, Mentoring' },
      ],
      experiences: [
        {
          company: 'Persistent Systems',
          role: 'Senior Software Engineer',
          duration: 'Apr 2022 - Present',
          responsibilities: 'Architected microservices handling 500K+ daily transactions using Spring Cloud\nDeployed containerized services on Kubernetes reducing infrastructure costs by 40%\nIntegrated Kafka event streaming for async order processing pipeline',
        },
        {
          company: 'Wipro Technologies',
          role: 'Software Engineer',
          duration: 'Jul 2020 - Mar 2022',
          responsibilities: 'Built REST APIs for banking portal serving 200K users\nOptimized Hibernate queries reducing response time by 35%\nImplemented Redis caching layer improving throughput by 60%',
        },
      ],
      projects: [
        {
          name: 'E-Commerce Microservices Platform',
          description: 'Microservices ecosystem with API gateway, service discovery, and distributed tracing',
          responsibilities: 'Designed API gateway and service discovery for microservices ecosystem\nImplemented distributed tracing for debugging cross-service issues\nSet up containerized deployment pipeline with Docker and Kubernetes',
        },
        {
          name: 'Real-time Notification Service',
          description: 'Push notification service processing 1M+ daily events with sub-second delivery',
          responsibilities: 'Built real-time push notification system using WebSockets\nDesigned event-driven architecture with Kafka message queues\nImplemented notification preferences and delivery tracking',
        },
      ],
      educations: [
        { degree: 'B.Tech in Information Technology', institute: 'Savitribai Phule Pune University', year: '2020', gpa: '8.6/10' },
      ],
      certifications: 'Oracle Java SE 11 Developer, AWS Certified Developer Associate, Docker Certified Associate',
    },
  },
  {
    id: 'java-3',
    name: 'Executive Charcoal',
    tagline: 'Bold Header · Senior Level',
    style: { layout: 'executive', accent: '#2d3436' },
    data: {
      fullName: 'Vikram Nair',
      email: 'vikram.nair@email.com',
      phone: '+91 98456 78901',
      location: 'Bangalore, Karnataka',
      linkedin: 'linkedin.com/in/vikramnair',
      github: 'github.com/vikramnair',
      portfolio: '',
      professionalSummary: 'Senior Java Developer with 6+ years of experience building enterprise-grade systems for BFSI and e-commerce domains. Expert in Spring ecosystem, microservices, and cloud-native architecture. Proven track record leading teams of 5-8 engineers.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 11/17, Spring Boot, Spring Security, Spring Cloud, Microservices, AWS (EC2, RDS, SQS), Docker, Kubernetes, Kafka, MongoDB, PostgreSQL, Jenkins, SonarQube' },
        { heading: 'Soft Skills', items: 'Leadership, Strategic Planning, Stakeholder Management, Code Review, Agile Coaching' },
      ],
      experiences: [
        {
          company: 'Mphasis Ltd',
          role: 'Technical Lead - Java',
          duration: 'Jan 2021 - Present',
          responsibilities: 'Led a team of 7 developers delivering fintech microservices platform\nDesigned event-driven architecture processing 2M+ daily financial transactions\nReduced system downtime by 70% through circuit breaker and retry patterns',
        },
        {
          company: 'HCL Technologies',
          role: 'Senior Java Developer',
          duration: 'Jun 2018 - Dec 2020',
          responsibilities: 'Built core banking APIs integrated with 12 third-party vendors\nMigrated monolithic application to microservices saving 40L annually\nImplemented OAuth2 and JWT-based authentication across all services',
        },
      ],
      projects: [
        {
          name: 'Digital Banking Platform',
          description: 'Core banking platform serving 1M+ customers with 99.9% uptime SLA',
          responsibilities: 'Architected payment processing pipeline with multi-gateway support\nDesigned fraud detection rules engine with real-time scoring\nImplemented distributed caching for transaction deduplication',
        },
        {
          name: 'Loan Origination System',
          description: 'Automated loan processing system reducing approval time from 3 days to 4 hours',
          responsibilities: 'Built automated loan approval workflow with multi-level review\nDesigned regulatory compliance reporting module\nImplemented batch processing for end-of-day reconciliation',
        },
      ],
      educations: [
        { degree: 'M.Tech in Computer Science', institute: 'NIT Calicut', year: '2018', gpa: '8.9/10' },
        { degree: 'B.Tech in Computer Science', institute: 'Cochin University of Science and Technology', year: '2016', gpa: '8.4/10' },
      ],
      certifications: 'Oracle Java SE 17 Developer, AWS Solutions Architect Associate, Certified Kubernetes Administrator',
    },
  },
  {
    id: 'java-4',
    name: 'Minimal Slate',
    tagline: 'Clean Lines · Mid-Level',
    style: { layout: 'minimal', accent: '#4a6fa5' },
    data: {
      fullName: 'Suresh Reddy',
      email: 'suresh.reddy@email.com',
      phone: '+91 99887 65432',
      location: 'Hyderabad, Telangana',
      linkedin: 'linkedin.com/in/sureshreddy',
      github: 'github.com/sureshreddy',
      portfolio: '',
      professionalSummary: 'Java Developer with 3 years of hands-on experience in backend development, REST API design, and database optimization. Skilled in delivering clean, testable code following TDD practices.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 11, Spring Boot, Hibernate, JPA, REST APIs, MySQL, PostgreSQL, Maven, Git, JUnit 5, Mockito, Swagger' },
        { heading: 'Soft Skills', items: 'Attention to Detail, Teamwork, Continuous Learning, Problem Solving' },
      ],
      experiences: [
        {
          company: 'Cyient Ltd',
          role: 'Software Developer',
          duration: 'Aug 2021 - Present',
          responsibilities: 'Developed and maintained 15+ REST endpoints for logistics management platform\nOptimized SQL queries reducing average response time from 800ms to 120ms\nImplemented Swagger documentation for all APIs',
        },
        {
          company: 'Zensar Technologies',
          role: 'Junior Developer',
          duration: 'Jul 2020 - Jul 2021',
          responsibilities: 'Built CRUD modules using Spring Boot and MySQL\nImproved unit test coverage to 75% with JUnit and Mockito',
        },
      ],
      projects: [
        {
          name: 'Inventory Management API',
          description: 'RESTful API for warehouse inventory tracking with real-time stock updates and low-stock alerts',
          responsibilities: 'Developed order tracking and shipment status modules\nImplemented warehouse inventory sync with real-time updates\nDesigned caching layer for frequently accessed logistics data',
        },
        {
          name: 'Student Portal Backend',
          description: 'Backend service for university student portal handling 10K concurrent users',
          responsibilities: 'Built task creation and assignment workflow for team management\nImplemented progress tracking dashboard with visual reports\nDesigned notification system for task deadlines and updates',
        },
      ],
      educations: [
        { degree: 'B.Tech in Electronics & Communication', institute: 'JNTU Hyderabad', year: '2020', gpa: '7.9/10' },
      ],
      certifications: 'Spring Framework 6 - Udemy, Java Programming Masterclass - Udemy',
    },
  },
  {
    id: 'java-5',
    name: 'Classic Royal Blue',
    tagline: 'Traditional · Full-Stack Java',
    style: { layout: 'classic', accent: '#1565c0' },
    data: {
      fullName: 'Karan Joshi',
      email: 'karan.joshi@email.com',
      phone: '+91 97654 32109',
      location: 'Chennai, Tamil Nadu',
      linkedin: 'linkedin.com/in/karanjoshi',
      github: 'github.com/karanjoshi',
      portfolio: 'karanjoshi.in',
      professionalSummary: 'Full-stack Java Developer with 4 years building enterprise web applications using Spring Boot and Angular. Experienced in JEE standards, enterprise integration patterns, and Oracle database administration.',
      skills: [
        { heading: 'Technical Skills', items: 'Java EE, Spring Boot, Spring MVC, Hibernate, Oracle DB, PL/SQL, Angular, REST APIs, SOAP, Maven, Git, Jenkins, JUnit' },
        { heading: 'Soft Skills', items: 'Communication, Adaptability, Client Interaction, Agile Development' },
      ],
      experiences: [
        {
          company: 'Cognizant Technology Solutions',
          role: 'Programmer Analyst',
          duration: 'Mar 2021 - Present',
          responsibilities: 'Developed enterprise insurance processing application serving 300K policies\nBuilt Angular front-end consuming Spring Boot REST APIs\nManaged Oracle database with stored procedures and PL/SQL packages',
        },
        {
          company: 'Tata Consultancy Services',
          role: 'Assistant System Engineer',
          duration: 'Sep 2019 - Feb 2021',
          responsibilities: 'Implemented SOAP-based integrations with legacy banking systems\nMigrated J2EE application to Spring Boot reducing codebase by 40%',
        },
      ],
      projects: [
        {
          name: 'Insurance Claims Portal',
          description: 'End-to-end claims processing portal with workflow automation and document management',
          responsibilities: 'Developed claims processing workflow with document management\nImplemented integration layer connecting legacy and modern systems\nDesigned reporting module for policy analytics',
        },
        {
          name: 'Product Catalog Microservice',
          description: 'Standalone catalog service with full-text search and multi-language support',
          responsibilities: 'Built full-text search engine for internal knowledge repository\nDesigned document indexing and retrieval pipeline\nImplemented access control and audit logging for searches',
        },
      ],
      educations: [
        { degree: 'B.E. in Information Science', institute: 'Anna University', year: '2019', gpa: '8.1/10' },
      ],
      certifications: 'Oracle Certified Professional Java SE 11, IBM Integration Bus Developer',
    },
  },
  {
    id: 'java-6',
    name: 'Modern Teal',
    tagline: 'Sidebar Layout · Security Expert',
    style: { layout: 'modern', accent: '#00695c' },
    data: {
      fullName: 'Aditya Kumar',
      email: 'aditya.kumar@email.com',
      phone: '+91 95432 10987',
      location: 'New Delhi, India',
      linkedin: 'linkedin.com/in/adityakumar',
      github: 'github.com/adityakumar',
      portfolio: '',
      professionalSummary: 'Senior Java Backend Developer with 5 years of expertise in Spring Security, OAuth2, and event-driven systems. Specialized in building secure, high-availability APIs for healthcare and fintech platforms.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 17, Spring Boot, Spring Security, OAuth2, JWT, Kafka, RabbitMQ, Redis, MongoDB, PostgreSQL, Docker, AWS, Elasticsearch' },
        { heading: 'Soft Skills', items: 'Security Mindset, System Design, Technical Leadership, Code Quality' },
      ],
      experiences: [
        {
          company: 'Paytm (One97 Communications)',
          role: 'Senior Software Engineer',
          duration: 'Feb 2021 - Present',
          responsibilities: 'Implemented OAuth2 authorization server handling 5M+ daily authentications\nBuilt Kafka-based event streaming pipeline processing 2M transactions/day\nReduced API latency by 50% through Redis caching and DB query optimization',
        },
        {
          company: 'Ola Cabs',
          role: 'Software Engineer',
          duration: 'Jun 2019 - Jan 2021',
          responsibilities: 'Developed ride allocation microservice using Spring Boot and Redis\nIntegrated payment gateway APIs with 99.8% success rate',
        },
      ],
      projects: [
        {
          name: 'Secure Multi-tenant API Gateway',
          description: 'Centralized API gateway with per-tenant rate limiting, JWT validation, and audit logging',
          responsibilities: 'Built OAuth2 authorization server with multi-tenant support\nDesigned token management and session invalidation system\nImplemented rate limiting and abuse detection mechanisms',
        },
        {
          name: 'Healthcare Data Pipeline',
          description: 'HIPAA-compliant data ingestion pipeline processing 500K+ patient records daily',
          responsibilities: 'Developed automated data ingestion pipeline for audit logs\nDesigned search and analytics dashboard for compliance team\nImplemented data retention policies with automated archival',
        },
      ],
      educations: [
        { degree: 'M.Tech in Software Engineering', institute: 'Delhi Technological University', year: '2019', gpa: '8.7/10' },
      ],
      certifications: 'Oracle Java SE 17, AWS Certified Security Specialty, Certified Ethical Hacker (CEH)',
    },
  },
  {
    id: 'java-7',
    name: 'Executive Purple',
    tagline: 'Bold Header · Architect Level',
    style: { layout: 'executive', accent: '#4a148c' },
    data: {
      fullName: 'Praveen Rao',
      email: 'praveen.rao@email.com',
      phone: '+91 94321 09876',
      location: 'Bangalore, Karnataka',
      linkedin: 'linkedin.com/in/praveenrao',
      github: '',
      portfolio: '',
      professionalSummary: 'Java Solution Architect with 8+ years designing large-scale distributed systems for BFSI, e-commerce, and healthcare. Expert in cloud-native architecture, system design, and engineering team leadership.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 8/11/17, Spring Boot, Spring Cloud, AWS (Lambda, EKS, RDS, SQS), Kafka, Redis, PostgreSQL, MongoDB, Kubernetes, Terraform, CI/CD, GraphQL, Elasticsearch' },
        { heading: 'Soft Skills', items: 'Architecture Design, Technical Strategy, Cross-functional Leadership, Mentorship' },
      ],
      experiences: [
        {
          company: 'Razorpay',
          role: 'Principal Engineer / Java Architect',
          duration: 'Jan 2020 - Present',
          responsibilities: 'Architected payment orchestration platform processing 10,000 Cr/month\nDesigned multi-region active-active deployment achieving 99.99% uptime\nLed team of 15 engineers across 3 squads driving quarterly OKRs',
        },
        {
          company: 'Flipkart Internet Pvt Ltd',
          role: 'Senior Software Engineer',
          duration: 'May 2016 - Dec 2019',
          responsibilities: 'Built order management service handling 50M orders during Big Billion Day\nDesigned distributed caching strategy reducing DB load by 70%',
        },
      ],
      projects: [
        {
          name: 'Payment Orchestration Engine',
          description: 'High-throughput payment routing engine with intelligent retry, fallback, and reconciliation',
          responsibilities: 'Designed payment orchestration flow with retry and fallback logic\nBuilt merchant onboarding and settlement reconciliation system\nImplemented real-time monitoring dashboard for transaction health',
        },
        {
          name: 'Real-time Fraud Detection System',
          description: 'ML-integrated fraud detection pipeline evaluating 10K transactions/second with <50ms latency',
          responsibilities: 'Built real-time recommendation engine for product suggestions\nDesigned user behavior tracking and analytics pipeline\nImplemented A/B testing framework for recommendation models',
        },
      ],
      educations: [
        { degree: 'M.Tech in Computer Science', institute: 'IIT Madras', year: '2016', gpa: '9.1/10' },
      ],
      certifications: 'AWS Solutions Architect Professional, Certified Kubernetes Administrator, Oracle Java SE 17 Professional',
    },
  },
  {
    id: 'java-8',
    name: 'Minimal Blue-Grey',
    tagline: 'Understated · Mid-Level',
    style: { layout: 'minimal', accent: '#37474f' },
    data: {
      fullName: 'Nikhil Sharma',
      email: 'nikhil.sharma@email.com',
      phone: '+91 93210 98765',
      location: 'Noida, Uttar Pradesh',
      linkedin: 'linkedin.com/in/nikhilsharma',
      github: 'github.com/nikhilsharma',
      portfolio: '',
      professionalSummary: 'Backend Java Developer with 4 years of experience in Spring Boot API development and relational database design. Strong foundation in OOP, design patterns, and test-driven development.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 11, Spring Boot, Spring Data JPA, Hibernate, MySQL, PostgreSQL, Redis, Git, Maven, JUnit, Mockito, REST APIs, Swagger/OpenAPI' },
        { heading: 'Soft Skills', items: 'Systematic Thinking, Code Quality, Documentation, Team Collaboration' },
      ],
      experiences: [
        {
          company: 'HCL Technologies',
          role: 'Software Engineer',
          duration: 'Sep 2020 - Present',
          responsibilities: 'Designed and developed 20+ REST APIs for retail management platform\nImplemented database connection pooling with HikariCP improving throughput by 45%\nMaintained 85% unit test coverage with JUnit and Mockito',
        },
        {
          company: 'Mindtree Ltd',
          role: 'Associate Engineer',
          duration: 'Jul 2019 - Aug 2020',
          responsibilities: 'Built reporting module generating 50+ daily batch reports using Spring Batch\nFixed critical production bugs reducing incident tickets by 30%',
        },
      ],
      projects: [
        {
          name: 'Retail Inventory System',
          description: 'Multi-store inventory system with automated reorder triggers and supplier integrations',
          responsibilities: 'Developed inventory management and stock tracking module\nImplemented event-driven order processing with message queues\nDesigned POS integration for real-time sales data sync',
        },
        {
          name: 'JWT Auth Service',
          description: 'Centralized authentication microservice with refresh token rotation and session management',
          responsibilities: 'Built JWT-based authentication with refresh token rotation\nDesigned RBAC system with granular permission management\nImplemented security audit logging and threat detection',
        },
      ],
      educations: [
        { degree: 'B.Tech in Computer Science', institute: 'Amity University, Noida', year: '2019', gpa: '7.8/10' },
      ],
      certifications: 'Spring Professional Certification (VMware), Java SE 11 OCA',
    },
  },
  {
    id: 'java-9',
    name: 'Classic Deep Purple',
    tagline: 'Traditional · Cloud-Native',
    style: { layout: 'classic', accent: '#4527a0' },
    data: {
      fullName: 'Ankit Verma',
      email: 'ankit.verma@email.com',
      phone: '+91 92109 87654',
      location: 'Mumbai, Maharashtra',
      linkedin: 'linkedin.com/in/ankitverma',
      github: 'github.com/ankitverma',
      portfolio: 'ankitverma.tech',
      professionalSummary: 'Cloud-native Java Engineer with 5 years of experience delivering containerized microservices on AWS and GCP. Skilled in serverless patterns, infrastructure as code, and DevSecOps practices.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 17, Spring Boot, AWS Lambda, AWS EKS, GCP Cloud Run, Terraform, Docker, Kubernetes, Kafka, DynamoDB, PostgreSQL, GitHub Actions, Spring WebFlux' },
        { heading: 'Soft Skills', items: 'DevOps Culture, Continuous Improvement, Knowledge Sharing, Proactive Communication' },
      ],
      experiences: [
        {
          company: 'Accenture India',
          role: 'Cloud Application Engineer',
          duration: 'Nov 2020 - Present',
          responsibilities: 'Migrated 12 monolithic Java services to AWS serverless architecture saving $200K/year\nBuilt reactive APIs using Spring WebFlux handling 100K concurrent connections\nAutomated infrastructure provisioning with Terraform reducing setup time by 80%',
        },
        {
          company: 'Capgemini India',
          role: 'Java Developer',
          duration: 'Jun 2019 - Oct 2020',
          responsibilities: 'Containerized legacy Java apps using Docker and deployed to AWS ECS\nImplemented blue-green deployments via Jenkins and GitHub Actions pipelines',
        },
      ],
      projects: [
        {
          name: 'Serverless Order Processing System',
          description: 'Event-driven order workflow using AWS Lambda, SQS, and DynamoDB with zero cold-start impact',
          responsibilities: 'Designed serverless API endpoints with auto-scaling capabilities\nImplemented infrastructure-as-code for repeatable deployments\nBuilt event-driven processing pipeline with SQS and Lambda',
        },
        {
          name: 'Multi-cloud Deployment Framework',
          description: 'Abstraction layer enabling single-codebase deployment to AWS and GCP environments',
          responsibilities: 'Containerized legacy applications for cloud-native deployment\nDesigned CI/CD pipeline with automated testing and rollback\nImplemented blue-green deployment strategy for zero-downtime releases',
        },
      ],
      educations: [
        { degree: 'B.Tech in Computer Engineering', institute: 'VJTI Mumbai', year: '2019', gpa: '8.3/10' },
      ],
      certifications: 'AWS Developer Associate, Google Associate Cloud Engineer, HashiCorp Terraform Associate',
    },
  },
  {
    id: 'java-10',
    name: 'Modern Indigo',
    tagline: 'Sidebar Layout · Data Engineering',
    style: { layout: 'modern', accent: '#283593' },
    data: {
      fullName: 'Deepak Patel',
      email: 'deepak.patel@email.com',
      phone: '+91 91098 76543',
      location: 'Ahmedabad, Gujarat',
      linkedin: 'linkedin.com/in/deepakpatel',
      github: 'github.com/deepakpatel',
      portfolio: '',
      professionalSummary: 'Java & Big Data Engineer with 6 years of experience designing data pipelines and analytics platforms. Expert in Apache Spark, Kafka, and Hadoop ecosystem integrated with Java Spring backend services.',
      skills: [
        { heading: 'Technical Skills', items: 'Java 11/17, Spring Boot, Apache Spark, Apache Kafka, Hadoop, Hive, HDFS, Flink, AWS EMR, Databricks, PostgreSQL, MongoDB, Docker, Airflow' },
        { heading: 'Soft Skills', items: 'Data-Driven Thinking, Complex Problem Solving, Cross-team Collaboration, Technical Presentation' },
      ],
      experiences: [
        {
          company: 'Jio Platforms Ltd',
          role: 'Senior Data Engineer',
          duration: 'Mar 2021 - Present',
          responsibilities: 'Built real-time data pipeline ingesting 10TB/day using Kafka and Spark Streaming\nDeveloped Java-based data quality framework validating 50M+ records daily\nReduced ETL processing time by 65% through Spark optimization and partitioning',
        },
        {
          company: 'HDFC Bank - Technology Division',
          role: 'Software Engineer',
          duration: 'Aug 2018 - Feb 2021',
          responsibilities: 'Created batch processing jobs with Spring Batch for nightly reconciliation of 5M+ records\nIntegrated Hadoop ecosystem with existing Java banking applications',
        },
      ],
      projects: [
        {
          name: 'Real-time Analytics Dashboard',
          description: 'End-to-end analytics platform from data ingestion to BI visualization processing streaming data',
          responsibilities: 'Built real-time streaming analytics for network traffic monitoring\nDesigned alerting system with configurable threshold rules\nImplemented visualization dashboards using Kibana',
        },
        {
          name: 'Data Lake Ingestion Framework',
          description: 'Configurable framework for ingesting structured and semi-structured data from 30+ sources',
          responsibilities: 'Developed batch ETL pipeline for data warehouse population\nDesigned data quality validation framework\nImplemented automated scheduling with Apache Airflow',
        },
      ],
      educations: [
        { degree: 'M.E. in Computer Engineering', institute: 'Gujarat Technological University', year: '2018', gpa: '8.5/10' },
      ],
      certifications: 'Databricks Certified Apache Spark Developer, AWS Big Data Specialty, Confluent Kafka Developer',
    },
  },
];

// ─── .NET Developer Templates ─────────────────────────────────────────────────

const DOTNET_TEMPLATES: Template[] = [
  {
    id: 'dotnet-1',
    name: 'Classic Azure Blue',
    tagline: 'Clean & Professional',
    style: { layout: 'classic', accent: '#0078d4' },
    data: {
      fullName: 'Rohan Desai',
      email: 'rohan.desai@email.com',
      phone: '+91 98765 11111',
      location: 'Mumbai, Maharashtra',
      linkedin: 'linkedin.com/in/rohandesai',
      github: 'github.com/rohandesai',
      portfolio: '',
      professionalSummary: '.NET Developer with 2+ years of experience building ASP.NET Core Web APIs and MVC applications. Passionate about clean architecture principles and delivering maintainable, testable code.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, ASP.NET Core, .NET 6, Entity Framework Core, LINQ, MSSQL, REST APIs, NUnit, Git, Visual Studio, Azure Basics' },
        { heading: 'Soft Skills', items: 'Quick Learner, Team Player, Attention to Detail, Communication' },
      ],
      experiences: [
        {
          company: 'Infosys Ltd',
          role: 'Associate Software Engineer (.NET)',
          duration: 'Aug 2022 - Present',
          responsibilities: 'Developed ASP.NET Core REST APIs for insurance claims portal serving 40K users\nImplemented repository pattern and dependency injection improving code testability\nWrote NUnit tests achieving 78% code coverage',
        },
        {
          company: 'L&T Infotech',
          role: 'Intern - .NET Developer',
          duration: 'Feb 2022 - Jul 2022',
          responsibilities: 'Built admin dashboard using ASP.NET MVC and SQL Server\nAssisted in EF Core migrations and database design',
        },
      ],
      projects: [
        {
          name: 'Employee Leave Management System',
          description: 'ASP.NET Core application for leave request, approval workflow, and HR reporting',
          responsibilities: 'Developed patient registration and appointment booking modules\nImplemented doctor schedule management with conflict detection\nDesigned reporting dashboard for hospital administration',
        },
        {
          name: 'Product Inventory REST API',
          description: 'RESTful API with JWT authentication, pagination, and Swagger documentation',
          responsibilities: 'Built RESTful API endpoints for expense tracking and reporting\nImplemented receipt upload and categorization features\nDesigned budget analysis reports with monthly comparisons',
        },
      ],
      educations: [
        { degree: 'B.E. in Computer Science', institute: 'Mumbai University', year: '2022', gpa: '8.0/10' },
      ],
      certifications: 'Microsoft Certified: Azure Fundamentals (AZ-900), .NET Core Fundamentals - Pluralsight',
    },
  },
  {
    id: 'dotnet-2',
    name: 'Modern Purple',
    tagline: 'Sidebar Layout · Azure Specialist',
    style: { layout: 'modern', accent: '#5c2d91' },
    data: {
      fullName: 'Priya Kulkarni',
      email: 'priya.kulkarni@email.com',
      phone: '+91 90000 22222',
      location: 'Pune, Maharashtra',
      linkedin: 'linkedin.com/in/priyakulkarni',
      github: 'github.com/priyakulkarni',
      portfolio: 'priyakulkarni.dev',
      professionalSummary: '.NET Cloud Developer with 4 years of experience building Azure-native solutions using ASP.NET Core, Azure Functions, and Service Bus. Skilled in Blazor for full-stack development within the .NET ecosystem.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 7, ASP.NET Core, Blazor, Azure Functions, Azure Service Bus, Azure DevOps, EF Core, MSSQL, Cosmos DB, Docker, xUnit, REST APIs' },
        { heading: 'Soft Skills', items: 'Problem Solving, Agile Development, Technical Documentation, Collaboration' },
      ],
      experiences: [
        {
          company: 'Persistent Systems',
          role: 'Senior .NET Developer',
          duration: 'May 2022 - Present',
          responsibilities: 'Built Azure Functions-based serverless workflows processing 300K events/day\nDeveloped Blazor WebAssembly front-end eliminating separate JS codebase\nImplemented Azure Service Bus for async communication across 8 microservices',
        },
        {
          company: 'Syntel Inc',
          role: '.NET Developer',
          duration: 'Jun 2020 - Apr 2022',
          responsibilities: 'Created ASP.NET Core APIs integrated with Azure Cosmos DB\nSet up Azure DevOps CI/CD pipelines reducing deployment time by 55%',
        },
      ],
      projects: [
        {
          name: 'Serverless Invoice Processing',
          description: 'Event-driven invoice OCR and approval workflow using Azure Functions and Cognitive Services',
          responsibilities: 'Designed serverless document processing workflow\nImplemented AI-powered text extraction from uploaded documents\nBuilt notification system for document review status updates',
        },
        {
          name: 'Blazor HR Portal',
          description: 'Full-stack HR management portal built entirely in .NET using Blazor Server',
          responsibilities: 'Developed interactive dashboard with real-time data updates\nImplemented role-based access control for team management\nDesigned project timeline visualization with milestone tracking',
        },
      ],
      educations: [
        { degree: 'B.Tech in Information Technology', institute: 'Savitribai Phule Pune University', year: '2020', gpa: '8.4/10' },
      ],
      certifications: 'Microsoft Certified: Azure Developer Associate (AZ-204), Azure Fundamentals, Blazor Advanced - Pluralsight',
    },
  },
  {
    id: 'dotnet-3',
    name: 'Executive Dark Navy',
    tagline: 'Bold Header · Senior Architect',
    style: { layout: 'executive', accent: '#1b1f3b' },
    data: {
      fullName: 'Amit Kadam',
      email: 'amit.kadam@email.com',
      phone: '+91 98456 33333',
      location: 'Bangalore, Karnataka',
      linkedin: 'linkedin.com/in/amitkadam',
      github: '',
      portfolio: '',
      professionalSummary: '.NET Solution Architect with 7+ years designing enterprise applications on the Microsoft stack. Expert in microservices, CQRS/Event Sourcing, and Azure cloud architecture. Proven leader guiding cross-functional teams of 10+ engineers.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 6/7/8, ASP.NET Core, Azure (AKS, Service Bus, SQL, Cosmos DB), CQRS, MediatR, Entity Framework, gRPC, Docker, Kubernetes, Terraform, Azure DevOps' },
        { heading: 'Soft Skills', items: 'Architecture Design, Technical Leadership, Stakeholder Management, Agile Coaching, Mentorship' },
      ],
      experiences: [
        {
          company: 'Microsoft India R&D',
          role: '.NET Solution Architect',
          duration: 'Feb 2020 - Present',
          responsibilities: 'Architected enterprise SaaS platform on Azure handling 3M+ monthly active users\nDesigned CQRS+Event Sourcing patterns enabling full audit trail and replay\nLed team of 12 engineers across backend, DevOps, and QA squads',
        },
        {
          company: 'Zensar Technologies',
          role: 'Senior .NET Developer',
          duration: 'Apr 2017 - Jan 2020',
          responsibilities: 'Built enterprise WCF services migrated to ASP.NET Core Web API\nDelivered Azure migration project moving 8 on-prem apps to cloud',
        },
      ],
      projects: [
        {
          name: 'Enterprise SaaS Platform',
          description: 'Multi-tenant cloud SaaS with CQRS, event sourcing, and per-tenant data isolation on Azure',
          responsibilities: 'Architected multi-tenant SaaS infrastructure on Azure\nDesigned event-driven communication between platform services\nImplemented infrastructure automation with Terraform modules',
        },
        {
          name: 'API Gateway & Identity Platform',
          description: 'Centralized identity server using Duende IdentityServer with SSO for 15+ internal applications',
          responsibilities: 'Built centralized identity management platform\nImplemented SSO integration with enterprise Azure AD\nDesigned token-based API authorization framework',
        },
      ],
      educations: [
        { degree: 'M.Tech in Software Systems', institute: 'BITS Pilani', year: '2017', gpa: '9.0/10' },
      ],
      certifications: 'Microsoft AZ-305 Azure Solutions Architect Expert, Microsoft AZ-400 DevOps Engineer Expert, CKA',
    },
  },
  {
    id: 'dotnet-4',
    name: 'Minimal Teal',
    tagline: 'Clean Lines · Blazor Focus',
    style: { layout: 'minimal', accent: '#00796b' },
    data: {
      fullName: 'Sanjay Patil',
      email: 'sanjay.patil@email.com',
      phone: '+91 99887 44444',
      location: 'Hyderabad, Telangana',
      linkedin: 'linkedin.com/in/sanjaypatil',
      github: 'github.com/sanjaypatil',
      portfolio: '',
      professionalSummary: 'Full-stack .NET Developer with 3 years of experience using Blazor and ASP.NET Core for building interactive web applications. Strong skills in EF Core, MSSQL, and responsive UI design.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 6, Blazor WebAssembly, ASP.NET Core Web API, EF Core, MSSQL, HTML/CSS, Bootstrap, xUnit, Git, Azure Basics, SignalR' },
        { heading: 'Soft Skills', items: 'Creativity, Full-stack Thinking, User Empathy, Continuous Learning' },
      ],
      experiences: [
        {
          company: 'Tech Mahindra',
          role: 'Software Engineer (.NET)',
          duration: 'Sep 2021 - Present',
          responsibilities: 'Built Blazor WebAssembly dashboards consuming ASP.NET Core APIs\nDeveloped EF Core migrations and complex LINQ query optimization\nIntegrated SignalR for real-time notifications in web application',
        },
        {
          company: 'Mphasis Ltd',
          role: 'Junior .NET Developer',
          duration: 'Aug 2020 - Aug 2021',
          responsibilities: 'Developed ASP.NET MVC modules for internal CRM application\nFixed performance bottlenecks reducing page load from 4s to 800ms',
        },
      ],
      projects: [
        {
          name: 'Real-time Sales Dashboard',
          description: 'Blazor WebAssembly dashboard with SignalR-powered live sales metrics and region-wise charts',
          responsibilities: 'Developed interactive analytics dashboard with real-time charts\nImplemented WebSocket-based live data feeds via SignalR\nDesigned responsive UI components for cross-device compatibility',
        },
        {
          name: 'Online Exam Platform',
          description: 'Timed online examination system with auto-evaluation, leaderboard, and report generation',
          responsibilities: 'Built content management module with version history tracking\nImplemented search and filtering for document management\nDesigned user activity reporting with export functionality',
        },
      ],
      educations: [
        { degree: 'B.Tech in Computer Science', institute: 'JNTU Hyderabad', year: '2020', gpa: '7.7/10' },
      ],
      certifications: 'Microsoft AZ-900 Azure Fundamentals, Blazor & .NET 6 Full Course - Udemy',
    },
  },
  {
    id: 'dotnet-5',
    name: 'Classic Forest Green',
    tagline: 'Traditional · EF Core Specialist',
    style: { layout: 'classic', accent: '#2e7d32' },
    data: {
      fullName: 'Neha Ghosh',
      email: 'neha.ghosh@email.com',
      phone: '+91 97654 55555',
      location: 'Kolkata, West Bengal',
      linkedin: 'linkedin.com/in/nehaghosh',
      github: 'github.com/nehaghosh',
      portfolio: '',
      professionalSummary: '.NET Backend Developer with 4 years of expertise in ASP.NET Core, Entity Framework Core, and MSSQL database design. Focused on building robust, well-tested APIs with comprehensive Swagger documentation.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, ASP.NET Core, .NET 6, EF Core, MSSQL, T-SQL, Stored Procedures, xUnit, Moq, Swagger, Redis, Git, Azure App Service, LINQ' },
        { heading: 'Soft Skills', items: 'Analytical Thinking, Code Quality, Teamwork, Reliability' },
      ],
      experiences: [
        {
          company: 'Wipro Technologies',
          role: 'Senior Software Engineer',
          duration: 'Apr 2022 - Present',
          responsibilities: 'Designed and developed 30+ REST endpoints for e-commerce backend platform\nOptimized EF Core queries and T-SQL stored procedures reducing report generation by 60%\nMaintained 88% unit test coverage across 3 service modules',
        },
        {
          company: 'Tata Consultancy Services',
          role: 'ASP.NET Developer',
          duration: 'Jun 2020 - Mar 2022',
          responsibilities: 'Built multi-module ASP.NET Core application for logistics tracking\nDesigned normalized MSSQL schema for 15+ interrelated entities',
        },
      ],
      projects: [
        {
          name: 'Order Management REST API',
          description: 'Scalable order processing API with complex status workflows, EF Core, and Redis caching',
          responsibilities: 'Developed product catalog and order processing modules\nImplemented caching layer for high-traffic product pages\nDesigned inventory sync between warehouse and online store',
        },
        {
          name: 'Audit Log Microservice',
          description: 'Centralized audit logging service capturing all entity changes with full history tracking',
          responsibilities: 'Built automated audit trail system using EF Core shadow properties\nImplemented change tracking for regulatory compliance\nDesigned data versioning with point-in-time recovery',
        },
      ],
      educations: [
        { degree: 'B.Tech in Information Technology', institute: 'West Bengal University of Technology', year: '2020', gpa: '8.2/10' },
      ],
      certifications: 'Microsoft AZ-204 Azure Developer Associate, Entity Framework Core Deep Dive - Pluralsight',
    },
  },
  {
    id: 'dotnet-6',
    name: 'Modern Maroon',
    tagline: 'Sidebar Layout · Microservices',
    style: { layout: 'modern', accent: '#b71c1c' },
    data: {
      fullName: 'Ravi Shankar',
      email: 'ravi.shankar@email.com',
      phone: '+91 95432 66666',
      location: 'Chennai, Tamil Nadu',
      linkedin: 'linkedin.com/in/ravishankar',
      github: 'github.com/ravishankar',
      portfolio: '',
      professionalSummary: 'Senior .NET Microservices Developer with 5 years building cloud-native distributed systems on Azure. Expert in ASP.NET Core, gRPC inter-service communication, Azure Service Bus, and container orchestration.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 7, ASP.NET Core, gRPC, Azure Service Bus, Azure AKS, Docker, Kubernetes, Ocelot API Gateway, MassTransit, Redis, Cosmos DB, MSSQL, Polly' },
        { heading: 'Soft Skills', items: 'Distributed Systems Thinking, Resilience Patterns, Tech Mentoring, Cross-team Coordination' },
      ],
      experiences: [
        {
          company: 'Zoho Corporation',
          role: 'Senior Software Engineer (.NET)',
          duration: 'Jan 2021 - Present',
          responsibilities: 'Built 6 microservices using ASP.NET Core and gRPC serving 500K daily users\nImplemented Saga pattern with MassTransit for distributed transaction management\nSet up Ocelot API gateway with rate limiting and JWT validation',
        },
        {
          company: 'Cognizant',
          role: '.NET Developer',
          duration: 'Jul 2019 - Dec 2020',
          responsibilities: 'Migrated WCF SOAP services to ASP.NET Core REST APIs\nContainerized .NET applications using Docker and deployed to Azure AKS',
        },
      ],
      projects: [
        {
          name: '.NET Microservices Platform',
          description: 'Complete microservices ecosystem with API gateway, service mesh, Saga orchestration, and distributed tracing',
          responsibilities: 'Designed microservices communication layer using gRPC\nImplemented API gateway with rate limiting and load balancing\nBuilt distributed transaction management with Saga pattern',
        },
        {
          name: 'Resilient HTTP Client Library',
          description: 'Open-source .NET library wrapping HttpClient with Polly retry, circuit-breaker, and fallback policies',
          responsibilities: 'Developed resilience patterns library with circuit breaker support\nImplemented retry policies with exponential backoff\nDesigned integration test suite for fault injection scenarios',
        },
      ],
      educations: [
        { degree: 'B.E. in Computer Science', institute: 'Anna University', year: '2019', gpa: '8.3/10' },
      ],
      certifications: 'Microsoft AZ-204, Microsoft AZ-305 Azure Solutions Architect, Kubernetes CKAD',
    },
  },
  {
    id: 'dotnet-7',
    name: 'Executive Indigo',
    tagline: 'Bold Header · Tech Lead',
    style: { layout: 'executive', accent: '#283593' },
    data: {
      fullName: 'Pooja Iyer',
      email: 'pooja.iyer@email.com',
      phone: '+91 94321 77777',
      location: 'Bangalore, Karnataka',
      linkedin: 'linkedin.com/in/poojaiyer',
      github: '',
      portfolio: '',
      professionalSummary: '.NET Technical Lead with 8 years of progressive experience in Microsoft technologies. Expertise in ASP.NET Core, Azure PaaS, and enterprise integration patterns. Delivered complex projects with teams of 8-12 engineers.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 8, ASP.NET Core, Azure (App Service, SQL, Functions, Logic Apps, API Management), EF Core, CQRS, MediatR, SignalR, Azure DevOps, Terraform, Docker' },
        { heading: 'Soft Skills', items: 'Technical Leadership, Project Management, Client Communication, Risk Assessment, Mentorship' },
      ],
      experiences: [
        {
          company: 'Accenture India',
          role: '.NET Technical Lead',
          duration: 'Mar 2019 - Present',
          responsibilities: 'Led delivery of Azure-hosted .NET platform for Fortune 500 banking client\nDesigned CQRS architecture with MediatR reducing codebase complexity by 35%\nManaged team of 10 engineers conducting weekly architecture syncs and code reviews',
        },
        {
          company: 'Hexaware Technologies',
          role: 'Senior .NET Developer',
          duration: 'Jun 2016 - Feb 2019',
          responsibilities: 'Built enterprise document management system using ASP.NET Core and Azure Blob Storage\nImplemented Azure Logic Apps for automated email and document workflows',
        },
      ],
      projects: [
        {
          name: 'Digital Banking API Platform',
          description: 'Secure banking API platform with Azure API Management, OAuth2, and real-time transaction feeds via SignalR',
          responsibilities: 'Led architecture design for enterprise banking integration platform\nImplemented real-time notification system for transaction alerts\nDesigned API versioning strategy with backward compatibility',
        },
        {
          name: 'Document Processing Automation',
          description: 'Intelligent document intake system using Azure Form Recognizer and Logic Apps',
          responsibilities: 'Built AI-powered invoice processing automation workflow\nImplemented document classification and data extraction pipeline\nDesigned approval routing logic with conditional workflows',
        },
      ],
      educations: [
        { degree: 'M.Tech in Information Technology', institute: 'IIT Bombay', year: '2016', gpa: '9.2/10' },
      ],
      certifications: 'Microsoft AZ-305 Solutions Architect Expert, AZ-400 DevOps Engineer Expert, PMP Certified',
    },
  },
  {
    id: 'dotnet-8',
    name: 'Minimal Blue-Grey',
    tagline: 'Understated · Desktop .NET',
    style: { layout: 'minimal', accent: '#455a64' },
    data: {
      fullName: 'Akash Gupta',
      email: 'akash.gupta@email.com',
      phone: '+91 93210 88888',
      location: 'Noida, Uttar Pradesh',
      linkedin: 'linkedin.com/in/akashgupta',
      github: 'github.com/akashgupta',
      portfolio: '',
      professionalSummary: '.NET Developer with 4 years specializing in desktop application development using WPF and MVVM, combined with ASP.NET Core backend services. Experienced in building data-intensive enterprise tools for manufacturing and logistics.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 6, WPF, MVVM, ASP.NET Core Web API, EF Core, MSSQL, DevExpress Controls, SignalR, XAML, Git, xUnit, Azure App Service' },
        { heading: 'Soft Skills', items: 'User-Centric Design, Performance Optimization, Domain Understanding, Methodical Approach' },
      ],
      experiences: [
        {
          company: 'L&T Technology Services',
          role: 'Software Engineer (.NET)',
          duration: 'Oct 2020 - Present',
          responsibilities: 'Developed WPF-based manufacturing execution system used in 5 factories\nBuilt MVVM architecture reducing UI code-behind by 70%\nIntegrated real-time machine telemetry via SignalR and ASP.NET Core backend',
        },
        {
          company: 'NIIT Technologies',
          role: 'Junior .NET Developer',
          duration: 'Jul 2019 - Sep 2020',
          responsibilities: 'Maintained and enhanced legacy WinForms application migrated to WPF\nBuilt REST API backend using ASP.NET Core and MSSQL',
        },
      ],
      projects: [
        {
          name: 'Manufacturing Execution System',
          description: 'WPF desktop app with real-time production tracking, quality control workflows, and OEE dashboards',
          responsibilities: 'Developed real-time machine monitoring dashboard\nImplemented MVVM architecture for maintainable desktop UI\nDesigned telemetry data visualization with custom charts',
        },
        {
          name: 'Fleet Management Portal',
          description: 'Desktop + web hybrid solution for vehicle tracking, maintenance scheduling, and driver management',
          responsibilities: 'Built fleet tracking application with live map visualization\nImplemented route optimization and delivery scheduling\nDesigned driver performance analytics dashboard',
        },
      ],
      educations: [
        { degree: 'B.Tech in Computer Science', institute: 'Amity University, Noida', year: '2019', gpa: '7.6/10' },
      ],
      certifications: 'Microsoft AZ-900 Azure Fundamentals, WPF & MVVM - Pluralsight',
    },
  },
  {
    id: 'dotnet-9',
    name: 'Classic Dark Red',
    tagline: 'Traditional · Azure Functions',
    style: { layout: 'classic', accent: '#c62828' },
    data: {
      fullName: 'Shreya Nair',
      email: 'shreya.nair@email.com',
      phone: '+91 92109 99999',
      location: 'Kochi, Kerala',
      linkedin: 'linkedin.com/in/shreyanair',
      github: 'github.com/shreyanair',
      portfolio: 'shreyanair.tech',
      professionalSummary: 'Serverless .NET Engineer with 5 years designing Azure Functions-based event-driven systems. Deep expertise in Durable Functions, orchestration patterns, and Azure integration services for financial and retail clients.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 6/7, Azure Functions, Durable Functions, Azure Logic Apps, Service Bus, Event Grid, Cosmos DB, MSSQL, EF Core, ASP.NET Core, Azure DevOps, xUnit' },
        { heading: 'Soft Skills', items: 'Event-Driven Thinking, Cost Optimization, Cloud-Native Mindset, Technical Writing' },
      ],
      experiences: [
        {
          company: 'UST Global',
          role: 'Senior .NET Cloud Engineer',
          duration: 'Jun 2021 - Present',
          responsibilities: 'Built Azure Durable Functions orchestrating multi-step loan approval workflows\nReduced infrastructure cost by 60% migrating always-on VMs to serverless\nDesigned Event Grid-based notification system delivering 1M+ alerts/day',
        },
        {
          company: 'IBS Software',
          role: '.NET Developer',
          duration: 'Jul 2019 - May 2021',
          responsibilities: 'Developed ASP.NET Core APIs for airline reservation system\nIntegrated Azure Service Bus for async booking confirmation workflows',
        },
      ],
      projects: [
        {
          name: 'Loan Approval Orchestration',
          description: 'Multi-step loan approval using Azure Durable Functions with human approval steps, credit checks, and document verification',
          responsibilities: 'Designed multi-step loan approval orchestration workflow\nImplemented automated document verification and scoring\nBuilt email notification pipeline for application status updates',
        },
        {
          name: 'Retail Event Processing Pipeline',
          description: 'Serverless pipeline processing 500K+ daily retail events with anomaly detection and alerting',
          responsibilities: 'Developed real-time IoT data ingestion and processing pipeline\nImplemented device health monitoring and alerting system\nDesigned time-series data storage and querying solution',
        },
      ],
      educations: [
        { degree: 'B.Tech in Computer Science', institute: 'Cochin University of Science and Technology', year: '2019', gpa: '8.5/10' },
      ],
      certifications: 'Microsoft AZ-204 Azure Developer, Microsoft AZ-900, Azure Serverless Deep Dive - Pluralsight',
    },
  },
  {
    id: 'dotnet-10',
    name: 'Modern Dark Teal',
    tagline: 'Sidebar Layout · Full-Stack .NET',
    style: { layout: 'modern', accent: '#004d40' },
    data: {
      fullName: 'Manish Jain',
      email: 'manish.jain@email.com',
      phone: '+91 91098 10101',
      location: 'Ahmedabad, Gujarat',
      linkedin: 'linkedin.com/in/manishjain',
      github: 'github.com/manishjain',
      portfolio: 'manishjain.dev',
      professionalSummary: 'Full-stack .NET Developer with 6 years delivering end-to-end web solutions using ASP.NET Core, Blazor, Angular, and Azure. Adept at designing scalable APIs, relational databases, and CI/CD pipelines on the Microsoft stack.',
      skills: [
        { heading: 'Technical Skills', items: 'C#, .NET 7/8, ASP.NET Core, Blazor Server, Angular, EF Core, MSSQL, PostgreSQL, Azure (App Service, SQL, DevOps), Docker, Redis, xUnit, Moq, REST APIs' },
        { heading: 'Soft Skills', items: 'Full-stack Ownership, Agile Development, Client Collaboration, Code Review' },
      ],
      experiences: [
        {
          company: 'Torrent Power - IT Division',
          role: 'Senior .NET Full-stack Developer',
          duration: 'Apr 2021 - Present',
          responsibilities: 'Built Blazor Server-based ERP modules replacing legacy Excel-driven processes\nDeveloped ASP.NET Core APIs integrated with SAP backend via REST\nSet up Azure DevOps pipelines achieving zero-downtime deployments',
        },
        {
          company: 'Crest Data Systems',
          role: '.NET Developer',
          duration: 'Aug 2018 - Mar 2021',
          responsibilities: 'Developed Angular front-end consuming ASP.NET Core Web API backends\nBuilt PostgreSQL-backed reporting service generating daily financial summaries',
        },
      ],
      projects: [
        {
          name: 'Utility ERP Platform',
          description: 'End-to-end ERP for utility management with billing, complaint tracking, and field crew scheduling',
          responsibilities: 'Built ERP modules for inventory and procurement management\nImplemented SAP backend integration via REST APIs\nDesigned automated deployment pipeline with zero-downtime strategy',
        },
        {
          name: 'Multi-tenant SaaS Boilerplate',
          description: 'Open-source boilerplate for scaffolding multi-tenant .NET SaaS applications',
          responsibilities: 'Developed financial reporting service with scheduled generation\nImplemented Azure AD B2C authentication for external users\nDesigned containerized deployment for multi-environment support',
        },
      ],
      educations: [
        { degree: 'B.E. in Computer Engineering', institute: 'Gujarat Technological University', year: '2018', gpa: '8.1/10' },
      ],
      certifications: 'Microsoft AZ-204, Microsoft AZ-900, Full Stack .NET with Blazor - Udemy',
    },
  },
];

// ─── Resume Preview Component ──────────────────────────────────────────────────

const ResumePreview: React.FC<{ data: ResumeData; style: TemplateStyle }> = ({ data, style }) => {
  const links = [data.linkedin, data.github, data.portfolio].filter(Boolean);
  const { accent } = style;

  if (style.layout === 'modern') {
    return (
      <div style={{ display: 'flex', background: '#fff', fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.45', color: '#222', minHeight: '100%' }}>
        <div style={{ width: '32%', background: accent, color: '#fff', padding: '24px 16px', flexShrink: 0 }}>
          <h1 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '6px', wordBreak: 'break-word' }}>{data.fullName || 'Your Name'}</h1>
          <div style={{ fontSize: '9.5px', opacity: 0.88, lineHeight: '1.7' }}>
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
            {data.linkedin && <p style={{ marginTop: '4px', wordBreak: 'break-all' }}>{data.linkedin}</p>}
            {data.github && <p style={{ wordBreak: 'break-all' }}>{data.github}</p>}
          </div>
          {data.skills.some(s => s.heading && s.items) && (
            <div style={{ marginTop: '18px' }}>
              <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: '4px', marginBottom: '8px' }}>Skills</p>
              {data.skills.map((skill, i) => skill.heading && skill.items && (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 'bold', opacity: 0.95, marginBottom: '2px' }}>{skill.heading}:</p>
                  {skill.items.split(',').map((s, j) => <p key={j} style={{ fontSize: '9.5px', opacity: 0.9, padding: '1.5px 0' }}>• {s.trim()}</p>)}
                </div>
              ))}
            </div>
          )}
          {data.certifications && (
            <div style={{ marginTop: '14px' }}>
              <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: '4px', marginBottom: '8px' }}>Certifications</p>
              {data.certifications.split(',').map((c, i) => <p key={i} style={{ fontSize: '9px', opacity: 0.85, padding: '1.5px 0' }}>• {c.trim()}</p>)}
            </div>
          )}
        </div>
        <div style={{ width: '68%', padding: '22px 18px' }}>
          {data.professionalSummary && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accent}`, paddingBottom: '3px', marginBottom: '6px' }}>Professional Summary</h2>
              <p style={{ fontSize: '10px', color: '#444', lineHeight: '1.55' }}>{data.professionalSummary}</p>
            </div>
          )}
          {data.experiences.some(e => e.company) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Professional Experience</h2>
              {data.experiences.map((exp, i) => exp.company && (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#222' }}>{exp.role}</p>
                      <p style={{ fontSize: '9.5px', color: '#555' }}>{exp.company}</p>
                    </div>
                    <p style={{ fontSize: '9px', color: '#777', flexShrink: 0, marginLeft: '8px' }}>{exp.duration}</p>
                  </div>
                  {exp.responsibilities && (
                    <ul style={{ marginTop: '4px', paddingLeft: '14px' }}>
                      {exp.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                        <li key={j} style={{ fontSize: '9.5px', color: '#444', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {data.projects.some(p => p.name) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Projects</h2>
              {data.projects.map((proj, i) => proj.name && (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '10.5px', fontWeight: 'bold' }}>{proj.name}</p>
                  {proj.description && <p style={{ fontSize: '9.5px', color: '#444', marginTop: '2px' }}>{proj.description}</p>}
                  {proj.responsibilities && (
                    <div style={{ marginTop: '3px' }}>
                      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#555' }}>Roles & Responsibilities:</p>
                      <ul style={{ paddingLeft: '14px', marginTop: '2px' }}>
                        {proj.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                          <li key={j} style={{ fontSize: '9.5px', color: '#444', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {data.educations.some(e => e.degree) && (
            <div>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Education</h2>
              {data.educations.map((edu, i) => edu.degree && (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <p style={{ fontSize: '10.5px', fontWeight: 'bold' }}>{edu.degree}</p>
                  <p style={{ fontSize: '9.5px', color: '#555' }}>{edu.institute}{edu.year ? ` | ${edu.year}` : ''}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (style.layout === 'executive') {
    return (
      <div style={{ fontFamily: 'Georgia, serif', background: '#fff', fontSize: '11px', lineHeight: '1.5', color: '#222' }}>
        <div style={{ background: accent, color: '#fff', padding: '28px 32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '8px' }}>{data.fullName || 'Your Name'}</h1>
          <p style={{ fontSize: '10.5px', opacity: 0.9 }}>{[data.email, data.phone, data.location].filter(Boolean).join('  •  ')}</p>
          {links.length > 0 && <p style={{ fontSize: '9.5px', opacity: 0.8, marginTop: '4px' }}>{links.join('  •  ')}</p>}
        </div>
        <div style={{ padding: '22px 30px' }}>
          {data.professionalSummary && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderLeft: `4px solid ${accent}`, paddingLeft: '10px', marginBottom: '6px' }}>Professional Summary</h2>
              <p style={{ fontSize: '10.5px', color: '#444', paddingLeft: '14px' }}>{data.professionalSummary}</p>
            </div>
          )}
          {data.skills.some(s => s.heading && s.items) && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderLeft: `4px solid ${accent}`, paddingLeft: '10px', marginBottom: '6px' }}>Skills</h2>
              {data.skills.map((skill, i) => skill.heading && skill.items && (
                <p key={i} style={{ fontSize: '9.5px', color: '#444', paddingLeft: '14px', marginBottom: '3px' }}><strong>{skill.heading}:</strong> {skill.items}</p>
              ))}
            </div>
          )}
          {data.experiences.some(e => e.company) && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderLeft: `4px solid ${accent}`, paddingLeft: '10px', marginBottom: '10px' }}>Professional Experience</h2>
              {data.experiences.map((exp, i) => exp.company && (
                <div key={i} style={{ marginBottom: '12px', paddingLeft: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#222' }}>{exp.role} — {exp.company}</p>
                    <p style={{ fontSize: '9.5px', color: '#777', fontStyle: 'italic' }}>{exp.duration}</p>
                  </div>
                  {exp.responsibilities && (
                    <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                      {exp.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                        <li key={j} style={{ fontSize: '10px', color: '#444', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {data.projects.some(p => p.name) && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderLeft: `4px solid ${accent}`, paddingLeft: '10px', marginBottom: '8px' }}>Projects</h2>
              {data.projects.map((proj, i) => proj.name && (
                <div key={i} style={{ marginBottom: '10px', paddingLeft: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{proj.name}</p>
                  {proj.description && <p style={{ fontSize: '10px', color: '#444' }}>{proj.description}</p>}
                  {proj.responsibilities && (
                    <div style={{ marginTop: '3px' }}>
                      <p style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#555' }}>Roles & Responsibilities:</p>
                      <ul style={{ paddingLeft: '16px', marginTop: '2px' }}>
                        {proj.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                          <li key={j} style={{ fontSize: '10px', color: '#444', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {data.educations.some(e => e.degree) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderLeft: `4px solid ${accent}`, paddingLeft: '10px', marginBottom: '8px' }}>Education</h2>
              {data.educations.map((edu, i) => edu.degree && (
                <div key={i} style={{ marginBottom: '6px', paddingLeft: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{edu.degree}</p>
                  <p style={{ fontSize: '10px', color: '#555' }}>{edu.institute}{edu.year ? ` | ${edu.year}` : ''}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                </div>
              ))}
            </div>
          )}
          {data.certifications && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderLeft: `4px solid ${accent}`, paddingLeft: '10px', marginBottom: '6px' }}>Certifications</h2>
              <p style={{ fontSize: '10px', color: '#444', paddingLeft: '14px' }}>{data.certifications}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (style.layout === 'minimal') {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', background: '#fff', padding: '30px', fontSize: '11px', lineHeight: '1.6', color: '#222' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '300', letterSpacing: '3px', textTransform: 'uppercase', color: '#111', marginBottom: '4px' }}>{data.fullName || 'Your Name'}</h1>
        <p style={{ fontSize: '9.5px', color: '#888', letterSpacing: '1px' }}>{[data.email, data.phone, data.location].filter(Boolean).join(' · ')}</p>
        {links.length > 0 && <p style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>{links.join(' · ')}</p>}
        <div style={{ height: '2px', background: accent, margin: '14px 0' }} />
        {data.professionalSummary && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 'bold', color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>Summary</p>
            <p style={{ fontSize: '10px', color: '#555' }}>{data.professionalSummary}</p>
          </div>
        )}
        {data.skills.some(s => s.heading && s.items) && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 'bold', color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>Skills</p>
            {data.skills.map((skill, i) => skill.heading && skill.items && (
              <p key={i} style={{ fontSize: '10px', color: '#555', marginTop: i > 0 ? '3px' : '0' }}><strong>{skill.heading}:</strong> {skill.items}</p>
            ))}
          </div>
        )}
        {data.experiences.some(e => e.company) && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 'bold', color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Experience</p>
            {data.experiences.map((exp, i) => exp.company && (
              <div key={i} style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#222' }}>{exp.role}</p>
                  <p style={{ fontSize: '9.5px', color: '#777' }}>{exp.company}</p>
                  {exp.responsibilities && (
                    <ul style={{ paddingLeft: '12px', marginTop: '4px' }}>
                      {exp.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                        <li key={j} style={{ fontSize: '9px', color: '#555', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <p style={{ fontSize: '8.5px', color: '#aaa', whiteSpace: 'nowrap' }}>{exp.duration}</p>
              </div>
            ))}
          </div>
        )}
        {data.projects.some(p => p.name) && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 'bold', color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Projects</p>
            {data.projects.map((proj, i) => proj.name && (
              <div key={i} style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{proj.name}</p>
                {proj.description && <p style={{ fontSize: '9px', color: '#555' }}>{proj.description}</p>}
                {proj.responsibilities && (
                  <div style={{ marginTop: '3px' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#666' }}>Roles & Responsibilities:</p>
                    <ul style={{ paddingLeft: '12px', marginTop: '2px' }}>
                      {proj.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                        <li key={j} style={{ fontSize: '9px', color: '#555', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {data.educations.some(e => e.degree) && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 'bold', color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Education</p>
            {data.educations.map((edu, i) => edu.degree && (
              <div key={i} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{edu.degree}</p>
                  <p style={{ fontSize: '9px', color: '#777' }}>{edu.institute}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                </div>
                <p style={{ fontSize: '9px', color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>{edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {data.certifications && (
          <div>
            <p style={{ fontSize: '8.5px', fontWeight: 'bold', color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>Certifications</p>
            <p style={{ fontSize: '10px', color: '#555' }}>{data.certifications}</p>
          </div>
        )}
      </div>
    );
  }

  // Classic layout (default)
  return (
    <div style={{ fontFamily: 'Times New Roman, serif', background: '#fff', padding: '28px', fontSize: '11px', lineHeight: '1.5', color: '#222' }}>
      <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: `3px solid ${accent}`, marginBottom: '14px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', letterSpacing: '1px' }}>{data.fullName || 'Your Name'}</h1>
        <p style={{ fontSize: '10px', color: '#555', marginTop: '5px' }}>{[data.email, data.phone, data.location].filter(Boolean).join('  |  ')}</p>
        {links.length > 0 && <p style={{ fontSize: '9px', color: '#666', marginTop: '3px' }}>{links.join('  |  ')}</p>}
      </div>
      {data.professionalSummary && (
        <div style={{ marginBottom: '13px' }}>
          <h2 style={{ fontSize: '11.5px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `1.5px solid ${accent}`, paddingBottom: '3px', marginBottom: '6px' }}>Professional Summary</h2>
          <p style={{ fontSize: '10px', color: '#444' }}>{data.professionalSummary}</p>
        </div>
      )}
      {data.skills.some(s => s.heading && s.items) && (
        <div style={{ marginBottom: '13px' }}>
          <h2 style={{ fontSize: '11.5px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `1.5px solid ${accent}`, paddingBottom: '3px', marginBottom: '6px' }}>Skills</h2>
          {data.skills.map((skill, i) => skill.heading && skill.items && (
            <p key={i} style={{ fontSize: '10px', color: '#444', marginBottom: '3px' }}><strong>{skill.heading}:</strong> {skill.items}</p>
          ))}
        </div>
      )}
      {data.experiences.some(e => e.company) && (
        <div style={{ marginBottom: '13px' }}>
          <h2 style={{ fontSize: '11.5px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `1.5px solid ${accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Professional Experience</h2>
          {data.experiences.map((exp, i) => exp.company && (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#222' }}>{exp.role} — {exp.company}</p>
                <p style={{ fontSize: '9px', color: '#888', fontStyle: 'italic', flexShrink: 0, marginLeft: '8px' }}>{exp.duration}</p>
              </div>
              {exp.responsibilities && (
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  {exp.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                    <li key={j} style={{ fontSize: '10px', color: '#444', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      {data.projects.some(p => p.name) && (
        <div style={{ marginBottom: '13px' }}>
          <h2 style={{ fontSize: '11.5px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `1.5px solid ${accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Projects</h2>
          {data.projects.map((proj, i) => proj.name && (
            <div key={i} style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{proj.name}</p>
              {proj.description && <p style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{proj.description}</p>}
              {proj.responsibilities && (
                <div style={{ marginTop: '3px' }}>
                  <p style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#555' }}>Roles & Responsibilities:</p>
                  <ul style={{ paddingLeft: '16px', marginTop: '2px' }}>
                    {proj.responsibilities.split('\n').filter(b => b.trim()).map((b, j) => (
                      <li key={j} style={{ fontSize: '10px', color: '#444', marginBottom: '2px' }}>{b.replace(/^[-•]\s*/, '').trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {data.educations.some(e => e.degree) && (
        <div style={{ marginBottom: '13px' }}>
          <h2 style={{ fontSize: '11.5px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `1.5px solid ${accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Education</h2>
          {data.educations.map((edu, i) => edu.degree && (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{edu.degree}</p>
                <p style={{ fontSize: '9px', color: '#888' }}>{edu.year}</p>
              </div>
              <p style={{ fontSize: '10px', color: '#555' }}>{edu.institute}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</p>
            </div>
          ))}
        </div>
      )}
      {data.certifications && (
        <div>
          <h2 style={{ fontSize: '11.5px', fontWeight: 'bold', color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `1.5px solid ${accent}`, paddingBottom: '3px', marginBottom: '6px' }}>Certifications</h2>
          <p style={{ fontSize: '10px', color: '#444' }}>{data.certifications}</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const EMPTY_RESUME: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  professionalSummary: '',
  skills: [{ heading: '', items: '' }],
  experiences: [{ company: '', role: '', duration: '', responsibilities: '' }],
  projects: [{ name: '', description: '', responsibilities: '' }],
  educations: [{ degree: '', institute: '', year: '', gpa: '' }],
  certifications: '',
};

const LAYOUT_LABELS: Record<string, string> = {
  classic: 'Classic',
  modern: 'Sidebar',
  executive: 'Executive',
  minimal: 'Minimal',
};

const ResumeBuilder: React.FC = () => {
  const [step, setStep] = useState<Step>('position');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<ResumeData>(EMPTY_RESUME);
  const [openSection, setOpenSection] = useState<string>('personal');

  const templates = selectedPosition === 'java' ? JAVA_TEMPLATES : DOTNET_TEMPLATES;

  const handleSelectPosition = (pos: Position) => {
    setSelectedPosition(pos);
    setStep('template');
  };

  const handleSelectTemplate = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setFormData(JSON.parse(JSON.stringify(tpl.data)));
    setOpenSection('personal');
    setStep('editor');
  };

  const toggleSection = (id: string) => setOpenSection(prev => prev === id ? '' : id);

  const updateExp = (i: number, field: keyof Experience, val: string) => {
    const exps = [...formData.experiences];
    exps[i] = { ...exps[i], [field]: val };
    setFormData({ ...formData, experiences: exps });
  };
  const addExp = () => setFormData({ ...formData, experiences: [...formData.experiences, { company: '', role: '', duration: '', responsibilities: '' }] });
  const removeExp = (i: number) => setFormData({ ...formData, experiences: formData.experiences.filter((_, idx) => idx !== i) });

  const updateSkill = (i: number, field: keyof SkillCategory, val: string) => {
    const sk = [...formData.skills];
    sk[i] = { ...sk[i], [field]: val };
    setFormData({ ...formData, skills: sk });
  };
  const addSkill = () => setFormData({ ...formData, skills: [...formData.skills, { heading: '', items: '' }] });
  const removeSkill = (i: number) => setFormData({ ...formData, skills: formData.skills.filter((_, idx) => idx !== i) });

  const updateProj = (i: number, field: keyof Project, val: string) => {
    const projs = [...formData.projects];
    projs[i] = { ...projs[i], [field]: val };
    setFormData({ ...formData, projects: projs });
  };
  const addProj = () => setFormData({ ...formData, projects: [...formData.projects, { name: '', description: '', responsibilities: '' }] });
  const removeProj = (i: number) => setFormData({ ...formData, projects: formData.projects.filter((_, idx) => idx !== i) });

  const updateEdu = (i: number, field: keyof Education, val: string) => {
    const edus = [...formData.educations];
    edus[i] = { ...edus[i], [field]: val };
    setFormData({ ...formData, educations: edus });
  };
  const addEdu = () => setFormData({ ...formData, educations: [...formData.educations, { degree: '', institute: '', year: '', gpa: '' }] });
  const removeEdu = (i: number) => setFormData({ ...formData, educations: formData.educations.filter((_, idx) => idx !== i) });

  const downloadPDF = () => {
    if (!selectedTemplate) return;
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 20;
    let y = 20;

    const checkBreak = (space = 20) => { if (y + space > ph - 20) { doc.addPage(); y = 20; } };
    const addText = (text: string, size = 11, bold = false) => {
      checkBreak();
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, pw - 2 * m);
      doc.text(lines, m, y);
      y += lines.length * (size * 0.35) + 3;
    };
    const addSection = (title: string) => {
      checkBreak(15); y += 4;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text(title, m, y); y += 2;
      doc.setLineWidth(0.5); doc.line(m, y, pw - m, y); y += 5;
    };

    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text(formData.fullName || 'Name', pw / 2, y, { align: 'center' }); y += 7;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text([formData.email, formData.phone, formData.location].filter(Boolean).join(' | '), pw / 2, y, { align: 'center' }); y += 5;
    const links = [formData.linkedin, formData.github, formData.portfolio].filter(Boolean);
    if (links.length) { doc.text(links.join(' | '), pw / 2, y, { align: 'center' }); y += 8; } else { y += 3; }

    if (formData.professionalSummary) { addSection('PROFESSIONAL SUMMARY'); addText(formData.professionalSummary, 10); }
    if (formData.skills.some(s => s.heading && s.items)) {
      addSection('SKILLS');
      formData.skills.forEach(skill => {
        if (skill.heading && skill.items) { addText(`${skill.heading}: ${skill.items}`, 10); }
      });
    }
    if (formData.experiences.some(e => e.company)) {
      addSection('PROFESSIONAL EXPERIENCE');
      formData.experiences.forEach(exp => {
        if (exp.company && exp.role) {
          checkBreak(20); addText(`${exp.role} at ${exp.company}`, 11, true);
          if (exp.duration) { doc.setFontSize(10); doc.setFont('helvetica', 'italic'); doc.text(exp.duration, m, y); y += 5; }
          if (exp.responsibilities) {
            exp.responsibilities.split('\n').filter(b => b.trim()).forEach(b => addText(`• ${b.replace(/^[-•]\s*/, '').trim()}`, 10));
          }
          y += 2;
        }
      });
    }
    if (formData.projects.some(p => p.name)) {
      addSection('PROJECTS');
      formData.projects.forEach(proj => {
        if (proj.name) {
          checkBreak(15); addText(proj.name, 11, true);
          if (proj.description) addText(proj.description, 10);
          if (proj.responsibilities) {
            addText('Roles & Responsibilities:', 10, true);
            proj.responsibilities.split('\n').filter(b => b.trim()).forEach(b => addText(`• ${b.replace(/^[-•]\s*/, '').trim()}`, 10));
          }
          y += 2;
        }
      });
    }
    if (formData.educations.some(e => e.degree)) {
      addSection('EDUCATION');
      formData.educations.forEach(edu => {
        if (edu.degree && edu.institute) {
          checkBreak(10); addText(`${edu.degree} — ${edu.institute} (${edu.year})`, 11, true);
          if (edu.gpa) addText(`GPA: ${edu.gpa}`, 10);
        }
      });
    }
    if (formData.certifications) { addSection('CERTIFICATIONS'); addText(formData.certifications, 10); }
    doc.save(`${(formData.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`);
  };

  const inputCls = 'w-full px-3 py-2 bg-dark-900 border border-white/10 rounded-lg text-white text-sm focus:border-neon-blue focus:outline-none';
  const textareaCls = `${inputCls} resize-none`;

  const SectionHeader: React.FC<{ id: string; label: string; icon: React.ElementType }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-4 py-3 bg-dark-900 hover:bg-dark-800 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-neon-blue" />
        <span className="text-white font-medium text-sm">{label}</span>
      </div>
      {openSection === id
        ? <ChevronUp className="w-4 h-4 text-gray-400" />
        : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );

  const Stepper: React.FC<{ activeStep: number }> = ({ activeStep }) => (
    <div className="flex items-center gap-3">
      {['Select Position', 'Choose Template', 'Edit Resume'].map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i <= activeStep ? 'bg-neon-blue text-black' : 'bg-dark-800 border border-white/20 text-gray-500'}`}>{i + 1}</div>
            <span className={`text-sm ${i <= activeStep ? 'text-white' : 'text-gray-500'}`}>{label}</span>
          </div>
          {i < 2 && <div className={`flex-1 h-px ${i < activeStep ? 'bg-neon-blue/40' : 'bg-white/10'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  // ── Step 1: Position Selection ──────────────────────────────────────────────
  if (step === 'position') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileUser className="w-7 h-7 text-neon-blue" />
            Resume Builder
          </h2>
          <p className="text-gray-400 mt-1">Build a professional, job-specific resume in minutes</p>
        </div>
        <Stepper activeStep={0} />
        <div>
          <h3 className="text-lg font-semibold text-white mb-6">Select your job position to get started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <button
              onClick={() => handleSelectPosition('java')}
              className="group p-8 bg-dark-800 border border-white/10 rounded-2xl hover:border-neon-blue hover:bg-neon-blue/5 transition-all text-left"
            >
              <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Coffee className="w-8 h-8 text-orange-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Java Developer</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Spring Boot, Microservices, REST APIs, Hibernate, Cloud & more</p>
              <div className="mt-5 flex items-center gap-2 text-neon-blue text-sm font-medium">
                <span>10 Templates Available</span>
                <span>→</span>
              </div>
            </button>
            <button
              onClick={() => handleSelectPosition('dotnet')}
              className="group p-8 bg-dark-800 border border-white/10 rounded-2xl hover:border-neon-purple hover:bg-neon-purple/5 transition-all text-left"
            >
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">.NET Developer</h4>
              <p className="text-gray-400 text-sm leading-relaxed">C#, ASP.NET Core, Azure, Blazor, Entity Framework & more</p>
              <div className="mt-5 flex items-center gap-2 text-neon-purple text-sm font-medium">
                <span>10 Templates Available</span>
                <span>→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Template Selection ──────────────────────────────────────────────
  if (step === 'template') {
    const isJava = selectedPosition === 'java';
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('position')} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {isJava ? <Coffee className="w-6 h-6 text-orange-400" /> : <Monitor className="w-6 h-6 text-purple-400" />}
              {isJava ? 'Java Developer' : '.NET Developer'} Templates
            </h2>
            <p className="text-gray-400 text-sm mt-1">Choose from 10 professionally designed templates</p>
          </div>
        </div>
        <Stepper activeStep={1} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((tpl, idx) => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`group p-5 bg-dark-800 border border-white/10 rounded-xl hover:border-neon-blue hover:bg-white/5 transition-all text-left`}
            >
              <div className="w-full h-2 rounded-full mb-4" style={{ background: tpl.style.accent }} />
              <div className="flex items-start justify-between mb-2">
                <p className="text-white font-semibold text-sm">{tpl.name}</p>
                <span className="text-[10px] text-gray-500 bg-dark-900 px-2 py-0.5 rounded-full border border-white/10 ml-2 flex-shrink-0">
                  {LAYOUT_LABELS[tpl.style.layout]}
                </span>
              </div>
              <p className="text-gray-500 text-xs mb-4">{tpl.tagline}</p>
              <div className="text-xs font-medium text-neon-blue flex items-center gap-1">
                <span>Template {idx + 1}</span>
                <span className="ml-auto group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 3: Editor + Live Preview ───────────────────────────────────────────
  if (step === 'editor' && selectedTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setStep('template')} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: selectedTemplate.style.accent }} />
            <span className="text-white font-semibold truncate">{selectedTemplate.name}</span>
            <span className="text-gray-500 text-sm truncate">— {selectedPosition === 'java' ? 'Java Developer' : '.NET Developer'}</span>
          </div>
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm flex-shrink-0">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        <Stepper activeStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Accordion Editor */}
          <div className="space-y-2 max-h-[820px] overflow-y-auto pr-1">
            <p className="text-xs text-gray-500 px-1 mb-3">Edit each section — changes reflect instantly in the preview</p>

            {/* Personal Details */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <SectionHeader id="personal" label="Personal Details" icon={User} />
              {openSection === 'personal' && (
                <div className="p-4 bg-dark-800/60 space-y-3">
                  <input className={inputCls} placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input className={inputCls} placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <input className={inputCls} placeholder="Location (e.g. Mumbai, Maharashtra)" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  <input className={inputCls} placeholder="LinkedIn URL" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="GitHub URL" value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} />
                    <input className={inputCls} placeholder="Portfolio URL" value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <SectionHeader id="summary" label="Professional Summary" icon={FileUser} />
              {openSection === 'summary' && (
                <div className="p-4 bg-dark-800/60">
                  <textarea className={textareaCls} rows={5} placeholder="Brief professional summary highlighting your expertise and key strengths..." value={formData.professionalSummary} onChange={e => setFormData({ ...formData, professionalSummary: e.target.value })} />
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <SectionHeader id="skills" label="Skills" icon={Code2} />
              {openSection === 'skills' && (
                <div className="p-4 bg-dark-800/60 space-y-4">
                  {formData.skills.map((skill, i) => (
                    <div key={i} className="bg-dark-900 border border-white/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium">Skill Category {i + 1}</span>
                        {formData.skills.length > 1 && (
                          <button onClick={() => removeSkill(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                      <input className={inputCls} placeholder="Heading (e.g. Languages, Frameworks, Soft Skills)" value={skill.heading} onChange={e => updateSkill(i, 'heading', e.target.value)} />
                      <input className={inputCls} placeholder="Skills (comma separated, e.g. Java, Python, C#)" value={skill.items} onChange={e => updateSkill(i, 'items', e.target.value)} />
                    </div>
                  ))}
                  <button onClick={addSkill} className="flex items-center gap-1 text-neon-blue text-xs hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add Skill Category
                  </button>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <SectionHeader id="experience" label="Experience" icon={Briefcase} />
              {openSection === 'experience' && (
                <div className="p-4 bg-dark-800/60 space-y-4">
                  {formData.experiences.map((exp, i) => (
                    <div key={i} className="bg-dark-900 border border-white/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium">Experience {i + 1}</span>
                        {formData.experiences.length > 1 && (
                          <button onClick={() => removeExp(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                      <input className={inputCls} placeholder="Company Name" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} />
                      <input className={inputCls} placeholder="Role / Position" value={exp.role} onChange={e => updateExp(i, 'role', e.target.value)} />
                      <input className={inputCls} placeholder="Duration (e.g. Jan 2022 - Present)" value={exp.duration} onChange={e => updateExp(i, 'duration', e.target.value)} />
                      <textarea className={textareaCls} rows={4} placeholder={"Key responsibilities (one per line)\nLed microservices development\nImproved performance by 40%"} value={exp.responsibilities} onChange={e => updateExp(i, 'responsibilities', e.target.value)} />
                    </div>
                  ))}
                  <button onClick={addExp} className="flex items-center gap-1 text-neon-blue text-xs hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <SectionHeader id="projects" label="Projects" icon={FolderOpen} />
              {openSection === 'projects' && (
                <div className="p-4 bg-dark-800/60 space-y-4">
                  {formData.projects.map((proj, i) => (
                    <div key={i} className="bg-dark-900 border border-white/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium">Project {i + 1}</span>
                        {formData.projects.length > 1 && (
                          <button onClick={() => removeProj(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                      <input className={inputCls} placeholder="Project Name" value={proj.name} onChange={e => updateProj(i, 'name', e.target.value)} />
                      <textarea className={textareaCls} rows={2} placeholder="Project description..." value={proj.description} onChange={e => updateProj(i, 'description', e.target.value)} />
                      <label className="text-xs text-gray-400 mb-1 block">Roles & Responsibilities (one per line)</label>
                      <textarea className={textareaCls} rows={3} placeholder="Designed and implemented REST APIs&#10;Managed database schema and migrations&#10;Conducted code reviews and testing" value={proj.responsibilities} onChange={e => updateProj(i, 'responsibilities', e.target.value)} />
                    </div>
                  ))}
                  <button onClick={addProj} className="flex items-center gap-1 text-neon-blue text-xs hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <SectionHeader id="education" label="Education" icon={GraduationCap} />
              {openSection === 'education' && (
                <div className="p-4 bg-dark-800/60 space-y-4">
                  {formData.educations.map((edu, i) => (
                    <div key={i} className="bg-dark-900 border border-white/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium">Education {i + 1}</span>
                        {formData.educations.length > 1 && (
                          <button onClick={() => removeEdu(i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                      <input className={inputCls} placeholder="Degree (e.g. B.Tech in Computer Science)" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} />
                      <input className={inputCls} placeholder="Institute Name" value={edu.institute} onChange={e => updateEdu(i, 'institute', e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inputCls} placeholder="Year (e.g. 2022)" value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} />
                        <input className={inputCls} placeholder="GPA (optional)" value={edu.gpa || ''} onChange={e => updateEdu(i, 'gpa', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button onClick={addEdu} className="flex items-center gap-1 text-neon-blue text-xs hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add Education
                  </button>
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <SectionHeader id="certs" label="Certifications" icon={Award} />
              {openSection === 'certs' && (
                <div className="p-4 bg-dark-800/60">
                  <textarea className={textareaCls} rows={3} placeholder="AWS Certified Developer, Oracle Java SE 17, Azure AZ-204..." value={formData.certifications} onChange={e => setFormData({ ...formData, certifications: e.target.value })} />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="bg-white rounded-xl overflow-y-auto max-h-[820px] shadow-2xl">
            <ResumePreview data={formData} style={selectedTemplate.style} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ResumeBuilder;
