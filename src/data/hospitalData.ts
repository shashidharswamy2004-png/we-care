import { Department, Doctor, Testimonial, HealthArticle, Appointment } from '../types/hospital';

export const DEPARTMENTS: Department[] = [
  {
    id: 'cardiology',
    name: 'Cardiology & Cardiovascular Sciences',
    tagline: 'Comprehensive Heart Care & Advanced Interventional Procedures',
    description: 'Our world-renowned Heart Institute brings together leading cardiologists, cardiac surgeons, and electrophysiologists equipped with biplane cath labs and robotic surgical suites.',
    iconName: 'HeartPulse',
    headOfDepartment: 'Dr. Arthur Vance',
    floor: 'Building A, 3rd Floor',
    emergencyCare: true,
    keyServices: [
      'Coronary Angioplasty & Stenting',
      'Electrophysiology & Arrhythmia Ablation',
      'Minimally Invasive Valve Replacement (TAVR)',
      'Pediatric Heart Surgery & Congenital Care',
      'Cardiac Rehabilitation & Preventive Screening'
    ],
    conditionsTreated: [
      'Coronary Artery Disease',
      'Heart Failure & Cardiomyopathy',
      'Atrial Fibrillation & Arrhythmias',
      'Valvular Heart Defects',
      'Hypertension & Lipid Disorders'
    ],
    doctorIds: ['doc-1', 'doc-2', 'doc-3']
  },
  {
    id: 'neurology',
    name: 'Neurology & Neurosurgery',
    tagline: 'Pioneering Brain, Spine & Complex Nerve Care',
    description: 'Providing comprehensive inpatient and outpatient neurological services with 24/7 dedicated Stroke Care Units and advanced neuro-navigation robotic systems.',
    iconName: 'Brain',
    headOfDepartment: 'Dr. Elena Rostova',
    floor: 'Building B, 4th Floor',
    emergencyCare: true,
    keyServices: [
      'Comprehensive 24/7 Stroke Intervention',
      'Image-Guided Brain Tumor Resection',
      'Epilepsy Monitoring & Surgical Mapping',
      'Parkinson’s Disease & Deep Brain Stimulation',
      'Peripheral Neuropathy Diagnostics'
    ],
    conditionsTreated: [
      'Acute Ischemic & Hemorrhagic Stroke',
      'Brain & Spinal Cord Tumors',
      'Multiple Sclerosis & Autoimmune Neuro Disorders',
      'Epilepsy & Seizure Disorders',
      'Chronic Migraines & Headaches'
    ],
    doctorIds: ['doc-4', 'doc-5', 'doc-6']
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Joint Replacement',
    tagline: 'Restoring Mobility with Robotic Precision',
    description: 'Specializing in computer-navigated robotic joint replacements, complex spinal reconstructions, sports medicine arthroscopy, and pediatric bone health.',
    iconName: 'Bone',
    headOfDepartment: 'Dr. David Sterling',
    floor: 'Building A, 2nd Floor',
    emergencyCare: true,
    keyServices: [
      'Robotic Knee & Hip Replacement',
      'Arthroscopic Shoulder & Knee Reconstruction',
      'Endoscopic Spine Decompression',
      'Complex Fracture & Orthopedic Trauma Repair',
      'Dedicated Sports Medicine Rehabilitation'
    ],
    conditionsTreated: [
      'Osteoarthritis & Degenerative Joint Disease',
      'ACL, Meniscus & Rotator Cuff Tears',
      'Herniated Discs & Spinal Stenosis',
      'Complex Bone Fractures',
      'Pediatric Scoliosis & Deformities'
    ],
    doctorIds: ['doc-7', 'doc-8', 'doc-9']
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Child Health',
    tagline: 'Compassionate Healthcare for Infants, Children & Adolescents',
    description: 'Family-centered care supported by Level III Neonatal Intensive Care Units (NICU), pediatric emergency specialists, and child development therapy suites.',
    iconName: 'Baby',
    headOfDepartment: 'Dr. Chloe Bennett',
    floor: 'Building C, 1st & 2nd Floor',
    emergencyCare: true,
    keyServices: [
      'Level III Neonatal Intensive Care (NICU)',
      'Pediatric Emergency & Trauma Stabilization',
      'Well-Baby Checks & Immunization Programs',
      'Pediatric Allergy, Asthma & Pulmonology',
      'Developmental & Behavioral Pediatrics'
    ],
    conditionsTreated: [
      'Neonatal Prematurity & Critical Illness',
      'Pediatric Asthma & Respiratory Infections',
      'Childhood Infectious Diseases',
      'Growth Disorders & Nutritional Deficiencies',
      'ADHD & Autism Spectrum Evaluations'
    ],
    doctorIds: ['doc-10', 'doc-11', 'doc-12']
  },
  {
    id: 'oncology',
    name: 'Comprehensive Cancer Center',
    tagline: 'Precision Oncology, Molecular Diagnostics & Immunotherapy',
    description: 'A multidisciplinary tumor board approach integrating medical oncology, surgical oncology, targeted radiation, and clinical trial innovations for customized treatments.',
    iconName: 'Activity',
    headOfDepartment: 'Dr. Jonathan Kim',
    floor: 'Building D, Full Pavilion',
    emergencyCare: false,
    keyServices: [
      'Targeted Therapy & Immunotherapy Infusion',
      'Stereotactic Body Radiotherapy (SBRT)',
      'Minimally Invasive Tumor Resection',
      'Genomic Profiling & Precision Biomarker Testing',
      'Integrative Palliative & Supportive Oncology'
    ],
    conditionsTreated: [
      'Breast, Lung & Colorectal Cancers',
      'Hematologic Malignancies (Leukemia, Lymphoma)',
      'Prostate & Gynecologic Cancers',
      'Head & Neck Tumors',
      'Gastrointestinal & Pancreatic Cancers'
    ],
    doctorIds: ['doc-13', 'doc-14', 'doc-15']
  },
  {
    id: 'obgyn',
    name: 'Obstetrics & Gynecology',
    tagline: 'Holistic Care Across Every Stage of Womanhood',
    description: 'From pre-conception planning and high-risk maternity care to laparoscopic gynecological surgery and menopause management in private birthing suites.',
    iconName: 'ShieldCheck',
    headOfDepartment: 'Dr. Nalini Sharma',
    floor: 'Building C, 3rd Floor',
    emergencyCare: true,
    keyServices: [
      'Natural & High-Risk Birthing Suites',
      'Fetal Medicine & Advanced Genetic Screening',
      'Laparoscopic & Hysteroscopic Gynecological Surgery',
      'Infertility Assessment & Reproductive Health',
      'Menopause & Gynecologic Endocrinology'
    ],
    conditionsTreated: [
      'High-Risk Pregnancies & Preeclampsia',
      'Uterine Fibroids & Endometriosis',
      'Polycystic Ovary Syndrome (PCOS)',
      'Pelvic Organ Prolapse & Incontinence',
      'Cervical & Ovarian Health Screenings'
    ],
    doctorIds: ['doc-16', 'doc-17', 'doc-18']
  },
  {
    id: 'emergency',
    name: 'Emergency & Critical Care',
    tagline: '24/7 Level 1 Trauma Care with Rapid Response Teams',
    description: 'Immediate resuscitation, advanced point-of-care diagnostics, and instant catheterization lab activation for cardiac, stroke, and multi-system trauma crises.',
    iconName: 'Ambulance',
    headOfDepartment: 'Dr. Victor Morales',
    floor: 'Ground Floor, North Gate Entry',
    emergencyCare: true,
    keyServices: [
      '24/7 Level 1 Trauma Resuscitation Bays',
      'Code STEMI Rapid Catheterization Activation',
      'Code Stroke Intravenous Thrombolysis',
      'Dedicated Critical Care Air & Ground Transport',
      'Disaster Management & Toxicology Protocol'
    ],
    conditionsTreated: [
      'Massive Trauma & Severe Hemorrhage',
      'Cardiac Arrest & Life-Threatening Arrhythmias',
      'Severe Respiratory Failure & ARDS',
      'Acute Poisoning & Toxic Ingestion',
      'Severe Sepsis & Septic Shock'
    ],
    doctorIds: ['doc-19', 'doc-20']
  },
  {
    id: 'dermatology',
    name: 'Dermatology & Skin Science',
    tagline: 'Clinical Dermatology & Cutaneous Laser Medicine',
    description: 'State-of-the-art dermatopathology, Mohs micrographic surgery for skin cancer, chronic inflammatory disease management, and restorative cutaneous medicine.',
    iconName: 'Sparkles',
    headOfDepartment: 'Dr. Sophia Lorenzen',
    floor: 'Building B, 2nd Floor',
    emergencyCare: false,
    keyServices: [
      'Mohs Micrographic Surgery for Skin Cancer',
      'Biologic Therapies for Psoriasis & Eczema',
      'Phototherapy & Cutaneous Laser Therapy',
      'Dermatopathology & Skin Biopsy Analysis',
      'Scar Revision & Medical Cosmetic Dermatology'
    ],
    conditionsTreated: [
      'Melanoma & Non-Melanoma Skin Cancers',
      'Severe Psoriasis & Atopic Dermatitis',
      'Autoimmune Bullous Diseases',
      'Alopecia & Severe Hair Follicle Disorders',
      'Acne Rosacea & Vascular Lesions'
    ],
    doctorIds: ['doc-21', 'doc-22']
  }
];

export const DOCTORS: Doctor[] = [
  // Cardiology
  {
    id: 'doc-1',
    name: 'Dr. Arthur Vance',
    title: 'Director of Cardiology & Interventional Lead',
    departmentId: 'cardiology',
    departmentName: 'Cardiology & Cardiovascular Sciences',
    qualifications: 'MD, FACC, FSCAI (Harvard Medical School)',
    experienceYears: 24,
    languages: ['English', 'Spanish'],
    rating: 4.96,
    reviewCount: 382,
    consultationFee: 180,
    about: 'Dr. Vance has performed over 4,500 coronary interventions and is a pioneer in transcatheter aortic valve implantation (TAVR). He serves on international clinical consensus committees.',
    specializations: ['Complex Coronary Interventions', 'TAVR & Valve Repair', 'Peripheral Vascular Disease', 'Heart Failure Management'],
    education: ['MD - Harvard Medical School', 'Fellowship in Interventional Cardiology - Johns Hopkins Hospital', 'Residency - Massachusetts General Hospital'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'],
    isAvailableToday: true,
    avatarSeed: 'ArthurVance'
  },
  {
    id: 'doc-2',
    name: 'Dr. Maya Lin',
    title: 'Consultant Cardiac Electrophysiologist',
    departmentId: 'cardiology',
    departmentName: 'Cardiology & Cardiovascular Sciences',
    qualifications: 'MD, FHRS (Stanford University)',
    experienceYears: 16,
    languages: ['English', 'Mandarin'],
    rating: 4.92,
    reviewCount: 245,
    consultationFee: 160,
    about: 'Specializing in arrhythmia diagnosis and 3D catheter ablations for atrial fibrillation. Dr. Lin leads the WeCare Arrhythmia Research Institute.',
    specializations: ['Atrial Fibrillation Ablation', 'Pacemaker & ICD Implantation', 'Syncope Evaluation', 'Ventricular Tachycardia'],
    education: ['MD - Stanford University School of Medicine', 'Fellowship in Electrophysiology - Cleveland Clinic', 'Internal Medicine - UCSF'],
    availableDays: ['Tuesday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'MayaLin'
  },
  {
    id: 'doc-3',
    name: 'Dr. Robert Chen',
    title: 'Preventive Cardiologist & Lipidologist',
    departmentId: 'cardiology',
    departmentName: 'Cardiology & Cardiovascular Sciences',
    qualifications: 'MD, MPH, FACC (Columbia University)',
    experienceYears: 14,
    languages: ['English', 'Cantonese'],
    rating: 4.89,
    reviewCount: 198,
    consultationFee: 140,
    about: 'Dr. Chen focuses on early risk stratification, advanced cardiovascular imaging (CT coronary angiography), and aggressive reversal of metabolic cardiovascular diseases.',
    specializations: ['Cardiovascular Risk Profiling', 'Coronary Calcium & CT Angiography', 'Familial Hypercholesterolemia', 'Sports Cardiology'],
    education: ['MD & MPH - Columbia University', 'Cardiology Fellowship - NewYork-Presbyterian Hospital', 'Residency - Brigham and Women’s Hospital'],
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'],
    isAvailableToday: false,
    avatarSeed: 'RobertChen'
  },

  // Neurology
  {
    id: 'doc-4',
    name: 'Dr. Elena Rostova',
    title: 'Chief of Neurosurgery & Skull Base Specialist',
    departmentId: 'neurology',
    departmentName: 'Neurology & Neurosurgery',
    qualifications: 'MD, PhD, FAANS (Oxford / Mayo Clinic)',
    experienceYears: 22,
    languages: ['English', 'Russian', 'German'],
    rating: 4.98,
    reviewCount: 410,
    consultationFee: 200,
    about: 'Internationally recognized for micro-neurosurgical resections of pituitary tumors, meningiomas, and brainstem lesions using augmented-reality navigation.',
    specializations: ['Minimally Invasive Skull Base Surgery', 'Awake Craniotomy', 'Aneurysm Clipping', 'Complex Spine Surgery'],
    education: ['PhD in Neuro-oncology - University of Oxford', 'Neurosurgery Residency - Mayo Clinic Rochester', 'Fellowship - Barrow Neurological Institute'],
    availableDays: ['Monday', 'Tuesday', 'Thursday'],
    availableSlots: ['08:30 AM', '10:00 AM', '01:30 PM', '03:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'ElenaRostova'
  },
  {
    id: 'doc-5',
    name: 'Dr. Marcus Brody',
    title: 'Senior Neurologist & Stroke Care Director',
    departmentId: 'neurology',
    departmentName: 'Neurology & Neurosurgery',
    qualifications: 'MD, FAAN (Yale School of Medicine)',
    experienceYears: 18,
    languages: ['English'],
    rating: 4.91,
    reviewCount: 260,
    consultationFee: 155,
    about: 'Directs the emergency comprehensive stroke service. Champion of rapid thrombectomy protocols and neuro-critical care recovery.',
    specializations: ['Acute Stroke Intervention', 'Neurocritical Care', 'Carotid Doppler & Neurosonology', 'Vascular Dementia'],
    education: ['MD - Yale University', 'Vascular Neurology Fellowship - NYU Langone', 'Residency - Mount Sinai Medical Center'],
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
    isAvailableToday: true,
    avatarSeed: 'MarcusBrody'
  },
  {
    id: 'doc-6',
    name: 'Dr. Samantha Hayes',
    title: 'Consultant Neurologist & Epilepsy Specialist',
    departmentId: 'neurology',
    departmentName: 'Neurology & Neurosurgery',
    qualifications: 'MD, FAES (Northwestern University)',
    experienceYears: 12,
    languages: ['English', 'French'],
    rating: 4.88,
    reviewCount: 175,
    consultationFee: 145,
    about: 'Dedicated to treating drug-resistant epilepsy, sleep disorders, and autoimmune encephalitis through specialized video EEG monitoring and neuromodulation.',
    specializations: ['Epilepsy & Long-Term Video EEG', 'Neuromodulation (VNS/RNS)', 'Sleep Medicine', 'Multiple Sclerosis Care'],
    education: ['MD - Northwestern University Feinberg School of Medicine', 'Epilepsy Fellowship - UCLA Medical Center', 'Residency - Barnes-Jewish Hospital'],
    availableDays: ['Tuesday', 'Thursday', 'Friday'],
    availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    isAvailableToday: false,
    avatarSeed: 'SamanthaHayes'
  },

  // Orthopedics
  {
    id: 'doc-7',
    name: 'Dr. David Sterling',
    title: 'Chief Orthopedic Surgeon & Robotic Joint Lead',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics & Joint Replacement',
    qualifications: 'MD, FAAOS (University of Pennsylvania)',
    experienceYears: 21,
    languages: ['English'],
    rating: 4.95,
    reviewCount: 520,
    consultationFee: 175,
    about: 'Specialist in MAKO robotic-assisted total hip and knee arthroplasty, enabling precision bone preservation and rapid same-day patient mobilization.',
    specializations: ['Robotic Knee & Hip Arthroplasty', 'Revision Joint Reconstruction', 'Partial Knee Replacement', 'Osteoarthritis Surgery'],
    education: ['MD - Perelman School of Medicine at Penn', 'Adult Reconstruction Fellowship - Hospital for Special Surgery', 'Residency - Penn Medicine'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    availableSlots: ['09:00 AM', '10:30 AM', '01:30 PM', '03:30 PM'],
    isAvailableToday: true,
    avatarSeed: 'DavidSterling'
  },
  {
    id: 'doc-8',
    name: 'Dr. Angela Martinez',
    title: 'Sports Medicine Surgeon & Arthroscopy Specialist',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics & Joint Replacement',
    qualifications: 'MD, AOSSM (Baylor College of Medicine)',
    experienceYears: 15,
    languages: ['English', 'Spanish'],
    rating: 4.93,
    reviewCount: 310,
    consultationFee: 160,
    about: 'Team physician for collegiate athletics, specializing in complex ligament reconstructions (ACL, PCL), rotator cuff tears, and labral preservation.',
    specializations: ['ACL & Multi-ligament Knee Reconstruction', 'Shoulder Arthroscopy & Rotator Cuff Repair', 'Cartilage Restoration Procedures', 'Overuse Sports Injuries'],
    education: ['MD - Baylor College of Medicine', 'Sports Medicine Fellowship - Steadman Clinic', 'Residency - Emory University Hospital'],
    availableDays: ['Tuesday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:30 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'AngelaMartinez'
  },
  {
    id: 'doc-9',
    name: 'Dr. Tariq Al-Mansoor',
    title: 'Consultant Spine Surgeon & Traumatologist',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics & Joint Replacement',
    qualifications: 'MD, FRCS, NASS (Imperial College London)',
    experienceYears: 17,
    languages: ['English', 'Arabic'],
    rating: 4.90,
    reviewCount: 230,
    consultationFee: 170,
    about: 'Focuses on motion-sparing spinal artificial disc replacement, endoscopic lumbar decompression, and pelvic trauma reconstruction.',
    specializations: ['Minimally Invasive Spine Surgery', 'Artificial Disc Replacement', 'Spinal Deformity & Scoliosis', 'Complex Pelvic Fractures'],
    education: ['MBBS - Imperial College London', 'Spine Fellowship - Cleveland Clinic', 'Trauma Fellowship - Toronto General Hospital'],
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'],
    isAvailableToday: false,
    avatarSeed: 'TariqAlMansoor'
  },

  // Pediatrics
  {
    id: 'doc-10',
    name: 'Dr. Chloe Bennett',
    title: 'Director of Pediatrics & Neonatologist',
    departmentId: 'pediatrics',
    departmentName: 'Pediatrics & Child Health',
    qualifications: 'MD, FAAP (Johns Hopkins University)',
    experienceYears: 19,
    languages: ['English'],
    rating: 4.97,
    reviewCount: 460,
    consultationFee: 150,
    about: 'Warm, reassuring pediatrician dedicated to newborn intensive care and preventive child healthcare. Oversees WeCare’s 30-bed Level III NICU.',
    specializations: ['Neonatal Intensive Care (NICU)', 'Newborn & Infant Development', 'Pediatric Nutrition', 'Preventive Pediatric Care'],
    education: ['MD - Johns Hopkins University School of Medicine', 'Neonatology Fellowship - Boston Children’s Hospital', 'Residency - Children’s Hospital of Philadelphia'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    availableSlots: ['08:30 AM', '10:00 AM', '01:00 PM', '03:30 PM'],
    isAvailableToday: true,
    avatarSeed: 'ChloeBennett'
  },
  {
    id: 'doc-11',
    name: 'Dr. Kevin Patel',
    title: 'Pediatric Pulmonologist & Allergy Specialist',
    departmentId: 'pediatrics',
    departmentName: 'Pediatrics & Child Health',
    qualifications: 'MD, FAAP (University of Chicago)',
    experienceYears: 13,
    languages: ['English', 'Hindi', 'Gujarati'],
    rating: 4.90,
    reviewCount: 220,
    consultationFee: 140,
    about: 'Passionate about diagnosing and treating severe pediatric asthma, chronic coughing, seasonal allergies, and food sensitivities in young children.',
    specializations: ['Pediatric Asthma Management', 'Childhood Allergies & Anaphylaxis', 'Cystic Fibrosis Care', 'Chronic Cough & Sleep Apnea'],
    education: ['MD - Pritzker School of Medicine, University of Chicago', 'Pediatric Pulmonology Fellowship - Cincinnati Children’s', 'Residency - Lurie Children’s Hospital'],
    availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'KevinPatel'
  },
  {
    id: 'doc-12',
    name: 'Dr. Linda Zhao',
    title: 'Adolescent Medicine & Child Development Consultant',
    departmentId: 'pediatrics',
    departmentName: 'Pediatrics & Child Health',
    qualifications: 'MD, MPH, FAAP (Cornell University)',
    experienceYears: 11,
    languages: ['English', 'Mandarin'],
    rating: 4.88,
    reviewCount: 185,
    consultationFee: 135,
    about: 'Helps children navigate developmental milestones, learning difficulties, behavioral transitions, and teenage health challenges with empathy and science.',
    specializations: ['Adolescent Health & Wellness', 'Developmental Milestone Assessments', 'Child Behavioral Counseling', 'Pediatric Preventive Health'],
    education: ['MD - Weill Cornell Medical College', 'Fellowship in Adolescent Medicine - Stanford Children’s Health', 'Residency - NewYork-Presbyterian'],
    availableDays: ['Monday', 'Wednesday', 'Thursday'],
    availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM'],
    isAvailableToday: false,
    avatarSeed: 'LindaZhao'
  },

  // Oncology
  {
    id: 'doc-13',
    name: 'Dr. Jonathan Kim',
    title: 'Director of Cancer Center & Medical Oncologist',
    departmentId: 'oncology',
    departmentName: 'Comprehensive Cancer Center',
    qualifications: 'MD, PhD, FACP, FASCO (Stanford / Dana-Farber)',
    experienceYears: 23,
    languages: ['English', 'Korean'],
    rating: 4.97,
    reviewCount: 395,
    consultationFee: 195,
    about: 'Leader in immunotherapy protocols and personalized targeted chemotherapy tailored to genetic mutation panels for solid tumors.',
    specializations: ['Precision Targeted Therapy', 'Immunotherapy & Checkpoint Inhibitors', 'Lung & Gastrointestinal Cancers', 'Clinical Trial Therapies'],
    education: ['MD & PhD - Stanford University', 'Hematology/Oncology Fellowship - Dana-Farber Cancer Institute', 'Residency - Brigham and Women’s Hospital'],
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'JonathanKim'
  },
  {
    id: 'doc-14',
    name: 'Dr. Rachel Zimmerman',
    title: 'Surgical Oncologist & Breast Cancer Specialist',
    departmentId: 'oncology',
    departmentName: 'Comprehensive Cancer Center',
    qualifications: 'MD, FACS, SSO (Duke University)',
    experienceYears: 17,
    languages: ['English', 'Hebrew'],
    rating: 4.94,
    reviewCount: 280,
    consultationFee: 185,
    about: 'Dedicated to oncoplastic breast-conserving surgeries, sentinel node biopsies, and minimally invasive gastrointestinal tumor resections.',
    specializations: ['Oncoplastic Breast Surgery', 'Sentinel Lymph Node Biopsy', 'Soft Tissue Sarcomas', 'Melanoma Wide Local Excision'],
    education: ['MD - Duke University School of Medicine', 'Surgical Oncology Fellowship - Memorial Sloan Kettering', 'Residency - Johns Hopkins Hospital'],
    availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
    availableSlots: ['09:30 AM', '11:00 AM', '01:30 PM', '03:30 PM'],
    isAvailableToday: true,
    avatarSeed: 'RachelZimmerman'
  },
  {
    id: 'doc-15',
    name: 'Dr. Sean O’Connor',
    title: 'Consultant Radiation Oncologist',
    departmentId: 'oncology',
    departmentName: 'Comprehensive Cancer Center',
    qualifications: 'MD, FASTRO (UCLA David Geffen)',
    experienceYears: 15,
    languages: ['English', 'Gaelic'],
    rating: 4.89,
    reviewCount: 190,
    consultationFee: 175,
    about: 'Specializes in high-precision stereotactic radiosurgery (SRS/SBRT), proton radiotherapy integration, and motion-tracked intensity modulated radiation therapy.',
    specializations: ['Stereotactic Radiosurgery (SRS)', 'Image-Guided Radiotherapy (IGRT)', 'Prostate & CNS Radiotherapy', 'Brachytherapy'],
    education: ['MD - UCLA David Geffen School of Medicine', 'Radiation Oncology Residency - MD Anderson Cancer Center', 'Internship - Cedars-Sinai Medical Center'],
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM'],
    isAvailableToday: false,
    avatarSeed: 'SeanOConnor'
  },

  // Obstetrics & Gynecology
  {
    id: 'doc-16',
    name: 'Dr. Nalini Sharma',
    title: 'Chief of OB/GYN & Maternal-Fetal Medicine',
    departmentId: 'obgyn',
    departmentName: 'Obstetrics & Gynecology',
    qualifications: 'MD, FACOG, SMFM (Columbia / Mount Sinai)',
    experienceYears: 22,
    languages: ['English', 'Hindi'],
    rating: 4.96,
    reviewCount: 480,
    consultationFee: 170,
    about: 'Specialist in managing complex high-risk pregnancies, multiple gestations, gestational diabetes, and prenatal diagnostics with deep compassion.',
    specializations: ['High-Risk Obstetrics & Prenatal Care', 'Fetal Ultrasonography & Diagnostics', 'Multiple Gestations & Pre-eclampsia', 'Postpartum Recovery'],
    education: ['MD - Columbia University', 'Maternal-Fetal Medicine Fellowship - Mount Sinai Hospital', 'Residency - Yale-New Haven Hospital'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    availableSlots: ['09:00 AM', '10:30 AM', '01:30 PM', '03:30 PM'],
    isAvailableToday: true,
    avatarSeed: 'NaliniSharma'
  },
  {
    id: 'doc-17',
    name: 'Dr. Clara Dupont',
    title: 'Consultant Gynecologist & Laparoscopic Surgeon',
    departmentId: 'obgyn',
    departmentName: 'Obstetrics & Gynecology',
    qualifications: 'MD, FACOG (University of Paris / Cleveland Clinic)',
    experienceYears: 16,
    languages: ['English', 'French'],
    rating: 4.93,
    reviewCount: 310,
    consultationFee: 155,
    about: 'Pioneer in single-incision laparoscopic surgery for deep infiltrating endometriosis, uterine fibroids, and pelvic floor reconstruction.',
    specializations: ['Advanced Laparoscopic & Robotic Surgery', 'Endometriosis Excision', 'Uterine Fibroid Myomectomy', 'Hysteroscopic Interventions'],
    education: ['MD - Université Paris Cité', 'Minimally Invasive Gynecologic Surgery Fellowship - Cleveland Clinic', 'Residency - Northwestern Memorial Hospital'],
    availableDays: ['Tuesday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'ClaraDupont'
  },
  {
    id: 'doc-18',
    name: 'Dr. Hannah Wright',
    title: 'Obstetrician & Women’s Reproductive Health Lead',
    departmentId: 'obgyn',
    departmentName: 'Obstetrics & Gynecology',
    qualifications: 'MD, FACOG (University of Michigan)',
    experienceYears: 12,
    languages: ['English', 'Spanish'],
    rating: 4.90,
    reviewCount: 225,
    consultationFee: 145,
    about: 'Focuses on routine prenatal care, contraceptive counseling, fertility optimization, polycystic ovarian syndrome management, and menopause transitions.',
    specializations: ['Comprehensive Prenatal & Postnatal Care', 'PCOS & Hormonal Imbalances', 'Cervical Health & Pap Screening', 'Menopause Symptom Therapy'],
    education: ['MD - University of Michigan Medical School', 'Residency in Obstetrics & Gynecology - Oregon Health & Science University'],
    availableDays: ['Monday', 'Thursday', 'Friday'],
    availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM'],
    isAvailableToday: false,
    avatarSeed: 'HannahWright'
  },

  // Emergency & Trauma
  {
    id: 'doc-19',
    name: 'Dr. Victor Morales',
    title: 'Director of Emergency Medicine & Trauma Resuscitation',
    departmentId: 'emergency',
    departmentName: 'Emergency & Critical Care',
    qualifications: 'MD, FACEP, FAAEM (UT Southwestern)',
    experienceYears: 20,
    languages: ['English', 'Spanish'],
    rating: 4.95,
    reviewCount: 340,
    consultationFee: 160,
    about: 'Over two decades of experience leading frontline Level 1 Trauma Centers. Expert in acute cardiac arrest, airway management, and disaster response triage.',
    specializations: ['Trauma Resuscitation & Shock', 'Emergency Ultrasound & Echo', 'Airway Management & Ventilation', 'Acute Coronary & Stroke Triage'],
    education: ['MD - UT Southwestern Medical Center', 'Emergency Medicine Residency - Parkland Memorial Hospital', 'Disaster Medicine Fellowship - Harvard'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['08:00 AM', '10:00 AM', '01:00 PM', '03:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'VictorMorales'
  },
  {
    id: 'doc-20',
    name: 'Dr. Priya Nambiar',
    title: 'Critical Care Intensivist & Emergency Physician',
    departmentId: 'emergency',
    departmentName: 'Emergency & Critical Care',
    qualifications: 'MD, FCCM (University of Washington)',
    experienceYears: 14,
    languages: ['English', 'Malayalam', 'Tamil'],
    rating: 4.92,
    reviewCount: 210,
    consultationFee: 155,
    about: 'Leads the 40-bed Medical-Surgical Intensive Care Unit. Dedicated to ECMO therapy, sepsis protocols, and point-of-care critical ultrasonography.',
    specializations: ['Extracorporeal Membrane Oxygenation (ECMO)', 'Septic Shock Hemodynamics', 'Multi-organ Dysfunction Support', 'Targeted Temperature Management'],
    education: ['MD - University of Washington School of Medicine', 'Critical Care Fellowship - Mayo Clinic', 'Residency - Harborview Medical Center'],
    availableDays: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    isAvailableToday: true,
    avatarSeed: 'PriyaNambiar'
  },

  // Dermatology
  {
    id: 'doc-21',
    name: 'Dr. Sophia Lorenzen',
    title: 'Chief Dermatologist & Mohs Micrographic Surgeon',
    departmentId: 'dermatology',
    departmentName: 'Dermatology & Skin Science',
    qualifications: 'MD, FACMS, FAAD (Johns Hopkins / Penn)',
    experienceYears: 18,
    languages: ['English', 'German'],
    rating: 4.96,
    reviewCount: 420,
    consultationFee: 165,
    about: 'Specializes in high-precision Mohs micrographic surgery with 99% cure rates for facial basal cell and squamous cell skin cancers, as well as melanoma detection.',
    specializations: ['Mohs Micrographic Surgery', 'Melanoma & Dermoscopy', 'Complex Facial Reconstruction', 'Skin Cancer Screening'],
    education: ['MD - Johns Hopkins University', 'Mohs Surgery Fellowship - University of Pennsylvania', 'Dermatology Residency - NYU Langone'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday'],
    availableSlots: ['09:00 AM', '10:30 AM', '01:30 PM', '03:30 PM'],
    isAvailableToday: true,
    avatarSeed: 'SophiaLorenzen'
  },
  {
    id: 'doc-22',
    name: 'Dr. Aris Thorne',
    title: 'Consultant Clinical & Laser Dermatologist',
    departmentId: 'dermatology',
    departmentName: 'Dermatology & Skin Science',
    qualifications: 'MD, FAAD (Georgetown University)',
    experienceYears: 13,
    languages: ['English', 'Greek'],
    rating: 4.89,
    reviewCount: 250,
    consultationFee: 150,
    about: 'Expert in biologic therapies for severe psoriasis, refractory atopic dermatitis, vascular laser therapies, and complex acne scarring treatments.',
    specializations: ['Psoriasis & Biologics Management', 'Vascular & Fractional Laser Therapies', 'Atopic Eczema Management', 'Scar Restoration'],
    education: ['MD - Georgetown University School of Medicine', 'Dermatology Residency - University of Miami Hospital', 'Laser Surgery Fellowship - Boston'],
    availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
    isAvailableToday: false,
    avatarSeed: 'ArisThorne'
  }
];

export const INITIAL_SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    referenceNumber: 'WC-2026-9481',
    departmentId: 'cardiology',
    departmentName: 'Cardiology & Cardiovascular Sciences',
    doctorId: 'doc-1',
    doctorName: 'Dr. Arthur Vance',
    doctorTitle: 'Director of Cardiology & Interventional Lead',
    appointmentType: 'In-Person Consultation',
    date: '2026-10-14',
    timeSlot: '10:30 AM',
    patientName: 'Eleanor Davis',
    patientEmail: 'eleanor.davis@example.com',
    patientPhone: '+1 (555) 234-5678',
    patientAge: '58',
    patientGender: 'Female',
    reasonForVisit: 'Annual cardiovascular risk evaluation and mild exertional palpitation checkup.',
    isFirstVisit: false,
    notes: 'Prior ECG performed 6 months ago showed benign sinus tachycardia.',
    status: 'Confirmed',
    createdAt: '2026-10-09T14:32:00Z'
  },
  {
    id: 'apt-102',
    referenceNumber: 'WC-2026-8320',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics & Joint Replacement',
    doctorId: 'doc-7',
    doctorName: 'Dr. David Sterling',
    doctorTitle: 'Chief Orthopedic Surgeon & Robotic Joint Lead',
    appointmentType: 'In-Person Consultation',
    date: '2026-10-18',
    timeSlot: '01:30 PM',
    patientName: 'Eleanor Davis',
    patientEmail: 'eleanor.davis@example.com',
    patientPhone: '+1 (555) 234-5678',
    patientAge: '58',
    patientGender: 'Female',
    reasonForVisit: 'Follow-up on right knee stiffness after physical therapy regimen.',
    isFirstVisit: false,
    notes: 'Please bring recent X-ray films if available.',
    status: 'Confirmed',
    createdAt: '2026-10-08T09:15:00Z'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    patientName: 'Margaret Holloway',
    age: 64,
    departmentName: 'Cardiology & Heart Institute',
    doctorTreated: 'Dr. Arthur Vance',
    quote: 'When I suffered acute angina, the WeCare emergency catheterization team operated within 22 minutes. Dr. Vance explained every step to my husband and me with enormous kindness. Today I walk three miles every morning pain-free.',
    outcome: 'Emergency Angioplasty & Full Cardiac Rehabilitation',
    date: 'August 2026'
  },
  {
    id: 't-2',
    patientName: 'Richard Sterling-Hayes',
    age: 52,
    departmentName: 'Robotic Orthopedics',
    doctorTreated: 'Dr. David Sterling',
    quote: 'I had severe osteoarthritis in both hips and thought I would never hike again. Dr. Sterling performed robotic bilateral arthroplasty. By week six, I had zero bone-on-bone pain and walked out without crutches.',
    outcome: 'Robotic Total Hip Arthroplasty (Both Hips)',
    date: 'September 2026'
  },
  {
    id: 't-3',
    patientName: 'Clara & Sean Gallagher',
    age: 34,
    departmentName: 'Maternity & Level III NICU',
    doctorTreated: 'Dr. Chloe Bennett & Dr. Nalini Sharma',
    quote: 'Our twins were born 7 weeks early. The Level III NICU team at WeCare treated our babies as if they were their own. The private family suites let us stay by their incubators 24 hours a day until we safely went home together.',
    outcome: 'Successful 31-Day Premature Twin NICU Care',
    date: 'July 2026'
  }
];

export const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'art-1',
    title: 'Recognizing Atypical Signs of Heart Conditions Before Symptoms Escalate',
    category: 'Heart Health',
    readTime: '4 min read',
    summary: 'Cardiologists explain why fatigue, uncharacteristic breathlessness, and subtle jaw pressure can signal underlying vascular stress before sudden acute events.',
    author: 'Dr. Robert Chen · Preventive Cardiology',
    date: 'October 2, 2026'
  },
  {
    id: 'art-2',
    title: 'Robotic Joint Arthroplasty vs Conventional Surgery: Key Differences Explained',
    category: 'Orthopedic Science',
    readTime: '5 min read',
    summary: 'A detailed breakdown of how CT-guided robotic planning preserves healthy subchondral bone, reduces soft-tissue trauma, and shortens hospital stays.',
    author: 'Dr. David Sterling · Joint Reconstruction',
    date: 'September 26, 2026'
  },
  {
    id: 'art-3',
    title: 'Childhood Respiratory Health: Differentiating Seasonal Allergies from Pediatric Asthma',
    category: 'Pediatric Care',
    readTime: '3 min read',
    summary: 'A practical parent guide on monitoring nocturnal coughs, wheezing triggers, and understanding modern biologic antihistamine options.',
    author: 'Dr. Kevin Patel · Pediatric Pulmonology',
    date: 'September 14, 2026'
  }
];

export const HOSPITAL_METRICS = [
  { label: 'Specialist Physicians & Surgeons', value: '350+' },
  { label: 'Annual Patient Consultations', value: '75,000+' },
  { label: 'Patient Satisfaction Rating', value: '99.4%' },
  { label: '24/7 Level 1 Trauma Emergency Beds', value: '45' }
];

export const ACCREDITATIONS = [
  {
    name: 'Joint Commission International (JCI)',
    badge: 'Gold Seal of Approval',
    description: 'Highest global standard for patient safety and clinical quality protocols.'
  },
  {
    name: 'National Accreditation Board for Hospitals',
    badge: 'Super-Specialty Standard',
    description: 'Certified excellence across advanced operative, ICU, and pharmacological standards.'
  },
  {
    name: 'Magnet Nursing Excellence Award',
    badge: 'Top 2% Globally',
    description: 'Recognized for extraordinary patient-to-nurse ratio and compassionate bedside care.'
  },
  {
    name: 'College of American Pathologists (CAP)',
    badge: 'Precision Lab Certified',
    description: 'Rigorous diagnostic laboratory accuracy and genetic sequencing certification.'
  }
];
