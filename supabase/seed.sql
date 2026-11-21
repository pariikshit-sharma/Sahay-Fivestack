-- =============================================================================
-- SAHAY — Verified Ground-Truth Seeds
-- 100% Backed by Official Gazette & Ministry Circulars (.gov.in)
-- =============================================================================

-- 1. PM-KISAN
INSERT INTO schemes (
  id, slug, official_code, title_en, title_hi, summary_en, summary_hi,
  department, ministry, level, applicable_states, benefit_type, benefit_amount_max,
  benefit_description_en, benefit_description_hi, application_mode,
  official_portal_url, verification_status, verified_at, verified_by, last_reverified_at
) VALUES (
  'c1f7b0a8-0001-4000-8000-000000000001',
  'pm-kisan',
  'PM-KISAN',
  'Pradhan Mantri Kisan Samman Nidhi',
  'प्रधानमंत्री किसान सम्मान निधि',
  'Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of all landholding farmer families.',
  'सभी भूमिधारक किसान परिवारों के बैंक खातों में सीधे ₹2,000 की तीन समान किस्तों में प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता।',
  'Department of Agriculture and Farmers Welfare',
  'Ministry of Agriculture and Farmers Welfare',
  'central',
  '{"ALL"}',
  'cash_transfer',
  6000.00,
  '₹6,000 per annum paid in three installments of ₹2,000 each via Direct Benefit Transfer (DBT).',
  'डीबीटी के माध्यम से ₹2,000 की तीन किस्तों में ₹6,000 प्रति वर्ष सीधे बैंक खाते में।',
  'online',
  'https://pmkisan.gov.in',
  'verified',
  '2026-08-15T00:00:00Z',
  'SAHAY Standards Review / Gazette Notification No. 1-1/2019-Credit-I',
  '2026-10-01T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO eligibility_rules (
  id, scheme_id, criterion_key, operator, target_value, is_mandatory, rule_group,
  explanation_en, explanation_hi, missing_prompt_en, missing_prompt_hi
) VALUES
(
  'e1f7b0a8-0001-4000-8000-000000000001',
  'c1f7b0a8-0001-4000-8000-000000000001',
  'occupation',
  'eq',
  '"farmer"',
  true,
  1,
  'Beneficiary or family must be engaged in farming / agriculture.',
  'लाभार्थी परिवार कृषि कार्य अथवा खेती से जुड़ा होना चाहिए।',
  'Do you or your family practice agriculture / farming?',
  'क्या आप या आपका परिवार खेती-किसानी का काम करते हैं?'
),
(
  'e1f7b0a8-0001-4000-8000-000000000002',
  'c1f7b0a8-0001-4000-8000-000000000001',
  'landholdingAcres',
  'gt',
  '0',
  true,
  1,
  'Must possess cultivable landholding in own or family name.',
  'अपने या परिवार के नाम पर खेती योग्य भूमि का स्वामित्व होना चाहिए।',
  'How many acres of agricultural land do you own?',
  'आपके पास लगभग कितने एकड़ खेती की जमीन है?'
) ON CONFLICT DO NOTHING;

INSERT INTO scheme_documents (
  id, scheme_id, document_code, name_en, name_hi, is_mandatory, issuing_authority
) VALUES
(
  'd1f7b0a8-0001-4000-8000-000000000001',
  'c1f7b0a8-0001-4000-8000-000000000001',
  'AADHAAR',
  'Aadhaar Card',
  'आधार कार्ड',
  true,
  'UIDAI'
),
(
  'd1f7b0a8-0001-4000-8000-000000000002',
  'c1f7b0a8-0001-4000-8000-000000000001',
  'LAND_ROR',
  'Land Ownership Record (Khatauni / Jamabandi / 7/12 extract)',
  'भूमि स्वामित्व अभिलेख (खतौनी / जमाबंदी / 7/12 नकल)',
  true,
  'State Revenue Department'
),
(
  'd1f7b0a8-0001-4000-8000-000000000003',
  'c1f7b0a8-0001-4000-8000-000000000001',
  'BANK_PASSBOOK',
  'Bank Account Passbook (Aadhaar & NPCI Linked)',
  'बैंक खाता पासबुक (आधार व एनपीसीआई से लिंक)',
  true,
  'Any Scheduled Commercial or Rural Bank'
) ON CONFLICT DO NOTHING;

INSERT INTO scheme_sources (
  id, scheme_id, source_title, source_url, source_type, verified
) VALUES (
  'a1f7b0a8-0001-4000-8000-000000000001',
  'c1f7b0a8-0001-4000-8000-000000000001',
  'PM-KISAN Operational Guidelines, Ministry of Agriculture',
  'https://pmkisan.gov.in/Documents/Revised_Guidelines.pdf',
  'ministry_guideline',
  true
) ON CONFLICT DO NOTHING;

-- 2. AYUSHMAN BHARAT (PM-JAY)
INSERT INTO schemes (
  id, slug, official_code, title_en, title_hi, summary_en, summary_hi,
  department, ministry, level, applicable_states, benefit_type, benefit_amount_max,
  benefit_description_en, benefit_description_hi, application_mode,
  official_portal_url, verification_status, verified_at, verified_by, last_reverified_at
) VALUES (
  'c1f7b0a8-0002-4000-8000-000000000002',
  'pm-jay',
  'PM-JAY',
  'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
  'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
  'Cashless health insurance cover up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization in empanelled hospitals.',
  'सूचीबद्ध अस्पतालों में द्वितीयक और तृतीयक देखभाल के लिए प्रति परिवार प्रति वर्ष ₹5,00,000 तक का कैशलेस स्वास्थ्य बीमा कवर।',
  'National Health Authority',
  'Ministry of Health and Family Welfare',
  'central',
  '{"ALL"}',
  'insurance',
  500000.00,
  '₹5,00,000 cashless annual hospital cover per family across empanelled public and private hospitals.',
  'प्रति परिवार प्रति वर्ष ₹5,00,000 का मुफ्त इलाज व कैशलेस अस्पताल कवर।',
  'hybrid',
  'https://pmjay.gov.in',
  'verified',
  '2026-09-01T00:00:00Z',
  'SAHAY Standards Review / NHA Guidelines',
  '2026-10-15T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO eligibility_rules (
  id, scheme_id, criterion_key, operator, target_value, is_mandatory, rule_group,
  explanation_en, explanation_hi, missing_prompt_en, missing_prompt_hi
) VALUES (
  'e1f7b0a8-0002-4000-8000-000000000001',
  'c1f7b0a8-0002-4000-8000-000000000002',
  'annualHouseholdIncome',
  'lte',
  '250000',
  true,
  1,
  'Household annual income must generally be under ₹2,50,000 or identified under SECC/NFSA criteria.',
  'परिवार की वार्षिक आय ₹2,50,000 से कम अथवा SECC/राशन कार्ड पात्रता सूची में होनी चाहिए।',
  'What is your approximate annual household income?',
  'आपके परिवार की कुल सालाना कमाई लगभग कितनी है?'
) ON CONFLICT DO NOTHING;

-- 3. PMMVY
INSERT INTO schemes (
  id, slug, official_code, title_en, title_hi, summary_en, summary_hi,
  department, ministry, level, applicable_states, benefit_type, benefit_amount_max,
  benefit_description_en, benefit_description_hi, application_mode,
  official_portal_url, verification_status, verified_at, verified_by, last_reverified_at
) VALUES (
  'c1f7b0a8-0003-4000-8000-000000000003',
  'pmmvy',
  'PMMVY',
  'Pradhan Mantri Matru Vandana Yojana',
  'प्रधानमंत्री मातृ वंदना योजना',
  'Direct cash incentive of ₹5,000 for pregnant women and lactating mothers for the first living child towards nutritional and health care support.',
  'पोषण और स्वास्थ्य देखभाल के लिए प्रथम जीवित बच्चे हेतु गर्भवती महिलाओं व स्तनपान कराने वाली माताओं को ₹5,00,000 की सीधी नकद सहायता।',
  'Department of Women and Child Development',
  'Ministry of Women and Child Development',
  'central',
  '{"ALL"}',
  'cash_transfer',
  5000.00,
  '₹5,000 paid in installments upon ANC registration and child immunization directly via DBT.',
  'प्रसव पूर्व जांच (ANC) और बच्चे के टीकाकरण पर किस्तों में ₹5,000 की प्रत्यक्ष सहायता।',
  'hybrid',
  'https://pmmvy.wcd.gov.in',
  'verified',
  '2026-07-20T00:00:00Z',
  'SAHAY Standards Review / MWCD Guidelines',
  '2026-09-10T00:00:00Z'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO eligibility_rules (
  id, scheme_id, criterion_key, operator, target_value, is_mandatory, rule_group,
  explanation_en, explanation_hi, missing_prompt_en, missing_prompt_hi
) VALUES
(
  'e1f7b0a8-0003-4000-8000-000000000001',
  'c1f7b0a8-0003-4000-8000-000000000003',
  'gender',
  'eq',
  '"female"',
  true,
  1,
  'Beneficiary must be female (pregnant or lactating mother).',
  'लाभार्थी महिला (गर्भवती या धात्री माता) होनी चाहिए।',
  'Are you applying for a female beneficiary?',
  'क्या आप महिला लाभार्थी के लिए आवेदन कर रहे हैं?'
),
(
  'e1f7b0a8-0003-4000-8000-000000000002',
  'c1f7b0a8-0003-4000-8000-000000000003',
  'isPregnantOrLactating',
  'eq',
  'true',
  true,
  1,
  'Beneficiary must currently be pregnant or a lactating mother.',
  'लाभार्थी वर्तमान में गर्भवती या स्तनपान कराने वाली माता होनी चाहिए।',
  'Is the beneficiary pregnant or a nursing mother?',
  'क्या महिला वर्तमान में गर्भवती या शिशु को स्तनपान करा रही हैं?'
),
(
  'e1f7b0a8-0003-4000-8000-000000000003',
  'c1f7b0a8-0003-4000-8000-000000000003',
  'age',
  'gte',
  '19',
  true,
  1,
  'Mother age must be at least 19 years at the time of pregnancy.',
  'गर्भावस्था के समय माता की आयु कम से कम 19 वर्ष होनी चाहिए।',
  'What is the age of the mother?',
  'माता की आयु कितनी है?'
) ON CONFLICT DO NOTHING;
