export interface WelfareScheme {
  id: string;
  code: string;
  name: string;
  ministry: string;
  category: 'HEALTH' | 'HOUSING' | 'FINANCIAL_INCOME' | 'WOMEN_CHILD' | 'WORKER_LABOR' | 'SENIOR_PENSION';
  targetBeneficiaries: string;
  maxBenefit: string;
  incomeLimit: string;
  eligibilityCriteria: string[];
  ineligibilityExclusions: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialPortalUrl: string;
  helplineNumber: string;
  plainLanguageSummary: string;
}

export const WELFARE_SCHEMES_CATALOG: WelfareScheme[] = [
  {
    id: 'ayushman-bharat-pmjay',
    code: 'PM-JAY',
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
    ministry: 'Ministry of Health and Family Welfare / National Health Authority (NHA)',
    category: 'HEALTH',
    targetBeneficiaries: 'Bottom 40% vulnerable families (SECC 2011 database + expanded state schemes + all senior citizens aged 70+)',
    maxBenefit: '₹5,00,000 per family per year for secondary and tertiary hospitalisation across 29,000+ empanelled hospitals',
    incomeLimit: 'Based on SECC deprivation criteria (Deprivation D1 to D7) or Ayushman Vay Vandana card for 70+',
    eligibilityCriteria: [
      'Families categorized as vulnerable under Socio-Economic Caste Census (SECC 2011).',
      'Families holding BPL/Antyodaya Anna Yojana (AAY) ration cards in participating states.',
      'Active unorganized workers registered on e-Shram portal with linked ration card.',
      'All Indian citizens aged 70 years and above (Ayushman Vay Vandana Card with top-up ₹5 Lakhs).'
    ],
    ineligibilityExclusions: [
      'Government employees or pensioners covered under CGHS / ECHS.',
      'Households owning 3 or 4-wheel motorized vehicles or mechanized farm equipment.',
      'Income tax paying individuals or households with monthly income > ₹25,000 in formal sector.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Mandatory for biometric/OTP e-KYC)',
      'Ration Card (NFSA / Antyodaya / State BPL card) or PM-JAY Family ID letter',
      'Active mobile number linked to Aadhaar'
    ],
    applicationProcess: [
      'Check eligibility on beneficiary.nha.gov.in using Aadhaar or Ration Card number.',
      'Visit nearest Common Service Centre (CSC) or Ayushman Arogya Mandir / Empanelled Hospital.',
      'Complete biometric e-KYC authentication and generate instant PVC Ayushman Card with QR code.',
      'Present Ayushman card at Ayushman Mitra desk during hospital admission for 100% cashless treatment.'
    ],
    officialPortalUrl: 'https://beneficiary.nha.gov.in',
    helplineNumber: '14555 / 1800-111-565',
    plainLanguageSummary: 'Gives your entire family free, 100% cashless hospital treatment up to ₹5 Lakhs every year for major surgeries, cancer therapy, heart procedures, and ICU care at government and private hospitals.'
  },
  {
    id: 'pm-kisan-samman-nidhi',
    code: 'PM-KISAN',
    name: 'Pradhan Mantri Kisan Samman Nidhi',
    ministry: 'Ministry of Agriculture and Farmers Welfare',
    category: 'FINANCIAL_INCOME',
    targetBeneficiaries: 'All landholding farmer families across India',
    maxBenefit: '₹6,000 per year delivered in 3 equal four-monthly installments of ₹2,000 directly to bank accounts (DBT)',
    incomeLimit: 'No strict income ceiling, but institutional landholders and income tax payers are excluded',
    eligibilityCriteria: [
      'Farmer families who own cultivable land in their name according to state land revenue records (RoR / Khatauni).',
      'Small and marginal farmers as well as medium landholders.',
      'Bank account must be Aadhaar-seeded and NPCI-enabled for Direct Benefit Transfer.'
    ],
    ineligibilityExclusions: [
      'Institutional landholders (trusts, companies).',
      'Farmer families holding constitutional posts (MPs, MLAs, Mayors).',
      'Serving or retired officers and employees of Central/State Government (except multi-tasking staff).',
      'All persons who paid Income Tax in last assessment year.'
    ],
    requiredDocuments: [
      'Aadhaar Card with mobile linkage',
      'Land Ownership Record (Khatauni / Patta / 7/12 extract showing applicant as legal owner)',
      'Aadhaar-seeded Bank Account passbook with IFSC code'
    ],
    applicationProcess: [
      'Self-register on pmkisan.gov.in under "New Farmer Registration" or visit local Patwari / CSC.',
      'Upload land ownership document and verify land parcel Khatauni number.',
      'Complete mandatory Aadhaar OTP Face-auth or e-KYC on the portal.',
      'Install PM-KISAN mobile app for automated installment status tracking.'
    ],
    officialPortalUrl: 'https://pmkisan.gov.in',
    helplineNumber: '155261 / 011-24300606',
    plainLanguageSummary: 'Provides ₹6,000 guaranteed cash every year directly to your bank account in three ₹2,000 installments to cover agricultural seeds, fertilizers, and seasonal farming expenses.'
  },
  {
    id: 'pm-awas-yojana-urban',
    code: 'PMAY-U 2.0',
    name: 'Pradhan Mantri Awas Yojana - Urban (Housing for All)',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    category: 'HOUSING',
    targetBeneficiaries: 'Economically Weaker Section (EWS), Lower Income Group (LIG), and Middle Income Group (MIG)',
    maxBenefit: 'Interest subsidy up to ₹1.80 Lakh to ₹2.67 Lakhs on home loans + ₹1.5 Lakh direct grant for construction',
    incomeLimit: 'EWS: Annual household income up to ₹3 Lakhs; LIG: ₹3 to ₹6 Lakhs; MIG: ₹6 to ₹9 Lakhs',
    eligibilityCriteria: [
      'The beneficiary family should not own a pucca (all-weather permanent) house anywhere in India in any member\'s name.',
      'Female ownership or co-ownership of the residential property is mandatory for EWS/LIG categories.',
      'Property must be situated within statutory urban town limits or notified planning areas.'
    ],
    ineligibilityExclusions: [
      'Households that have already availed government housing benefits under Rajiv Awas Yojana or previous PMAY.',
      'Owners of existing concrete residential house.'
    ],
    requiredDocuments: [
      'Aadhaar numbers of all family members',
      'Income Certificate issued by Tehsildar / Form 16 / Salary slips',
      'Affidavit affirming that applicant does not own any pucca house in India',
      'Property title deed / Allotment letter and approved building map'
    ],
    applicationProcess: [
      'Apply online on pmaymis.gov.in under "Citizen Assessment" or at Municipal Corporation / CSC.',
      'Select eligible component: Beneficiary-led Construction (BLC) or Credit Linked Subsidy (CLSS).',
      'Bank processes home loan and claims interest subsidy directly from National Housing Bank (NHB).',
      'Geo-tagging of construction phases via Bhuvan app releases staged installment funds.'
    ],
    officialPortalUrl: 'https://pmaymis.gov.in',
    helplineNumber: '011-23063285 / 1800-11-6163',
    plainLanguageSummary: 'Provides up to ₹2.67 Lakhs government subsidy on home loans or ₹1.5 Lakh direct cash grant to build your first permanent house in urban cities, requiring female co-ownership.'
  },
  {
    id: 'eshram-unorganized-workers',
    code: 'E-SHRAM',
    name: 'E-Shram National Database of Unorganized Workers & Social Security',
    ministry: 'Ministry of Labour and Employment',
    category: 'WORKER_LABOR',
    targetBeneficiaries: 'Gig workers, construction workers, domestic helpers, street vendors, drivers, agricultural laborers',
    maxBenefit: '12-digit Universal Account Number (UAN) + ₹2,00,000 accidental death/permanent disability cover + priority scheme linkages',
    incomeLimit: 'Should not be an income tax payee and should not be covered under EPFO or ESIC',
    eligibilityCriteria: [
      'Age between 16 and 59 years.',
      'Working in the unorganized sector (freelance, delivery rider, construction, agricultural labor, artisan, housemaid).',
      'Not a member of EPFO (Employee Provident Fund) or ESIC (Employee State Insurance).'
    ],
    ineligibilityExclusions: [
      'Formal corporate/government employees with active EPF/ESI contributions.',
      'Income tax payers.'
    ],
    requiredDocuments: [
      'Aadhaar Number with active mobile number for OTP',
      'Bank Account Number with IFSC code',
      'Occupation & Skill details'
    ],
    applicationProcess: [
      'Register free of cost on eshram.gov.in or visit any nearby CSC / Seva Kendra.',
      'Provide basic personal details, address, educational qualification, and primary occupation.',
      'Download the laminated e-Shram UAN Card with photo and QR code instantly.',
      'UAN automatically maps you to central welfare funds, state accident relief, and skill certifications.'
    ],
    officialPortalUrl: 'https://eshram.gov.in',
    helplineNumber: '14434 (Toll Free)',
    plainLanguageSummary: 'Official national identity card for gig, construction, and informal workers giving free ₹2 Lakh accident insurance cover and automatic access to state labor welfare benefits.'
  },
  {
    id: 'pm-svanidhi-street-vendors',
    code: 'PM-SVANIDHI',
    name: 'PM Street Vendor\'s AtmaNirbhar Nidhi (Micro-Credit Scheme)',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'WORKER_LABOR',
    targetBeneficiaries: 'Street vendors, hawkers, thelawalas, roadside stall operators in urban and peri-urban areas',
    maxBenefit: 'Collateral-free working capital loan: 1st tranche ₹10,000 → 2nd tranche ₹20,000 → 3rd tranche ₹50,000 with 7% interest subsidy',
    incomeLimit: 'Urban street vendor carrying on vending on or before notified cut-off dates',
    eligibilityCriteria: [
      'Possess a Certificate of Vending (CoV) / Identity Card issued by Urban Local Body (ULB) / Town Vending Committee.',
      'Vendors who were left out of survey can apply with Letter of Recommendation (LoR) from Municipal Authority.',
      'Commitment to digital transaction cashback up to ₹1,200 per year.'
    ],
    ineligibilityExclusions: [
      'Vendors operating illegal fixed brick-and-mortar encroached commercial showrooms.'
    ],
    requiredDocuments: [
      'Aadhaar Card and active Mobile Number',
      'Certificate of Vending (CoV) or Letter of Recommendation (LoR) from Ward Councillor / ULB',
      'Bank Account passbook and QR Code for UPI payments'
    ],
    applicationProcess: [
      'Check vending status on pmsvanidhi.mohua.gov.in or through the PM SVANidhi mobile app.',
      'Apply online or via local bank branch / CSC / microfinance institution without any collateral or guarantor.',
      'Receive loan disbursal directly into bank account within 7–10 working days.',
      'Timely repayment unlocks automatic qualification for 2x and 5x higher loan limits with 7% interest rebate.'
    ],
    officialPortalUrl: 'https://pmsvanidhi.mohua.gov.in',
    helplineNumber: '1800-11-1979',
    plainLanguageSummary: 'Provides instant, collateral-free loans starting at ₹10,000 up to ₹50,000 for street vendors and cart operators with 7% government interest subsidy and monthly digital cashback.'
  },
  {
    id: 'sukanya-samriddhi-yojana',
    code: 'SSY',
    name: 'Sukanya Samriddhi Yojana (Beti Bachao Beti Padhao)',
    ministry: 'Ministry of Finance / Department of Posts',
    category: 'WOMEN_CHILD',
    targetBeneficiaries: 'Girl children below 10 years of age (max 2 daughters per family)',
    maxBenefit: 'Highest sovereign guaranteed interest rate (8.2% p.a.) + 100% Tax-free returns under Section 80C + full maturity at age 21',
    incomeLimit: 'No income ceiling; minimum deposit of ₹250 per year up to maximum ₹1,50,000 per financial year',
    eligibilityCriteria: [
      'Account can be opened by biological parents or legal guardians for a girl child aged from birth up to 10 years.',
      'Only one account per girl child, and maximum two accounts per household (three in case of twins/triplets).',
      'Deposits can be made for 15 years from date of opening; account matures when girl child turns 21.'
    ],
    ineligibilityExclusions: [
      'Girl children older than 10 years at time of application.',
      'Non-resident Indian (NRI) citizens.'
    ],
    requiredDocuments: [
      'Birth Certificate of the girl child issued by Municipal Registrar / Hospital',
      'Aadhaar Card and PAN Card of the parent / legal guardian',
      'Address proof (Electricity bill / Passport / Voter ID) and 2 passport photos'
    ],
    applicationProcess: [
      'Collect Form SSA-1 from any India Post Office branch or authorized nationalized/private bank.',
      'Fill in parent and daughter details with initial minimum deposit (₹250 in cash or cheque).',
      'Receive printed SSY Passbook recording interest compounding.',
      'Partial withdrawal up to 50% allowed after girl turns 18 for verified college higher education.'
    ],
    officialPortalUrl: 'https://www.indiapost.gov.in',
    helplineNumber: '1800-266-6868',
    plainLanguageSummary: 'Government-backed savings scheme for daughters under 10 with market-leading 8.2% guaranteed interest and zero tax, helping build a secure fund for her higher education and future.'
  },
  {
    id: 'payment-of-gratuity-act',
    code: 'GRATUITY-1972',
    name: 'Statutory Workplace Gratuity Entitlement (Payment of Gratuity Act, 1972)',
    ministry: 'Ministry of Labour and Employment / Office of Controlling Authority',
    category: 'WORKER_LABOR',
    targetBeneficiaries: 'All private, factory, IT, shop, and establishment employees with 5+ years continuous service',
    maxBenefit: '15 days wages per completed year of service, up to statutory tax-free ceiling of ₹20,00,000',
    incomeLimit: 'Applicable to every employee irrespective of salary amount or designation',
    eligibilityCriteria: [
      'Establishment with 10 or more persons employed on any day of preceding 12 months.',
      'Continuous service of at least 5 years (rendered as 4 years 240 days in jurisprudence).',
      'Payable on resignation, superannuation, retirement, or upon death/disability (where 5-year rule is waived).'
    ],
    ineligibilityExclusions: [
      'Employees with less than 5 years continuous service (except in case of death or total disablement).',
      'Lawful termination for moral turpitude or willful damage (requires formal recorded enquiry).'
    ],
    requiredDocuments: [
      'Offer Letter, Appointment Letter, and Experience / Relieving Certificate',
      'Last 3 months salary slips showing Basic Pay + Dearness Allowance (DA)',
      'Resignation acceptance email and Bank statement showing non-credit of gratuity',
      'Statutory Form I (Application for Gratuity to Employer)'
    ],
    applicationProcess: [
      'Submit Form I to employer within 30 days of leaving employment.',
      'Employer is statutorily bound under Section 7(3) to pay gratuity within 30 days with 10% compound interest for delay.',
      'Upon refusal or silence, file Form N before the Controlling Authority (Labour Commissioner) under Section 7(4).',
      'Labour Court issues recovery certificate to District Collector as arrears of land revenue.'
    ],
    officialPortalUrl: 'https://clc.gov.in',
    helplineNumber: '1800-180-1551 (National Labour Helpline)',
    plainLanguageSummary: 'If you have worked for 5+ years at any company with 10+ staff, the law guarantees you 15 days pay for every year worked when you resign. Refusal by company attracts 10% penalty interest.'
  },
  {
    id: 'national-social-assistance-nsap',
    code: 'NSAP-IGNOAPS',
    name: 'National Social Assistance Programme (Indira Gandhi Old Age & Widow Pension)',
    ministry: 'Ministry of Rural Development',
    category: 'SENIOR_PENSION',
    targetBeneficiaries: 'Destitute senior citizens (60+ years) and widows living below poverty line',
    maxBenefit: 'Monthly cash pension of ₹1,000 to ₹3,000 per month (combined Central + State top-up)',
    incomeLimit: 'Applicant must belong to a BPL household as per state poverty guidelines',
    eligibilityCriteria: [
      'Age 60 years or above for Old Age Pension (IGNOAPS).',
      'Widows aged 40–59 years living below poverty line (IGNWPS).',
      'Severely disabled persons (80%+ disability) aged 18+ (IGNDPS).'
    ],
    ineligibilityExclusions: [
      'Recipients of regular government/corporate retirement pensions.',
      'Individuals residing with adult sons in high-income non-BPL brackets.'
    ],
    requiredDocuments: [
      'Aadhaar Card and Age Proof (Voter ID / Birth Certificate / Medical Board Certificate)',
      'BPL Card / Antyodaya Ration Card / Income Certificate',
      'Death Certificate of Husband (for Widow Pension applicants)',
      'Bank / Post Office single savings account passbook'
    ],
    applicationProcess: [
      'Submit physical application to Gram Panchayat / Block Development Officer (BDO) or Urban Municipality.',
      'Apply online on nsap.nic.in / State Social Welfare Department portal.',
      'Verification conducted by Village Revenue Officer (Patwari / Lekhpal) within 21 days.',
      'Direct monthly pension credit transferred via DBT into bank/post office account on 1st of every month.'
    ],
    officialPortalUrl: 'https://nsap.nic.in',
    helplineNumber: '1800-111-555',
    plainLanguageSummary: 'Guaranteed monthly cash pension for BPL senior citizens aged 60+ and widows with no family support, deposited directly into their bank accounts every month.'
  }
];
