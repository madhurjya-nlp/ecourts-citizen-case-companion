(() => {
  const languages = { en: "English", as: "অসমীয়া", hi: "हिन्दी" };
  const rtlLanguages = [];
  const faqIds = [
    "portal-cnr",
    "portal-no-cnr",
    "portal-status",
    "portal-cause-list",
    "portal-orders",
    "portal-saved",
    "portal-language",
    "court-structure",
    "court-case-types",
    "court-notice",
    "court-hearing",
    "court-order",
    "legal-aid",
    "constitution-equality",
    "constitution-remedies",
  ];
  const templateIds = [
    "legalAid",
    "demand",
    "settlement",
    "chronology",
    "evidence",
    "service",
    "nda",
  ];
  const glossaryIds = ["cnr", "interim", "objections", "attendance", "filing"];
  const keyed = (ids, values) =>
    Object.fromEntries(ids.map((id, index) => [id, values[index]]));
  const field = (name, label, type, placeholder, required = true) => ({
    name,
    label,
    type,
    placeholder,
    required,
  });
  const getPath = (object, path) =>
    path.split(".").reduce((value, key) => value && value[key], object);
  const interpolate = (value, values = {}) =>
    value.replace(/\{(\w+)\}/gu, (_, key) => String(values[key] ?? `{${key}}`));
  const createResolver = (sourcePacks) =>
    (() => {
      const english = sourcePacks.en;
      return (code, path, values = {}) => {
        const selected = sourcePacks[code] || english;
        const localized = getPath(selected, path);
        const fallback = getPath(english, path);
        const value = typeof localized === "string" ? localized : fallback;
        if (typeof value !== "string")
          throw new Error(`Missing locale key: ${path}`);
        return interpolate(value, values);
      };
    })();
  const isRequiredField = (fieldDefinition) =>
    fieldDefinition?.required === true;
  function make(c) {
    return {
      shared: {
        brand: c.brand,
        nav: c.nav,
        actions: c.actions,
        accessibility: c.accessibility,
        languageDialog: c.languageDialog,
        mobileMenu: c.mobileMenu,
        footer: c.footer,
        prototype: c.prototype,
        validation: c.validation,
        toasts: c.toasts,
        signup: c.signup,
        otp: c.otp,
        workspace: c.workspace,
        documentModal: c.documentModal,
        externalLink: c.externalLink,
        glossary: c.sharedGlossary,
      },
      home: c.home,
      finder: c.finder,
      courts: c.courts,
      documents: { ...c.documents, templates: keyed(templateIds, c.templates) },
      help: { ...c.help, faqs: keyed(faqIds, c.faqs) },
      case: c.case,
      glossary: keyed(glossaryIds, c.glossary),
    };
  }
  const templateFields = {
    en: {
      legalAid: [
        field("name", "Applicant name", "text", "Full name"),
        field(
          "address",
          "Residential address",
          "textarea",
          "Current postal address",
        ),
        field("contact", "Mobile or email", "text", "Contact detail"),
        field(
          "case",
          "Case or legal issue",
          "textarea",
          "Briefly describe the matter",
        ),
        field(
          "reason",
          "Why legal aid is needed",
          "textarea",
          "What help do you need?",
        ),
        field(
          "eligibility",
          "Eligibility information",
          "textarea",
          "Income or eligible category, if known",
          false,
        ),
      ],
      demand: [
        field(
          "sender",
          "Sender name and address",
          "textarea",
          "Your name and address",
        ),
        field(
          "recipient",
          "Recipient name and address",
          "textarea",
          "Recipient details",
        ),
        field("amount", "Amount due", "text", "Example: INR 25,000"),
        field(
          "reason",
          "Reason for payment",
          "textarea",
          "Invoice, loan, goods or services",
        ),
        field("due", "Requested payment date", "date", "Select a date"),
        field(
          "method",
          "Preferred payment method",
          "text",
          "Bank transfer, cheque or another method",
          false,
        ),
      ],
      settlement: [
        field("from", "Your name", "text", "Name"),
        field("to", "Other party", "text", "Name of the other party"),
        field(
          "dispute",
          "Dispute summary",
          "textarea",
          "What is the disagreement?",
        ),
        field(
          "offer",
          "Proposed terms",
          "textarea",
          "What would resolve the matter?",
        ),
        field("deadline", "Response date", "date", "Select a date"),
        field(
          "contact",
          "Reply contact",
          "text",
          "Email, mobile or postal address",
        ),
      ],
      chronology: [
        field("matter", "Matter title", "text", "Short title"),
        field(
          "parties",
          "People or organisations involved",
          "textarea",
          "List the parties",
        ),
        field(
          "events",
          "Dated events",
          "textarea",
          "One event per line: DD/MM/YYYY - what happened",
        ),
        field("next", "Known next date or deadline", "text", "If known", false),
      ],
      evidence: [
        field("matter", "Matter title", "text", "Short title"),
        field("owner", "Prepared by", "text", "Name"),
        field(
          "items",
          "Documents or evidence",
          "textarea",
          "One per line: date - document - source",
        ),
        field(
          "notes",
          "Missing items or verification notes",
          "textarea",
          "Optional notes",
          false,
        ),
      ],
      service: [
        field("provider", "Service provider", "text", "Full legal name"),
        field("client", "Client", "text", "Full legal name"),
        field(
          "services",
          "Services",
          "textarea",
          "Describe the work and deliverables",
        ),
        field(
          "fee",
          "Fee and payment schedule",
          "textarea",
          "Amount, due dates and taxes",
        ),
        field(
          "term",
          "Start, end and timeline",
          "textarea",
          "Dates and milestones",
        ),
        field(
          "termination",
          "Ending the agreement",
          "textarea",
          "Notice and unfinished work",
        ),
      ],
      nda: [
        field("discloser", "Disclosing party", "text", "Full legal name"),
        field("recipient", "Receiving party", "text", "Full legal name"),
        field(
          "purpose",
          "Permitted purpose",
          "textarea",
          "Why information is being shared",
        ),
        field(
          "information",
          "Confidential information",
          "textarea",
          "Describe the covered information",
        ),
        field("duration", "Confidentiality period", "text", "Example: 2 years"),
        field(
          "exclusions",
          "Exclusions",
          "textarea",
          "Public, previously known or independently developed information",
          false,
        ),
      ],
    },
    as: {
      legalAid: [
        field("name", "আবেদনকাৰীৰ নাম", "text", "সম্পূৰ্ণ নাম"),
        field("address", "আৱাসিক ঠিকনা", "textarea", "বৰ্তমানৰ ডাক ঠিকনা"),
        field("contact", "মোবাইল বা ইমেইল", "text", "যোগাযোগৰ তথ্য"),
        field("case", "মামলা বা আইনী বিষয়", "textarea", "বিষয়টো চমুকৈ লিখক"),
        field(
          "reason",
          "আইনী সহায় কিয় লাগে",
          "textarea",
          "আপোনাক কি সহায় লাগে?",
        ),
        field(
          "eligibility",
          "যোগ্যতাৰ তথ্য",
          "textarea",
          "জনালে আয় বা যোগ্য শ্ৰেণী",
          false,
        ),
      ],
      demand: [
        field(
          "sender",
          "প্ৰেৰকৰ নাম আৰু ঠিকনা",
          "textarea",
          "আপোনাৰ নাম আৰু ঠিকনা",
        ),
        field("recipient", "প্ৰাপকৰ নাম আৰু ঠিকনা", "textarea", "প্ৰাপকৰ তথ্য"),
        field("amount", "বাকী ধনৰ পৰিমাণ", "text", "উদাহৰণ: INR 25,000"),
        field(
          "reason",
          "ধন পৰিশোধৰ কাৰণ",
          "textarea",
          "চালান, ঋণ, সামগ্ৰী বা সেৱা",
        ),
        field("due", "বিচৰা পৰিশোধৰ তাৰিখ", "date", "এটা তাৰিখ বাছক"),
        field(
          "method",
          "পছন্দৰ পৰিশোধ পদ্ধতি",
          "text",
          "বেংক ট্ৰেন্সফাৰ, চেক বা আন পদ্ধতি",
          false,
        ),
      ],
      settlement: [
        field("from", "আপোনাৰ নাম", "text", "নাম"),
        field("to", "আন পক্ষ", "text", "আন পক্ষৰ নাম"),
        field("dispute", "বিবাদৰ সাৰাংশ", "textarea", "মতভেদটো কি?"),
        field(
          "offer",
          "প্ৰস্তাৱিত চৰ্ত",
          "textarea",
          "কিহে বিষয়টো সমাধান কৰিব?",
        ),
        field("deadline", "উত্তৰৰ তাৰিখ", "date", "এটা তাৰিখ বাছক"),
        field(
          "contact",
          "উত্তৰৰ যোগাযোগ",
          "text",
          "ইমেইল, মোবাইল বা ডাক ঠিকনা",
        ),
      ],
      chronology: [
        field("matter", "বিষয়ৰ শিৰোনাম", "text", "চমু শিৰোনাম"),
        field(
          "parties",
          "জড়িত ব্যক্তি বা সংস্থা",
          "textarea",
          "পক্ষসমূহৰ তালিকা দিয়ক",
        ),
        field(
          "events",
          "তাৰিখযুক্ত ঘটনা",
          "textarea",
          "প্ৰতি শাৰীত এটা: DD/MM/YYYY - কি ঘটিল",
        ),
        field(
          "next",
          "জনা পৰৱৰ্তী তাৰিখ বা সময়সীমা",
          "text",
          "জনালে লিখক",
          false,
        ),
      ],
      evidence: [
        field("matter", "বিষয়ৰ শিৰোনাম", "text", "চমু শিৰোনাম"),
        field("owner", "প্ৰস্তুতকাৰী", "text", "নাম"),
        field(
          "items",
          "নথি বা প্ৰমাণ",
          "textarea",
          "প্ৰতি শাৰীত এটা: তাৰিখ - নথি - উৎস",
        ),
        field(
          "notes",
          "হেৰোৱা বস্তু বা যাচাইৰ টোকা",
          "textarea",
          "ঐচ্ছিক টোকা",
          false,
        ),
      ],
      service: [
        field("provider", "সেৱা প্ৰদানকাৰী", "text", "সম্পূৰ্ণ আইনী নাম"),
        field("client", "গ্ৰাহক", "text", "সম্পূৰ্ণ আইনী নাম"),
        field(
          "services",
          "সেৱাসমূহ",
          "textarea",
          "কাম আৰু প্ৰদানযোগ্য ফল লিখক",
        ),
        field(
          "fee",
          "মাচুল আৰু পৰিশোধৰ সময়সূচী",
          "textarea",
          "পৰিমাণ, নিৰ্ধাৰিত তাৰিখ আৰু কৰ",
        ),
        field(
          "term",
          "আৰম্ভ, শেষ আৰু সময়ৰেখা",
          "textarea",
          "তাৰিখ আৰু মাইলফলক",
        ),
        field(
          "termination",
          "চুক্তি সমাপ্ত কৰা",
          "textarea",
          "জাননী আৰু অসম্পূৰ্ণ কাম",
        ),
      ],
      nda: [
        field("discloser", "তথ্য প্ৰকাশকাৰী পক্ষ", "text", "সম্পূৰ্ণ আইনী নাম"),
        field("recipient", "তথ্য গ্ৰহণকাৰী পক্ষ", "text", "সম্পূৰ্ণ আইনী নাম"),
        field(
          "purpose",
          "অনুমোদিত উদ্দেশ্য",
          "textarea",
          "তথ্য কিয় ভাগ কৰা হৈছে",
        ),
        field(
          "information",
          "গোপনীয় তথ্য",
          "textarea",
          "সামৰি লোৱা তথ্য লিখক",
        ),
        field("duration", "গোপনীয়তাৰ সময়সীমা", "text", "উদাহৰণ: ২ বছৰ"),
        field(
          "exclusions",
          "বাদ দিয়া বিষয়",
          "textarea",
          "ৰাজহুৱা, আগতে জনা বা স্বাধীনভাৱে বিকশিত তথ্য",
          false,
        ),
      ],
    },
    hi: {
      legalAid: [
        field("name", "आवेदक का नाम", "text", "पूरा नाम"),
        field("address", "आवासीय पता", "textarea", "वर्तमान डाक पता"),
        field("contact", "मोबाइल या ईमेल", "text", "संपर्क विवरण"),
        field(
          "case",
          "मामला या कानूनी विषय",
          "textarea",
          "विषय संक्षेप में बताएँ",
        ),
        field(
          "reason",
          "कानूनी सहायता क्यों चाहिए",
          "textarea",
          "आपको किस सहायता की ज़रूरत है?",
        ),
        field(
          "eligibility",
          "पात्रता की जानकारी",
          "textarea",
          "यदि ज्ञात हो तो आय या पात्र श्रेणी",
          false,
        ),
      ],
      demand: [
        field("sender", "प्रेषक का नाम और पता", "textarea", "आपका नाम और पता"),
        field(
          "recipient",
          "प्राप्तकर्ता का नाम और पता",
          "textarea",
          "प्राप्तकर्ता का विवरण",
        ),
        field("amount", "बकाया राशि", "text", "उदाहरण: INR 25,000"),
        field(
          "reason",
          "भुगतान का कारण",
          "textarea",
          "चालान, ऋण, सामान या सेवाएँ",
        ),
        field("due", "माँगी गई भुगतान तारीख", "date", "तारीख चुनें"),
        field(
          "method",
          "पसंदीदा भुगतान तरीका",
          "text",
          "बैंक हस्तांतरण, चेक या अन्य तरीका",
          false,
        ),
      ],
      settlement: [
        field("from", "आपका नाम", "text", "नाम"),
        field("to", "दूसरा पक्ष", "text", "दूसरे पक्ष का नाम"),
        field("dispute", "विवाद का सार", "textarea", "असहमति क्या है?"),
        field("offer", "प्रस्तावित शर्तें", "textarea", "किससे मामला सुलझेगा?"),
        field("deadline", "उत्तर की तारीख", "date", "तारीख चुनें"),
        field(
          "contact",
          "उत्तर के लिए संपर्क",
          "text",
          "ईमेल, मोबाइल या डाक पता",
        ),
      ],
      chronology: [
        field("matter", "विषय का शीर्षक", "text", "छोटा शीर्षक"),
        field(
          "parties",
          "शामिल व्यक्ति या संगठन",
          "textarea",
          "पक्षकारों की सूची दें",
        ),
        field(
          "events",
          "तारीखवार घटनाएँ",
          "textarea",
          "हर पंक्ति में एक: DD/MM/YYYY - क्या हुआ",
        ),
        field(
          "next",
          "ज्ञात अगली तारीख या समयसीमा",
          "text",
          "यदि ज्ञात हो",
          false,
        ),
      ],
      evidence: [
        field("matter", "विषय का शीर्षक", "text", "छोटा शीर्षक"),
        field("owner", "तैयार करने वाला", "text", "नाम"),
        field(
          "items",
          "दस्तावेज़ या साक्ष्य",
          "textarea",
          "हर पंक्ति में एक: तारीख - दस्तावेज़ - स्रोत",
        ),
        field(
          "notes",
          "गुम सामग्री या सत्यापन नोट",
          "textarea",
          "वैकल्पिक नोट",
          false,
        ),
      ],
      service: [
        field("provider", "सेवा प्रदाता", "text", "पूरा कानूनी नाम"),
        field("client", "ग्राहक", "text", "पूरा कानूनी नाम"),
        field(
          "services",
          "सेवाएँ",
          "textarea",
          "काम और सौंपे जाने वाले परिणाम बताएँ",
        ),
        field(
          "fee",
          "शुल्क और भुगतान समय-सारणी",
          "textarea",
          "राशि, नियत तारीखें और कर",
        ),
        field(
          "term",
          "शुरुआत, समाप्ति और समयरेखा",
          "textarea",
          "तारीखें और पड़ाव",
        ),
        field(
          "termination",
          "समझौता समाप्त करना",
          "textarea",
          "नोटिस और अधूरा काम",
        ),
      ],
      nda: [
        field("discloser", "जानकारी देने वाला पक्ष", "text", "पूरा कानूनी नाम"),
        field("recipient", "जानकारी पाने वाला पक्ष", "text", "पूरा कानूनी नाम"),
        field(
          "purpose",
          "अनुमत उद्देश्य",
          "textarea",
          "जानकारी क्यों साझा की जा रही है",
        ),
        field(
          "information",
          "गोपनीय जानकारी",
          "textarea",
          "शामिल जानकारी बताएँ",
        ),
        field("duration", "गोपनीयता अवधि", "text", "उदाहरण: 2 वर्ष"),
        field(
          "exclusions",
          "अपवाद",
          "textarea",
          "सार्वजनिक, पहले से ज्ञात या स्वतंत्र रूप से विकसित जानकारी",
          false,
        ),
      ],
    },
  };
  const commonTemplates = {
    en: [
      [
        "Legal aid application",
        "Public service",
        "Prepare details requested by a Legal Services Authority.",
      ],
      [
        "Payment demand letter",
        "Letter",
        "Request payment and record a reasonable response date.",
      ],
      [
        "Settlement proposal",
        "Letter",
        "Record a proposal for settlement discussion.",
      ],
      [
        "Case chronology",
        "Preparation",
        "Arrange dated events for a legal consultation.",
      ],
      [
        "Evidence index",
        "Preparation",
        "List documents without changing the originals.",
      ],
      [
        "Service agreement",
        "Agreement",
        "Prepare a basic services draft for review.",
      ],
      [
        "Confidentiality agreement",
        "Agreement",
        "Prepare a narrow NDA for a defined purpose.",
      ],
    ],
    as: [
      ["আইনী সহায়ৰ আবেদন", "জনসেৱা", "আইনী সেৱা প্ৰাধিকৰণে বিচৰা তথ্য সাজক।"],
      [
        "ধন পৰিশোধৰ দাবী পত্ৰ",
        "চিঠি",
        "ধন পৰিশোধ বিচাৰি উত্তৰৰ যুক্তিসংগত তাৰিখ লিখক।",
      ],
      ["মীমাংসাৰ প্ৰস্তাৱ", "চিঠি", "মীমাংসা আলোচনাৰ প্ৰস্তাৱ লিখক।"],
      [
        "মামলাৰ কালক্ৰম",
        "প্ৰস্তুতি",
        "আইনী পৰামৰ্শৰ বাবে তাৰিখযুক্ত ঘটনা ক্ৰমত সাজক।",
      ],
      ["প্ৰমাণৰ সূচী", "প্ৰস্তুতি", "মূল নথি নসলোৱাকৈ নথিৰ তালিকা কৰক।"],
      ["সেৱা চুক্তি", "চুক্তি", "পৰ্যালোচনাৰ বাবে মৌলিক সেৱা খচৰা সাজক।"],
      [
        "গোপনীয়তা চুক্তি",
        "চুক্তি",
        "নিৰ্দিষ্ট উদ্দেশ্যৰ বাবে সীমিত NDA সাজক।",
      ],
    ],
    hi: [
      [
        "कानूनी सहायता आवेदन",
        "जन सेवा",
        "कानूनी सेवा प्राधिकरण द्वारा माँगे विवरण तैयार करें।",
      ],
      [
        "भुगतान माँग पत्र",
        "पत्र",
        "भुगतान माँगें और उचित उत्तर तारीख दर्ज करें।",
      ],
      ["समझौता प्रस्ताव", "पत्र", "समझौता चर्चा के लिए प्रस्ताव दर्ज करें।"],
      [
        "मामले का कालक्रम",
        "तैयारी",
        "कानूनी परामर्श के लिए तारीखवार घटनाएँ रखें।",
      ],
      ["साक्ष्य सूची", "तैयारी", "मूल बदले बिना दस्तावेज़ों की सूची बनाएँ।"],
      ["सेवा समझौता", "समझौता", "समीक्षा के लिए बुनियादी सेवा ड्राफ़्ट बनाएँ।"],
      [
        "गोपनीयता समझौता",
        "समझौता",
        "निर्धारित उद्देश्य के लिए सीमित NDA बनाएँ।",
      ],
    ],
  };
  const templatePack = (code) =>
    commonTemplates[code].map(([title, group, summary], index) => ({
      title,
      group,
      summary,
      fields: templateFields[code][templateIds[index]].map((item) => ({
        ...item,
      })),
    }));
  const faqs = {
    en: [
      [
        "What is a CNR and where can I find it?",
        "A CNR is the 16-character Case Number Record assigned to a case. Enter it without spaces or hyphens; it is commonly shown on court papers.",
      ],
      [
        "Can I find a case without a CNR?",
        "Yes. Official services may also search by case number, filing number, party name, advocate, FIR number, case type or Act.",
      ],
      [
        "What appears in case status and history?",
        "The record may show status, hearing dates, parties, advocates, proceedings and orders. If summaries differ, rely on the official record.",
      ],
      [
        "What is a cause list?",
        "A cause list schedules matters for a date. Listings can change, so check the latest official list and case directions.",
      ],
      [
        "How do I view or download an order?",
        "Open case history or orders in the official service, select an available PDF, and verify the court, case number and date.",
      ],
      [
        "Do I need an account, and can I save a case?",
        "The official app says registration is not required and My Cases can save cases on the device. Cases saved here stay on this device.",
      ],
      [
        "Does eCourts support regional languages and accessibility?",
        "The official app provides regional-language and display options. Case records remain in the language in which they were filed or published.",
      ],
      [
        "How are courts organised in India?",
        "The Supreme Court is at the apex, followed by High Courts. District and subordinate courts work under their High Court.",
      ],
      [
        "What is the difference between a civil and criminal case?",
        "Civil proceedings generally concern rights or disputes; criminal proceedings concern alleged offences. The official record determines the applicable path.",
      ],
      [
        "What should I do after receiving a notice or summons?",
        "Read the complete paper and verify the court, case number, names, date and directions. Seek qualified help if rights or deadlines may be affected.",
      ],
      [
        "Does a hearing date always require personal attendance?",
        "Not necessarily. Check the exact order or notice and confirm with the court or your lawyer.",
      ],
      [
        "What is the difference between an order, judgment and appeal?",
        "Their effect depends on the proceeding. Do not calculate an appeal deadline from this FAQ; use the official document and advice.",
      ],
      [
        "Where can I ask for free legal aid?",
        "Eligible people may approach the appropriate Legal Services Authority. Confirm eligibility and available services with that authority.",
      ],
      [
        "What do Articles 14 and 21 broadly protect?",
        "Article 14 concerns equality before law. Article 21 protects life and personal liberty according to procedure established by law.",
      ],
      [
        "What do Articles 22, 32 and 39A broadly address?",
        "They address arrest and detention protections, remedies for Fundamental Rights, and equal justice and free legal aid.",
      ],
    ],
    as: [
      [
        "CNR কি আৰু ইয়াক ক’ত পাম?",
        "CNR হৈছে মামলাৰ বাবে দিয়া ১৬ আখৰৰ Case Number Record। খালী ঠাই বা হাইফেন নোহোৱাকৈ লিখক; সাধাৰণতে আদালতৰ কাগজত থাকে।",
      ],
      [
        "CNR নোহোৱাকৈ মামলা বিচাৰিব পাৰিমনে?",
        "পাৰি। চৰকাৰী সেৱাত মামলা নম্বৰ, দাখিল নম্বৰ, পক্ষৰ নাম, অধিবক্তা, FIR নম্বৰ, মামলাৰ প্ৰকাৰ বা আইনৰেও বিচাৰিব পাৰি।",
      ],
      [
        "মামলাৰ অৱস্থা আৰু ইতিহাসত কি থাকে?",
        "ৰেকৰ্ডত অৱস্থা, শুনানীৰ তাৰিখ, পক্ষ, অধিবক্তা, কাৰ্যবিৱৰণী আৰু আদেশ থাকিব পাৰে। পাৰ্থক্য থাকিলে চৰকাৰী ৰেকৰ্ড মানক।",
      ],
      [
        "কাৰ্যতালিকা কি?",
        "কাৰ্যতালিকাত এটা তাৰিখৰ বিষয়সমূহ থাকে। তালিকা সলনি হ’ব পাৰে, সেয়ে শেহতীয়া চৰকাৰী তালিকা আৰু নিৰ্দেশ চাওক।",
      ],
      [
        "আদেশ কেনেকৈ চাম বা ডাউনলোড কৰিম?",
        "চৰকাৰী সেৱাৰ ইতিহাস বা আদেশ অংশত PDF বাছি আদালত, মামলা নম্বৰ আৰু তাৰিখ মিলাওক।",
      ],
      [
        "একাউণ্ট লাগে নেকি, মামলা সংৰক্ষণ কৰিব পাৰিমনে?",
        "চৰকাৰী এপৰ মতে পঞ্জীয়ন আৱশ্যক নহয় আৰু My Cases-এ ডিভাইচত মামলা ৰাখিব পাৰে। ইয়াত সংৰক্ষিত মামলা এই ডিভাইচতে থাকে।",
      ],
      [
        "eCourts-ত আঞ্চলিক ভাষা আৰু অভিগম্যতা আছেনে?",
        "চৰকাৰী এপত আঞ্চলিক ভাষা আৰু প্ৰদৰ্শন বিকল্প আছে। মামলাৰ ৰেকৰ্ড দাখিল বা প্ৰকাশৰ ভাষাতেই থাকে।",
      ],
      [
        "ভাৰতত আদালতসমূহ কেনেকৈ সংগঠিত?",
        "সৰ্বোচ্চ ন্যায়ালয় শীৰ্ষত, তাৰ পিছত উচ্চ ন্যায়ালয়। জিলা আৰু অধস্তন আদালত উচ্চ ন্যায়ালয়ৰ অধীনত কাম কৰে।",
      ],
      [
        "দেৱানী আৰু ফৌজদাৰী মামলাৰ পাৰ্থক্য কি?",
        "দেৱানী কাৰ্যবিধি অধিকাৰ বা বিবাদ আৰু ফৌজদাৰী কাৰ্যবিধি অভিযোগ কৰা অপৰাধৰ সৈতে জড়িত। চৰকাৰী ৰেকৰ্ডে পথ নিৰ্ধাৰণ কৰে।",
      ],
      [
        "জাননী বা সমন পোৱাৰ পিছত কি কৰিম?",
        "সম্পূৰ্ণ কাগজ পঢ়ি আদালত, মামলা নম্বৰ, নাম, তাৰিখ আৰু নিৰ্দেশ যাচাই কৰক। অধিকাৰ বা সময়সীমাত প্ৰভাৱ পৰিলে যোগ্য সহায় লওক।",
      ],
      [
        "শুনানীৰ তাৰিখ মানেই ব্যক্তিগত উপস্থিতি লাগেনে?",
        "সদায় নহয়। সঠিক আদেশ বা জাননী চাওক আৰু আদালত বা অধিবক্তাৰ সৈতে নিশ্চিত কৰক।",
      ],
      [
        "আদেশ, ৰায় আৰু আপীলৰ পাৰ্থক্য কি?",
        "ইয়াৰ প্ৰভাৱ কাৰ্যবিধিৰ ওপৰত নিৰ্ভৰ কৰে। এই FAQ-ৰ পৰা আপীলৰ সময়সীমা গণনা নকৰিব; চৰকাৰী নথি আৰু পৰামৰ্শ লওক।",
      ],
      [
        "বিনামূলীয়া আইনী সহায় ক’ত বিচাৰিম?",
        "যোগ্য ব্যক্তিয়ে উপযুক্ত আইনী সেৱা প্ৰাধিকৰণৰ ওচৰ চাপিব পাৰে। যোগ্যতা আৰু সেৱা প্ৰাধিকৰণৰ সৈতে নিশ্চিত কৰক।",
      ],
      [
        "অনুচ্ছেদ ১৪ আৰু ২১-এ কি সুৰক্ষা দিয়ে?",
        "অনুচ্ছেদ ১৪ আইনৰ আগত সমতাৰ আৰু অনুচ্ছেদ ২১ আইনগত প্ৰক্ৰিয়া অনুসৰি জীৱন আৰু ব্যক্তিগত স্বাধীনতাৰ বিষয়ে।",
      ],
      [
        "অনুচ্ছেদ ২২, ৩২ আৰু ৩৯A-এ কি আলোচনা কৰে?",
        "এইবোৰে গ্ৰেপ্তাৰ আৰু আটক, মৌলিক অধিকাৰৰ প্ৰতিকাৰ, সম ন্যায় আৰু বিনামূলীয়া আইনী সহায় আলোচনা কৰে।",
      ],
    ],
    hi: [
      [
        "CNR क्या है और इसे कहाँ पा सकता हूँ?",
        "CNR मामले को दिया गया 16-अक्षर का Case Number Record है। इसे बिना खाली स्थान या हाइफ़न के लिखें; यह आम तौर पर अदालत के कागज़ों पर मिलता है।",
      ],
      [
        "क्या CNR के बिना मामला खोज सकता हूँ?",
        "हाँ। आधिकारिक सेवाएँ मामला नंबर, दाखिला नंबर, पक्षकार, अधिवक्ता, FIR नंबर, मामला प्रकार या अधिनियम से भी खोज दे सकती हैं।",
      ],
      [
        "मामला स्थिति और इतिहास में क्या होता है?",
        "रिकॉर्ड में स्थिति, सुनवाई तारीखें, पक्षकार, अधिवक्ता, कार्यवाही और आदेश हो सकते हैं। अंतर होने पर आधिकारिक रिकॉर्ड मानें।",
      ],
      [
        "कॉज़ लिस्ट क्या है?",
        "कॉज़ लिस्ट किसी तारीख के मामलों की समय-सारणी है। सूची बदल सकती है, इसलिए नवीनतम आधिकारिक सूची और निर्देश देखें।",
      ],
      [
        "आदेश कैसे देखें या डाउनलोड करें?",
        "आधिकारिक सेवा के इतिहास या आदेश अनुभाग में PDF चुनें और अदालत, मामला नंबर तथा तारीख मिलाएँ।",
      ],
      [
        "क्या खाता चाहिए, और क्या मामला सहेज सकता हूँ?",
        "आधिकारिक ऐप के अनुसार पंजीकरण ज़रूरी नहीं और My Cases डिवाइस पर मामले सहेज सकता है। यहाँ सहेजे मामले इसी डिवाइस पर रहते हैं।",
      ],
      [
        "क्या eCourts क्षेत्रीय भाषाएँ और सुगम्यता देता है?",
        "आधिकारिक ऐप क्षेत्रीय भाषा और प्रदर्शन विकल्प देता है। मामला रिकॉर्ड दाखिल या प्रकाशित भाषा में रहते हैं।",
      ],
      [
        "भारत में अदालतें कैसे संगठित हैं?",
        "सर्वोच्च न्यायालय शीर्ष पर है, फिर उच्च न्यायालय आते हैं। ज़िला और अधीनस्थ अदालतें अपने उच्च न्यायालय के अधीन काम करती हैं।",
      ],
      [
        "दीवानी और आपराधिक मामले में क्या अंतर है?",
        "दीवानी कार्यवाही अधिकार या विवाद और आपराधिक कार्यवाही कथित अपराध से जुड़ी होती है। आधिकारिक रिकॉर्ड लागू रास्ता तय करता है।",
      ],
      [
        "नोटिस या समन मिलने के बाद क्या करूँ?",
        "पूरा कागज़ पढ़ें और अदालत, मामला नंबर, नाम, तारीख और निर्देश सत्यापित करें। अधिकार या समयसीमा प्रभावित हों तो योग्य सहायता लें।",
      ],
      [
        "क्या सुनवाई की तारीख पर व्यक्तिगत उपस्थिति ज़रूरी है?",
        "ज़रूरी नहीं। सही आदेश या नोटिस देखें और अदालत या वकील से पुष्टि करें।",
      ],
      [
        "आदेश, निर्णय और अपील में क्या अंतर है?",
        "इनका प्रभाव कार्यवाही पर निर्भर करता है। इस FAQ से अपील समयसीमा न निकालें; आधिकारिक दस्तावेज़ और सलाह लें।",
      ],
      [
        "मुफ़्त कानूनी सहायता कहाँ माँग सकता हूँ?",
        "पात्र व्यक्ति उचित कानूनी सेवा प्राधिकरण से संपर्क कर सकते हैं। पात्रता और सेवाओं की पुष्टि उसी प्राधिकरण से करें।",
      ],
      [
        "अनुच्छेद 14 और 21 क्या सुरक्षा देते हैं?",
        "अनुच्छेद 14 कानून के समक्ष समानता और अनुच्छेद 21 विधिक प्रक्रिया के अनुसार जीवन और व्यक्तिगत स्वतंत्रता से जुड़ा है।",
      ],
      [
        "अनुच्छेद 22, 32 और 39A किससे जुड़े हैं?",
        "ये गिरफ्तारी और हिरासत, मौलिक अधिकारों के उपचार, समान न्याय और मुफ़्त कानूनी सहायता से जुड़े हैं।",
      ],
    ],
  };
  const faqTags = {
    en: [
      ["CNR", "Case Number Record", "court paper", "case search"],
      [
        "without CNR",
        "case number",
        "filing number",
        "party name",
        "FIR",
        "advocate",
      ],
      ["case status", "case history", "hearing date", "proceedings", "parties"],
      ["cause list", "daily list", "hearing schedule", "attendance"],
      ["order", "judgment", "PDF", "download", "official document"],
      ["account", "registration", "My Cases", "saved case", "device"],
      ["regional language", "accessibility", "display settings", "translation"],
      [
        "Supreme Court",
        "High Court",
        "District Court",
        "court hierarchy",
        "jurisdiction",
      ],
      ["civil case", "criminal case", "offence", "dispute", "procedure"],
      ["court notice", "summons", "deadline", "appearance", "verify paper"],
      [
        "hearing",
        "attendance",
        "appear in person",
        "court order",
        "cause list",
      ],
      ["order", "judgment", "appeal", "final decision", "appeal deadline"],
      [
        "legal aid",
        "free lawyer",
        "Legal Services Authority",
        "Tele-Law",
        "eligibility",
      ],
      [
        "Constitution",
        "Article 14",
        "Article 21",
        "equality",
        "life",
        "personal liberty",
      ],
      [
        "Constitution",
        "Article 22",
        "Article 32",
        "Article 39A",
        "arrest",
        "detention",
        "Fundamental Rights",
        "free legal aid",
      ],
    ],
    as: [
      ["CNR", "Case Number Record", "আদালতৰ কাগজ", "মামলা সন্ধান"],
      [
        "CNR নোহোৱাকৈ",
        "মামলা নম্বৰ",
        "দাখিল নম্বৰ",
        "পক্ষৰ নাম",
        "FIR",
        "অধিবক্তা",
      ],
      [
        "মামলাৰ অৱস্থা",
        "মামলাৰ ইতিহাস",
        "শুনানীৰ তাৰিখ",
        "কাৰ্যবিৱৰণী",
        "পক্ষ",
      ],
      ["কাৰ্যতালিকা", "দৈনিক তালিকা", "শুনানীৰ সময়সূচী", "উপস্থিতি"],
      ["আদেশ", "ৰায়", "PDF", "ডাউনলোড", "চৰকাৰী নথি"],
      ["একাউণ্ট", "পঞ্জীয়ন", "My Cases", "সংৰক্ষিত মামলা", "ডিভাইচ"],
      ["আঞ্চলিক ভাষা", "অভিগম্যতা", "প্ৰদৰ্শন ছেটিংছ", "অনুবাদ"],
      [
        "সৰ্বোচ্চ ন্যায়ালয়",
        "উচ্চ ন্যায়ালয়",
        "জিলা আদালত",
        "আদালতৰ স্তৰ",
        "অধিকাৰক্ষেত্ৰ",
      ],
      ["দেৱানী মামলা", "ফৌজদাৰী মামলা", "অপৰাধ", "বিবাদ", "কাৰ্যবিধি"],
      ["আদালতৰ জাননী", "সমন", "সময়সীমা", "উপস্থিতি", "কাগজ যাচাই"],
      ["শুনানী", "উপস্থিতি", "ব্যক্তিগত হাজিৰা", "আদালতৰ আদেশ", "কাৰ্যতালিকা"],
      ["আদেশ", "ৰায়", "আপীল", "চূড়ান্ত সিদ্ধান্ত", "আপীলৰ সময়সীমা"],
      [
        "আইনী সহায়",
        "বিনামূলীয়া অধিবক্তা",
        "আইনী সেৱা প্ৰাধিকৰণ",
        "Tele-Law",
        "যোগ্যতা",
      ],
      [
        "সংবিধান",
        "অনুচ্ছেদ ১৪",
        "অনুচ্ছেদ ২১",
        "সমতা",
        "জীৱন",
        "ব্যক্তিগত স্বাধীনতা",
      ],
      [
        "সংবিধান",
        "অনুচ্ছেদ ২২",
        "অনুচ্ছেদ ৩২",
        "অনুচ্ছেদ ৩৯A",
        "গ্ৰেপ্তাৰ",
        "আটক",
        "মৌলিক অধিকাৰ",
        "বিনামূলীয়া আইনী সহায়",
      ],
    ],
    hi: [
      ["CNR", "Case Number Record", "अदालत का कागज़", "मामला खोज"],
      [
        "CNR के बिना",
        "मामला नंबर",
        "दाखिला नंबर",
        "पक्षकार का नाम",
        "FIR",
        "अधिवक्ता",
      ],
      ["मामला स्थिति", "मामला इतिहास", "सुनवाई तारीख", "कार्यवाही", "पक्षकार"],
      ["कॉज़ लिस्ट", "दैनिक सूची", "सुनवाई समय-सारणी", "उपस्थिति"],
      ["आदेश", "निर्णय", "PDF", "डाउनलोड", "आधिकारिक दस्तावेज़"],
      ["खाता", "पंजीकरण", "My Cases", "सहेजा मामला", "डिवाइस"],
      ["क्षेत्रीय भाषा", "सुगम्यता", "प्रदर्शन सेटिंग", "अनुवाद"],
      [
        "सर्वोच्च न्यायालय",
        "उच्च न्यायालय",
        "ज़िला अदालत",
        "अदालत पदानुक्रम",
        "अधिकार क्षेत्र",
      ],
      ["दीवानी मामला", "आपराधिक मामला", "अपराध", "विवाद", "प्रक्रिया"],
      ["अदालत नोटिस", "समन", "समयसीमा", "उपस्थिति", "कागज़ सत्यापन"],
      ["सुनवाई", "उपस्थिति", "व्यक्तिगत हाज़िरी", "अदालत आदेश", "कॉज़ लिस्ट"],
      ["आदेश", "निर्णय", "अपील", "अंतिम निर्णय", "अपील समयसीमा"],
      [
        "कानूनी सहायता",
        "मुफ़्त वकील",
        "कानूनी सेवा प्राधिकरण",
        "Tele-Law",
        "पात्रता",
      ],
      [
        "संविधान",
        "अनुच्छेद 14",
        "अनुच्छेद 21",
        "समानता",
        "जीवन",
        "व्यक्तिगत स्वतंत्रता",
      ],
      [
        "संविधान",
        "अनुच्छेद 22",
        "अनुच्छेद 32",
        "अनुच्छेद 39A",
        "गिरफ्तारी",
        "हिरासत",
        "मौलिक अधिकार",
        "मुफ़्त कानूनी सहायता",
      ],
    ],
  };
  const faqPack = (code) =>
    faqs[code].map(([question, answer], index) => ({
      question,
      answer,
      tags: [...faqTags[code][index]],
    }));
  function content(code) {
    const x = {
        en: {
          brand: { name: "eCourts", descriptor: "Citizen case companion" },
          nav: {
            home: "Home",
            finder: "Find a case",
            courts: "Courts & Services",
            documents: "Documents",
            help: "Help",
            workspace: "My workspace",
          },
          act: [
            "Close",
            "View",
            "Clear",
            "Continue",
            "Download",
            "Save",
            "Back",
            "Reset this demo",
          ],
          notice:
            "Hindi and Assamese screens are translated; some legal wording stays in English.",
          record: "Names and record values are shown as filed.",
          sample: "Example document for this case.",
          footer:
            "Example cases use CNR DEMO010002026. Not connected to eCourts or any government service.",
        },
        as: {
          brand: { name: "eCourts", descriptor: "নাগৰিক মামলা সহায়ক" },
          nav: {
            home: "মূলপৃষ্ঠা",
            finder: "মামলা বিচাৰক",
            courts: "আদালত আৰু সেৱা",
            documents: "নথিপত্ৰ",
            help: "সহায়",
            workspace: "মোৰ কৰ্মক্ষেত্ৰ",
          },
          act: [
            "বন্ধ কৰক",
            "চাওক",
            "মচক",
            "আগবাঢ়ক",
            "ডাউনলোড কৰক",
            "সংৰক্ষণ কৰক",
            "উভতি যাওক",
            "ডেমো পুনৰ আৰম্ভ কৰক",
          ],
          notice:
            "হিন্দী আৰু অসমীয়া পৰ্দা অনুবাদিত; কিছু আইনী শব্দ ইংৰাজীতে থাকে।",
          record: "নাম আৰু ৰেকৰ্ডৰ মান দাখিল কৰা ধৰণেই দেখুওৱা হৈছে।",
          sample: "এই মামলাৰ উদাহৰণ নথি।",
          footer:
            "উদাহৰণ মামলাত CNR DEMO010002026 ব্যৱহাৰ হয়। eCourts বা চৰকাৰী সেৱাৰ সৈতে সংযুক্ত নহয়।",
        },
        hi: {
          brand: { name: "eCourts", descriptor: "नागरिक मामला सहायक" },
          nav: {
            home: "होम",
            finder: "मामला खोजें",
            courts: "अदालतें और सेवाएँ",
            documents: "दस्तावेज़",
            help: "सहायता",
            workspace: "मेरा कार्यस्थान",
          },
          act: [
            "बंद करें",
            "देखें",
            "साफ़ करें",
            "आगे बढ़ें",
            "डाउनलोड करें",
            "सहेजें",
            "वापस",
            "डेमो रीसेट करें",
          ],
          notice:
            "हिन्दी और असमिया स्क्रीन अनूदित हैं; कुछ कानूनी शब्द अंग्रेज़ी में रहते हैं।",
          record: "नाम और रिकॉर्ड मान दाखिल रूप में दिखाए गए हैं।",
          sample: "इस मामले का उदाहरण दस्तावेज़।",
          footer:
            "उदाहरण मामलों में CNR DEMO010002026 है। eCourts या किसी सरकारी सेवा से जुड़ा नहीं है।",
        },
      }[code],
      a = x.act;
    const isEn = code === "en",
      isAs = code === "as";
    const pick = (en, as, hi) => (isEn ? en : isAs ? as : hi);
    return make({
      brand: x.brand,
      nav: x.nav,
      actions: {
        close: a[0],
        view: a[1],
        clear: a[2],
        continue: a[3],
        download: a[4],
        save: a[5],
        back: a[6],
        reset: a[7],
      },
      accessibility: {
        label: pick(
          "Accessibility settings",
          "অভিগম্যতা ছেটিংছ",
          "सुगम्यता सेटिंग",
        ),
        heading: pick("Accessibility", "অভিগম্যতা", "सुगम्यता"),
        deviceNote: pick(
          "These settings apply on this device.",
          "এই ছেটিংছ এই ডিভাইচত প্ৰযোজ্য।",
          "ये सेटिंग इस डिवाइस पर लागू होती हैं।",
        ),
        contrast: pick("Contrast", "কণ্ট্ৰাষ্ট", "कंट्रास्ट"),
        textSize: pick("Text size", "আখৰৰ আকাৰ", "अक्षर का आकार"),
        motion: pick("Motion", "গতি", "गति"),
        standard: pick("Standard", "মানক", "मानक"),
        highContrast: pick(
          "High contrast",
          "উচ্চ কণ্ট্ৰাষ্ট",
          "उच्च कंट्रास्ट",
        ),
        largerText: pick("Larger text", "ডাঙৰ আখৰ", "बड़े अक्षर"),
        reduceMotion: pick("Reduce motion", "গতি কমাওক", "गति कम करें"),
      },
      languageDialog: {
        kicker: pick("Interface language", "ইণ্টাৰফেচৰ ভাষা", "इंटरफ़ेस भाषा"),
        heading: pick(
          "Choose your language",
          "আপোনাৰ ভাষা বাছক",
          "अपनी भाषा चुनें",
        ),
        note: x.record,
      },
      mobileMenu: {
        heading: pick("Navigation menu", "নেভিগেচন মেনু", "नेविगेशन मेनू"),
        open: pick("Open menu", "মেনু খোলক", "मेनू खोलें"),
      },
      footer: { notice: x.footer },
      prototype: {
        translationNotice: x.notice,
        recordValues: x.record,
        synthetic: pick("synthetic", "কৃত্ৰিম", "कृत्रिम"),
        sampleDisclosure: x.sample,
        descriptor: pick(
          "Not an official government service",
          "চৰকাৰী সেৱা নহয়",
          "आधिकारिक सरकारी सेवा नहीं",
        ),
        strip: pick(
          "Not connected to a court or government service",
          "আদালত বা চৰকাৰী সেৱাৰ সৈতে সংযুক্ত নহয়",
          "अदालत या सरकारी सेवा से जुड़ा नहीं है",
        ),
      },
      sharedGlossary: {
        kicker: pick(
          "Plain-language explanation",
          "সহজ ভাষাৰ ব্যাখ্যা",
          "सरल भाषा में व्याख्या",
        ),
        why: pick(
          "Why it matters here",
          "ইয়াত ইয়াৰ গুৰুত্ব কিয়",
          "यह यहाँ क्यों महत्वपूर्ण है",
        ),
      },
      validation: {
        required: pick(
          "Complete required fields.",
          "প্ৰয়োজনীয় ঘৰ পূৰণ কৰক।",
          "ज़रूरी फ़ील्ड भरें।",
        ),
        searchEmpty: pick(
          "Enter a detail to search.",
          "বিচাৰিবলৈ তথ্য দিয়ক।",
          "खोजने के लिए विवरण दें।",
        ),
        searchNone: pick(
          "No case matched.",
          "কোনো মামলা মিল নাখালে।",
          "कोई मामला मेल नहीं खाया।",
        ),
        mobile: pick(
          "Enter a name and 10-digit mobile number.",
          "নাম আৰু ১০ অংকৰ মোবাইল নম্বৰ দিয়ক।",
          "नाम और 10 अंकों का मोबाइल नंबर दें।",
        ),
        otp: pick(
          "Use the displayed simulated OTP.",
          "দেখুওৱা কৃত্ৰিম OTP ব্যৱহাৰ কৰক।",
          "दिखाया कृत्रिम OTP उपयोग करें।",
        ),
      },
      toasts: {
        workspaceSaved: pick(
          "Workspace saved locally.",
          "কৰ্মক্ষেত্ৰ স্থানীয়ভাৱে সংৰক্ষিত হ’ল।",
          "कार्यस्थान स्थानीय रूप से सहेजा गया।",
        ),
        alreadySaved: pick(
          "Workspace is saved on this device.",
          "কৰ্মক্ষেত্ৰ এই ডিভাইচত সংৰক্ষিত।",
          "कार्यस्थान इस डिवाइस पर सहेजा है।",
        ),
        pdfDownloaded: pick(
          "Draft PDF downloaded.",
          "খচৰা PDF ডাউনলোড হ’ল।",
          "ड्राफ़्ट PDF डाउनलोड हुआ।",
        ),
        syntheticPdfDownloaded: pick(
          "PDF downloaded.",
          "PDF ডাউনলোড হ’ল।",
          "PDF डाउनलोड हुआ।",
        ),
        pdfEnglishOnly: pick(
          "PDF export supports English only.",
          "PDF ৰপ্তানি কেৱল ইংৰাজীত।",
          "PDF निर्यात केवल अंग्रेज़ी में है।",
        ),
        reset: pick("Demo reset.", "ডেমো পুনৰ আৰম্ভ হ’ল।", "डेमो रीसेट हुआ।"),
        suggestionsUpdated: pick(
          "Suggested questions updated.",
          "পৰামৰ্শৰ প্ৰশ্ন সলনি হ’ল।",
          "सुझाए प्रश्न अपडेट हुए।",
        ),
      },
      signup: {
        heading: pick(
          "Save this workspace",
          "এই কৰ্মক্ষেত্ৰ সংৰক্ষণ কৰক",
          "यह कार्यस्थान सहेजें",
        ),
        note: pick(
          "Nothing is sent anywhere.",
          "একো বাহিৰলৈ পঠোৱা নহয়।",
          "कुछ भी बाहर नहीं भेजा जाता।",
        ),
        name: pick("Name", "নাম", "नाम"),
        namePlaceholder: pick("Your name", "আপোনাৰ নাম", "आपका नाम"),
        mobile: pick("Mobile number", "মোবাইল নম্বৰ", "मोबाइल नंबर"),
        mobilePlaceholder: pick(
          "10-digit mobile number",
          "১০ অংকৰ মোবাইল নম্বৰ",
          "10 अंकों का मोबाइल नंबर",
        ),
      },
      otp: {
        heading: pick(
          "Confirm your number",
          "নম্বৰ নিশ্চিত কৰক",
          "नंबर पक्का करें",
        ),
        note: pick(
          "Displayed simulated OTP: {otp}.",
          "দেখুওৱা কৃত্ৰিম OTP: {otp}।",
          "दिखाया कृत्रिम OTP: {otp}।",
        ),
        label: "OTP",
        verify: pick(
          "Verify and continue",
          "যাচাই কৰি আগবাঢ়ক",
          "सत्यापित करके आगे बढ़ें",
        ),
      },
      workspace: {
        heading: pick("Make it yours", "নিজৰ মতে সাজক", "इसे अपना बनाएँ"),
        note: pick(
          "Choices stay on this device.",
          "পছন্দ এই ডিভাইচতে থাকে।",
          "विकल्प इसी डिवाइस पर रहते हैं।",
        ),
        language: pick("Language", "ভাষা", "भाषा"),
        textSize: pick("Text size", "আখৰৰ আকাৰ", "अक्षर का आकार"),
        save: pick(
          "Save workspace",
          "কৰ্মক্ষেত্ৰ সংৰক্ষণ কৰক",
          "कार्यस्थान सहेजें",
        ),
      },
      documentModal: {
        kicker: pick("Document", "নথি", "दस्तावेज़"),
        before: pick("Before {court}", "{court}-ৰ সন্মুখত", "{court} के समक्ष"),
        plainLanguage: pick("In plain language", "সহজ ভাষাত", "सरल भाषा में"),
        download: pick(
          "Download PDF",
          "PDF ডাউনলোড কৰক",
          "PDF डाउनलोड करें",
        ),
        boundary: x.sample,
      },
      externalLink: {
        newTab: pick(
          "opens official website in a new tab",
          "চৰকাৰী ৱেবছাইট নতুন টেবত খোলে",
          "आधिकारिक वेबसाइट नई टैब में खुलती है",
        ),
      },
      home: {
        kicker: pick(
          "Citizen services",
          "নাগৰিক সেৱা",
          "नागरिक सेवाएँ",
        ),
        hero: pick(
          "Your court journey, made clearer.",
          "আপোনাৰ আদালত যাত্ৰা, অধিক স্পষ্ট।",
          "आपकी अदालत यात्रा, अब अधिक स्पष्ट।",
        ),
        intro: pick(
          "Find a case, understand a court paper, and prepare for what comes next.",
          "মামলা বিচাৰক, আদালতৰ কাগজ বুজক আৰু পৰৱৰ্তী পদক্ষেপৰ বাবে সাজু হওক।",
          "मामला खोजें, अदालत का कागज़ समझें और अगले कदम की तैयारी करें।",
        ),
        heading: pick(
          "Find your case",
          "আপোনাৰ মামলা বিচাৰক",
          "अपना मामला खोजें",
        ),
        copy: pick(
          "Search with a CNR, case number, party name, or the paper you already have.",
          "CNR, মামলা নম্বৰ, পক্ষৰ নাম বা আপোনাৰ ওচৰত থকা কাগজেৰে সন্ধান কৰক।",
          "CNR, मामला नंबर, पक्षकार का नाम या आपके पास मौजूद कागज़ से खोजें।",
        ),
        actions: {
          find: x.nav.finder,
          create: pick(
            "Create a document",
            "নথি তৈয়াৰ কৰক",
            "दस्तावेज़ बनाएँ",
          ),
        },
        taskHeading: pick("Common tasks", "সাধাৰণ কাম", "सामान्य कार्य"),
        assisted: {
          label: pick(
            "Someone I help",
            "মই সহায় কৰা কোনোবা",
            "जिसकी मैं मदद करता/करती हूँ",
          ),
          copy: pick(
            "Help a parent, family member, or another person search using their case details.",
            "অভিভাৱক, পৰিয়ালৰ সদস্য বা আন কোনো ব্যক্তিক তেওঁলোকৰ মামলাৰ তথ্য ব্যৱহাৰ কৰি বিচাৰিবলৈ সহায় কৰক।",
            "माता-पिता, परिवार के सदस्य या किसी अन्य व्यक्ति को उनके मामले के विवरण से खोजने में मदद करें।",
          ),
        },
        editorialCue: pick(
          "People served by India's courts.",
          "ভাৰতৰ আদালতে সেৱা কৰা নাগৰিক।",
          "भारत की अदालतों से जुड़े लोग।",
        ),
        tasks: [
          {
            label: x.nav.finder,
            description: pick(
              "Search with a CNR, number, name or paper.",
              "CNR, নম্বৰ, নাম বা কাগজেৰে বিচাৰক।",
              "CNR, नंबर, नाम या कागज़ से खोजें।",
            ),
          },
          {
            label: pick(
              "Create a document",
              "নথি তৈয়াৰ কৰক",
              "दस्तावेज़ बनाएँ",
            ),
            description: pick(
              "Prepare an agreement, letter or case note.",
              "চুক্তি, চিঠি বা মামলাৰ টোকা সাজক।",
              "समझौता, पत्र या मामला नोट बनाएँ।",
            ),
          },
          {
            label: pick(
              "Read a court paper",
              "আদালতৰ কাগজ পঢ়ক",
              "अदालत का कागज़ पढ़ें",
            ),
            description: pick(
              "Start from your notice or order.",
              "জাননী বা আদেশৰ পৰা আৰম্ভ কৰক।",
              "नोटिस या आदेश से शुरू करें।",
            ),
          },
          {
            label: pick("Check a hearing", "শুনানী চাওক", "सुनवाई देखें"),
            description: pick(
              "See the next listed date.",
              "পৰৱৰ্তী তাৰিখ চাওক।",
              "अगली सूचीबद्ध तारीख देखें।",
            ),
          },
          {
            label: pick(
              "Get legal help",
              "আইনী সহায় লওক",
              "कानूनी सहायता लें",
            ),
            description: pick(
              "Begin with legal aid and support.",
              "আইনী সহায়ৰ পৰা আৰম্ভ কৰক।",
              "कानूनी सहायता से शुरू करें।",
            ),
          },
        ],
        bands: [
          {
            heading: pick(
              "Start with what you have.",
              "আপোনাৰ ওচৰত যি আছে তাৰ পৰা আৰম্ভ কৰক।",
              "जो आपके पास है उससे शुरू करें।",
            ),
            body: pick(
              "A case detail or court paper is enough to begin.",
              "মামলাৰ তথ্য বা আদালতৰ কাগজেৰে আৰম্ভ কৰিব পাৰি।",
              "मामले का विवरण या अदालत का कागज़ शुरुआत के लिए पर्याप्त है।",
            ),
          },
          {
            heading: pick(
              "Official record stays separate.",
              "চৰকাৰী ৰেকৰ্ড পৃথক থাকে।",
              "आधिकारिक रिकॉर्ड अलग रहता है।",
            ),
            body: pick(
              "Record, explanation and verification stay separate.",
              "ৰেকৰ্ড, ব্যাখ্যা আৰু যাচাই পৃথক থাকে।",
              "रिकॉर्ड, व्याख्या और सत्यापन अलग रहते हैं।",
            ),
          },
        ],
        editorialAlt: pick(
          "Monochrome editorial montage of citizens",
          "নাগৰিকৰ একৰঙী সম্পাদকীয় মণ্টাজ",
          "नागरिकों का श्वेत-श्याम संपादकीय मोंटाज",
        ),
      },
      finder: {
        kicker: pick(
          "Case search",
          "মামলা সন্ধান",
          "मामला खोज",
        ),
        heading: pick(
          "Find a case",
          "মামলা বিচাৰক",
          "मामला खोजें",
        ),
        intro: pick(
          "Search with a CNR, case number, party name, or court paper.",
          "CNR, মামলা নম্বৰ, পক্ষৰ নাম বা আদালতৰ কাগজেৰে সন্ধান কৰক।",
          "CNR, मामला नंबर, पक्षकार के नाम या अदालत के कागज़ से खोजें।",
        ),
        disclosure: pick(
          "Try this search with CNR DEMO010002026.",
          "এই সন্ধান CNR DEMO010002026-ৰে চেষ্টা কৰক।",
          "यह खोज CNR DEMO010002026 से आज़माएँ।",
        ),
        tabsLabel: pick(
          "Search by",
          "এইদৰে সন্ধান কৰক",
          "इससे खोजें",
        ),
        assisted: {
          heading: pick(
            "Helping someone else",
            "আন কাৰোবাক সহায় কৰি আছে",
            "किसी और की मदद कर रहे हैं",
          ),
          body: pick(
            "Search with the case holder's details. This does not create or link a profile and does not imply authorization or representation.",
            "মামলাধাৰীৰ তথ্যৰে সন্ধান কৰক। ইয়াৰ ফলত কোনো প্ৰ'ফাইল সৃষ্টি বা সংযোগ নহয় আৰু অনুমতি বা প্ৰতিনিধিত্ব বুজোৱা নহয়।",
            "मामला धारक के विवरण से खोजें। इससे कोई प्रोफ़ाइल बनती या जुड़ती नहीं है और न ही अनुमति या प्रतिनिधित्व माना जाता है।",
          ),
          exit: pick(
            "Leave assisted use",
            "সহায়ক ব্যৱহাৰৰ পৰা ওলাওক",
            "सहायता मोड छोड़ें",
          ),
        },
        tabs: {
          cnr: "CNR",
          number: pick("Case number", "মামলা নম্বৰ", "मामला नंबर"),
          party: pick("Party name", "পক্ষৰ নাম", "पक्षकार का नाम"),
          paper: pick(
            "Court paper / QR",
            "আদালতৰ কাগজ / QR",
            "अदालत का कागज़ / QR",
          ),
        },
        instructions: {
          cnr: pick(
            "Enter the sample CNR DEMO010002026.",
            "নমুনা CNR DEMO010002026 দিয়ক।",
            "नमूना CNR DEMO010002026 दर्ज करें।",
          ),
          number: pick(
            "Enter the sample case number DEMO-CIV-114-2026.",
            "নমুনা মামলা নম্বৰ DEMO-CIV-114-2026 দিয়ক।",
            "नमूना मामला नंबर DEMO-CIV-114-2026 दर्ज करें।",
          ),
          party: pick(
            "Enter the sample party name Demo Petitioner A.",
            "নমুনা পক্ষৰ নাম Demo Petitioner A দিয়ক।",
            "नमूना पक्षकार का नाम Demo Petitioner A दर्ज करें।",
          ),
          paper: pick(
            "This is a visible sample match. No file is selected, uploaded, or stored.",
            "এইটো দৃশ্যমান নমুনা মিল। কোনো ফাইল বাছনি, আপলোড বা সংৰক্ষণ কৰা নহয়।",
            "यह दिखाया गया नमूना मिलान है। कोई फ़ाइल चुनी, अपलोड या संग्रहीत नहीं होती।",
          ),
        },
        fields: {
          cnr: pick("CNR", "CNR", "CNR"),
          number: pick(
            "Case number",
            "মামলা নম্বৰ",
            "मामला नंबर",
          ),
          party: pick(
            "Party name",
            "পক্ষৰ নাম",
            "पक्षकार का नाम",
          ),
          paper: pick(
            "Court paper / QR",
            "আদালতৰ কাগজ / QR",
            "अदालत का कागज़ / QR",
          ),
        },
        actions: {
          search: pick(
            "Search",
            "সন্ধান কৰক",
            "खोजें",
          ),
          sample: pick(
            "Use example case",
            "উদাহৰণ মামলা ব্যৱহাৰ কৰক",
            "उदाहरण मामला उपयोग करें",
          ),
          paper: pick(
            "Continue with this paper",
            "এই কাগজেৰে আগবাঢ়ক",
            "इस कागज़ से आगे बढ़ें",
          ),
          help: pick(
            "How to search",
            "কেনেকৈ সন্ধান কৰিব",
            "कैसे खोजें",
          ),
          open: pick(
            "Open case",
            "মামলা খোলক",
            "मामला खोलें",
          ),
        },
        paper: {
          title: pick(
            "Court paper",
            "আদালতৰ কাগজ",
            "अदालत का कागज़",
          ),
          preview: pick(
            "Example notice",
            "উদাহৰণ জাননী",
            "उदाहरण नोटिस",
          ),
          uploadNote: pick(
            "No upload takes place.",
            "কোনো আপলোড নহয়।",
            "कोई अपलोड नहीं होता।",
          ),
          caseLabel: pick("Case", "মামলা", "मामला"),
          nextDate: pick("Next date", "পৰৱৰ্তী তাৰিখ", "अगली तारीख"),
        },
        result: {
          caseType: pick("Case type", "মামলাৰ প্ৰকাৰ", "मामले का प्रकार"),
          caseTypeValue: pick(
            "Civil suit - property documents",
            "দেৱানী মামলা - সম্পত্তিৰ নথি",
            "दीवानी वाद - संपत्ति दस्तावेज़",
          ),
          status: pick("Status", "অৱস্থা", "स्थिति"),
          statusValue: pick(
            "Documents and objections",
            "নথি আৰু আপত্তি",
            "दस्तावेज़ और आपत्तियाँ",
          ),
          statusSample: pick(
            "Documents and objections",
            "নথি আৰু আপত্তি",
            "दस्तावेज़ और आपत्तियाँ",
          ),
          petitionerLawyer: pick(
            "Petitioner representative",
            "আবেদনকাৰীৰ প্ৰতিনিধি",
            "याचिकाकर्ता प्रतिनिधि",
          ),
          respondentLawyer: pick(
            "Respondent representative",
            "প্ৰতিবাদীৰ প্ৰতিনিধি",
            "प्रतिवादी प्रतिनिधि",
          ),
          sampleDate: pick(
            "{date} (sample)",
            "{date} (নমুনা)",
            "{date} (नमूना)",
          ),
        },
        errors: {
          emptyHeading: pick(
            "Enter a detail to search",
            "সন্ধানৰ বাবে তথ্য দিয়ক",
            "खोजने के लिए विवरण दर्ज करें",
          ),
          emptyBody: pick(
            "Enter the example shown above, or choose Use example case.",
            "ওপৰত দিয়া উদাহৰণটো দিয়ক, বা উদাহৰণ মামলা ব্যৱহাৰ কৰক বাছক।",
            "ऊपर दिया उदाहरण दर्ज करें या उदाहरण मामला उपयोग करें चुनें।",
          ),
          noneHeading: pick(
            "No case matched",
            "কোনো মামলা মিল নাখালে",
            "कोई मामला मेल नहीं खाया",
          ),
          noneBody: pick(
            "Check the exact sample value above, or show the sample case directly.",
            "ওপৰৰ সঠিক নমুনা মান পৰীক্ষা কৰক, বা নমুনা মামলাটো পোনে পোনে দেখুৱাওক।",
            "ऊपर दिए सटीक नमूना मान की जाँच करें या नमूना मामला सीधे दिखाएँ।",
          ),
        },
        help: {
          heading: pick(
            "Need help searching?",
            "সন্ধানত সহায় লাগে?",
            "खोज में सहायता चाहिए?",
          ),
          body: pick(
            "You can search with a CNR, case number, party name, or court paper. Example CNR: DEMO010002026.",
            "CNR, মামলা নম্বৰ, পক্ষৰ নাম বা আদালতৰ কাগজেৰে সন্ধান কৰিব পাৰে। উদাহৰণ CNR: DEMO010002026।",
            "CNR, मामला नंबर, पक्षकार का नाम या अदालत के कागज़ से खोज सकते हैं। उदाहरण CNR: DEMO010002026।",
          ),
        },
      },
      courts: {
        kicker: pick(
          "Official service directory",
          "চৰকাৰী সেৱা নিৰ্দেশিকা",
          "आधिकारिक सेवा निर्देशिका",
        ),
        heading: pick(
          "Find a court service",
          "আদালত সেৱা বিচাৰক",
          "अदालत सेवा खोजें",
        ),
        intro: pick(
          "Choose District Courts or High Courts. Official sites open in a new tab.",
          "জিলা আদালত বা উচ্চ ন্যায়ালয় বাছক। চৰকাৰী চাইট নতুন টেবত খোলে।",
          "ज़िला न्यायालय या उच्च न्यायालय चुनें। आधिकारिक साइट नई टैब में खुलती है।",
        ),
        tabsLabel: pick(
          "Court level",
          "আদালতৰ স্তৰ",
          "अदालत का स्तर",
        ),
        tabs: {
          district: pick("District Courts", "জিলা আদালত", "ज़िला न्यायालय"),
          high: pick("High Courts", "উচ্চ ন্যায়ালয়", "उच्च न्यायालय"),
        },
        external: pick(
          "Opens in a new tab",
          "নতুন টেবত খোলে",
          "नई टैब में खुलता है",
        ),
        district: {
          chooser: pick(
            "Looking for your own case? Start with District Court Services. Looking for aggregate pendency data? Use NJDG.",
            "নিজৰ মামলা বিচাৰিছেনে? জিলা আদালত সেৱাৰে আৰম্ভ কৰক। সামগ্ৰিক স্থগিত তথ্য লাগেনে? NJDG ব্যৱহাৰ কৰক।",
            "अपना मामला ढूँढ रहे हैं? ज़िला न्यायालय सेवाओं से शुरू करें। समग्र लंबित डेटा चाहिए? NJDG का उपयोग करें।",
          ),
          services: {
            title: pick(
              "District Court Services",
              "জিলা আদালত সেৱা",
              "ज़िला न्यायालय सेवाएँ",
            ),
            purpose: pick(
              "Case status, cause lists, and orders or judgments for District and subordinate courts.",
              "জিলা আৰু অধস্তন আদালতৰ মামলাৰ অৱস্থা, কাৰ্যতালিকা আৰু আদেশ বা ৰায়।",
              "ज़िला और अधीनस्थ न्यायालयों के लिए मामला स्थिति, कॉज़ लिस्ट और आदेश या निर्णय।",
            ),
          },
          njdg: {
            title: pick(
              "District Court NJDG",
              "জিলা আদালত NJDG",
              "ज़िला न्यायालय NJDG",
            ),
            purpose: pick(
              "Aggregate judicial data and pendency monitoring. This is not an individual case-filing service.",
              "সামগ্ৰিক ন্যায়িক তথ্য আৰু স্থগিত নিৰীক্ষণ। ই ব্যক্তিগত মামলা দাখিলৰ সেৱা নহয়।",
              "समग्र न्यायिक डेटा और लंबित मामलों की निगरानी। यह व्यक्तिगत मामला दाखिल करने की सेवा नहीं है।",
            ),
          },
          directory: {
            title: pick(
              "District Courts of India",
              "ভাৰতৰ জিলা আদালত",
              "भारत के ज़िला न्यायालय",
            ),
            purpose: pick(
              "Reach State and district court websites from the official eCourts gateway.",
              "চৰকাৰী eCourts দুৱাৰৰ পৰা ৰাজ্য আৰু জিলা আদালতৰ ৱেবছাইটলৈ যাওক।",
              "आधिकारिक eCourts गेटवे से राज्य और ज़िला न्यायालय वेबसाइटों तक पहुँचें।",
            ),
          },
        },
        high: {
          chooser: pick(
            "Looking for a High Court case or order? Start with High Court Services. Looking for aggregate pendency data? Use NJDG.",
            "উচ্চ ন্যায়ালয়ৰ মামলা বা আদেশ বিচাৰিছেনে? উচ্চ ন্যায়ালয় সেৱাৰে আৰম্ভ কৰক। সামগ্ৰিক স্থগিত তথ্য লাগেনে? NJDG ব্যৱহাৰ কৰক।",
            "उच्च न्यायालय का मामला या आदेश ढूँढ रहे हैं? उच्च न्यायालय सेवाओं से शुरू करें। समग्र लंबित डेटा चाहिए? NJDG का उपयोग करें।",
          ),
          services: {
            title: pick(
              "High Court Services",
              "উচ্চ ন্যায়ালয় সেৱা",
              "उच्च न्यायालय सेवाएँ",
            ),
            purpose: pick(
              "Case status, cause lists, caveats, and orders or judgments for High Courts.",
              "উচ্চ ন্যায়ালয়ৰ মামলাৰ অৱস্থা, কাৰ্যতালিকা, কেভিয়েট আৰু আদেশ বা ৰায়।",
              "उच्च न्यायालयों के लिए मामला स्थिति, कॉज़ लिस्ट, कैविएट और आदेश या निर्णय।",
            ),
          },
          njdg: {
            title: pick(
              "High Court NJDG",
              "উচ্চ ন্যায়ালয় NJDG",
              "उच्च न्यायालय NJDG",
            ),
            purpose: pick(
              "Aggregate High Court judicial data and pendency monitoring. This is not an individual case-filing service.",
              "উচ্চ ন্যায়ালয়ৰ সামগ্ৰিক ন্যায়িক তথ্য আৰু স্থগিত নিৰীক্ষণ। ই ব্যক্তিগত মামলা দাখিলৰ সেৱা নহয়।",
              "उच्च न्यायालय का समग्र न्यायिक डेटा और लंबित मामलों की निगरानी। यह व्यक्तिगत मामला दाखिल करने की सेवा नहीं है।",
            ),
          },
          directory: {
            title: pick(
              "High Courts of India",
              "ভাৰতৰ উচ্চ ন্যায়ালয়",
              "भारत के उच्च न्यायालय",
            ),
            purpose: pick(
              "Reach individual High Court websites from the official eCourts gateway.",
              "চৰকাৰী eCourts দুৱাৰৰ পৰা প্ৰত্যেক উচ্চ ন্যায়ালয়ৰ ৱেবছাইটলৈ যাওক।",
              "आधिकारिक eCourts गेटवे से प्रत्येक उच्च न्यायालय वेबसाइट तक पहुँचें।",
            ),
          },
        },
        shared: {
          heading: pick(
            "Judicial institutions and support",
            "ন্যায়িক প্ৰতিষ্ঠান আৰু সহায়",
            "न्यायिक संस्थान और सहायता",
          ),
          gateway: {
            title: pick("eCourts gateway", "eCourts দুৱাৰ", "eCourts गेटवे"),
            purpose: pick(
              "Official eCourts national portal for court services and information.",
              "আদালত সেৱা আৰু তথ্যৰ বাবে চৰকাৰী eCourts ৰাষ্ট্ৰীয় প’ৰ্টেল।",
              "अदालत सेवाओं और जानकारी के लिए आधिकारिक eCourts राष्ट्रीय पोर्टल।",
            ),
          },
          njdg: {
            title: pick(
              "National Judicial Data Grid",
              "ৰাষ্ট্ৰীয় ন্যায়িক তথ্য গ্ৰিড",
              "राष्ट्रीय न्यायिक डेटा ग्रिड",
            ),
            purpose: pick(
              "National Judicial Data Grid (NJDG) publishes aggregate court statistics. It is not a substitute for an individual case record.",
              "ৰাষ্ট্ৰীয় ন্যায়িক তথ্য গ্ৰিড (NJDG) সামগ্ৰিক আদালতৰ পৰিসংখ্যা প্ৰকাশ কৰে। ই ব্যক্তিগত মামলাৰ ৰেকৰ্ডৰ বিকল্প নহয়।",
              "राष्ट्रीय न्यायिक डेटा ग्रिड (NJDG) समग्र अदालत आँकड़े प्रकाशित करता है। यह व्यक्तिगत मामला रिकॉर्ड का विकल्प नहीं है।",
            ),
          },
          ecommittee: {
            title: pick(
              "e-Committee, Supreme Court of India",
              "ই-কমিটি, ভাৰতৰ সৰ্বোচ্চ ন্যায়ালয়",
              "ई-समिति, भारत का सर्वोच्च न्यायालय",
            ),
            purpose: pick(
              "Information about the eCourts programme. The e-Committee is not a case-search service.",
              "eCourts কাৰ্যসূচীৰ তথ্য। ই-কমিটি মামলা সন্ধানৰ সেৱা নহয়।",
              "eCourts कार्यक्रम की जानकारी। ई-समिति मामला खोज सेवा नहीं है।",
            ),
          },
          supreme: {
            title: pick(
              "Supreme Court of India",
              "ভাৰতৰ সৰ্বোচ্চ ন্যায়ালয়",
              "भारत का सर्वोच्च न्यायालय",
            ),
            purpose: pick(
              "Official website of the Supreme Court of India.",
              "ভাৰতৰ সৰ্বোচ্চ ন্যায়ালয়ৰ চৰকাৰী ৱেবছাইট।",
              "भारत के सर्वोच्च न्यायालय की आधिकारिक वेबसाइट।",
            ),
          },
          legalAid: {
            title: pick(
              "Find free legal aid",
              "বিনামূলীয়া আইনী সহায় বিচাৰক",
              "मुफ़्त कानूनी सहायता खोजें",
            ),
            purpose: pick(
              "Department of Justice information on Legal Services Authorities and free legal aid.",
              "আইনী সেৱা প্ৰাধিকৰণ আৰু বিনামূলীয়া আইনী সহায় সম্পৰ্কে ন্যায় বিভাগৰ তথ্য।",
              "कानूनी सेवा प्राधिकरण और मुफ़्त कानूनी सहायता पर न्याय विभाग की जानकारी।",
            ),
          },
          teleLaw: {
            title: pick(
              "Open Tele-Law information",
              "Tele-Law তথ্য খোলক",
              "Tele-Law जानकारी खोलें",
            ),
            purpose: pick(
              "Department of Justice information on the Tele-Law consultation route.",
              "Tele-Law পৰামৰ্শ পথ সম্পৰ্কে ন্যায় বিভাগৰ তথ্য।",
              "Tele-Law परामर्श मार्ग पर न्याय विभाग की जानकारी।",
            ),
          },
        },
      },
      documents: {
        kicker: pick(
          "Document workspace",
          "নথি কৰ্মক্ষেত্ৰ",
          "दस्तावेज़ कार्यस्थान",
        ),
        heading: pick(
          "Create a first draft",
          "প্ৰথম খচৰা তৈয়াৰ কৰক",
          "पहला ड्राफ़्ट बनाएँ",
        ),
        intro: pick(
          "Choose a template, answer what you know, review and download.",
          "আৰ্হি বাছি জনা তথ্য লিখি পৰ্যালোচনা আৰু ডাউনলোড কৰক।",
          "टेम्पलेट चुनें, ज्ञात जानकारी दें, समीक्षा और डाउनलोड करें।",
        ),
        privacy: pick(
          "Draft answers stay in this browser tab.",
          "খচৰাৰ উত্তৰ এই ব্ৰাউজাৰ টেবতে থাকে।",
          "ड्राफ़्ट उत्तर इसी ब्राउज़र टैब में रहते हैं।",
        ),
        templateListLabel: pick(
          "Document templates",
          "নথিৰ আৰ্হি",
          "दस्तावेज़ टेम्पलेट",
        ),
        editable: pick(
          "Editable draft",
          "সম্পাদনাযোগ্য খচৰা",
          "संपादन योग्य ड्राफ़्ट",
        ),
        form: {
          requiredMark: pick("required", "আৱশ্যক", "ज़रूरी"),
          review: pick("Review draft", "খচৰা পৰ্যালোচনা কৰক", "ड्राफ़्ट देखें"),
          download: pick("Download PDF", "PDF ডাউনলোড কৰক", "PDF डाउनलोड करें"),
          clear: a[2],
          beforeUse: pick(
            "Check names, dates and facts before use. This is not legal advice or proof of filing.",
            "ব্যৱহাৰৰ আগতে নাম, তাৰিখ আৰু তথ্য চাওক। ই আইনী পৰামৰ্শ বা দাখিলৰ প্ৰমাণ নহয়।",
            "उपयोग से पहले नाम, तारीख और तथ्य जाँचें। यह कानूनी सलाह या दाखिले का प्रमाण नहीं है।",
          ),
        },
        preview: {
          label: pick(
            "Document preview",
            "নথিৰ পূৰ্বদৰ্শন",
            "दस्तावेज़ पूर्वावलोकन",
          ),
          status: pick(
            "DRAFT - NOT FILED OR SIGNED",
            "খচৰা - দাখিল বা স্বাক্ষৰিত নহয়",
            "ड्राफ़्ट - दाखिल या हस्ताक्षरित नहीं",
          ),
          empty: pick(
            "Complete fields to build the draft.",
            "খচৰা সাজিবলৈ ঘৰ পূৰণ কৰক।",
            "ड्राफ़्ट बनाने के लिए फ़ील्ड भरें।",
          ),
          warning: pick(
            "Review requirements before use.",
            "ব্যৱহাৰৰ আগতে নিয়ম পৰ্যালোচনা কৰক।",
            "उपयोग से पहले नियमों की समीक्षा करें।",
          ),
        },
        pdfBoundary: {
          notice: pick(
            "Generated legal drafts and PDFs remain in English.",
            "তৈয়াৰ হোৱা আইনী খচৰা আৰু PDF কেৱল ইংৰাজীত থাকে।",
            "बनाए गए कानूनी ड्राफ़्ट और PDF केवल अंग्रेज़ी में रहते हैं।",
          ),
        },
        switchConfirm: pick(
          "Switching templates clears the current draft in this tab. Continue?",
          "আৰ্হি সলনি কৰিলে এই টেবৰ বৰ্তমান খচৰা মচি যায়। আগবাঢ়িবনে?",
          "टेम्पलेट बदलने से इस टैब का वर्तमान ड्राफ़्ट साफ़ हो जाएगा। जारी रखें?",
        ),
      },
      templates: templatePack(code),
      help: {
        kicker: pick(
          "Guidance",
          "নিৰ্দেশনা",
          "मार्गदर्शन",
        ),
        heading: pick(
          "Help",
          "সহায়",
          "सहायता",
        ),
        intro: pick(
          "Find portal guidance and general court information.",
          "প’ৰ্টেলৰ নিৰ্দেশনা আৰু সাধাৰণ আদালতৰ তথ্য বিচাৰক।",
          "पोर्टल मार्गदर्शन और सामान्य अदालत जानकारी खोजें।",
        ),
        services: {
          label: pick(
            "Official support services",
            "চৰকাৰী সহায় সেৱা",
            "आधिकारिक सहायता सेवाएँ",
          ),
          legalAid: pick(
            "Find free legal aid",
            "বিনামূলীয়া আইনী সহায় বিচাৰক",
            "मुफ़्त कानूनी सहायता खोजें",
          ),
          teleLaw: pick(
            "Open Tele-Law information",
            "Tele-Law তথ্য খোলক",
            "Tele-Law जानकारी खोलें",
          ),
        },
        search: {
          label: pick("Search Help", "সহায়ত বিচাৰক", "सहायता खोजें"),
          placeholder: pick(
            "Try CNR, hearing, notice or legal aid",
            "CNR, শুনানী, জাননী বা আইনী সহায় লিখক",
            "CNR, सुनवाई, नोटिस या कानूनी सहायता लिखें",
          ),
          count: pick(
            "{count} answers across both information bases",
            "দুয়োটা তথ্যভঁৰালত {count}টা উত্তৰ",
            "दोनों सूचना आधारों में {count} उत्तर",
          ),
        },
        suggestions: {
          heading: pick("Suggested next", "পৰৱৰ্তী পৰামৰ্শ", "अगले सुझाव"),
          privacy: pick(
            "This Help session only. Not saved.",
            "কেৱল এই সহায় অধিৱেশন। সংৰক্ষিত নহয়।",
            "केवल यह सहायता सत्र। सहेजा नहीं जाता।",
          ),
        },
        portal: {
          label: pick(
            "Site and portal FAQ",
            "ছাইট আৰু প’ৰ্টেলৰ প্ৰশ্ন",
            "साइट और पोर्टल प्रश्न",
          ),
          heading: pick(
            "Using eCourts services",
            "eCourts সেৱা ব্যৱহাৰ",
            "eCourts सेवाओं का उपयोग",
          ),
          intro: pick(
            "Search, records, orders and access settings.",
            "সন্ধান, ৰেকৰ্ড, আদেশ আৰু অভিগম্যতা।",
            "खोज, रिकॉर्ड, आदेश और पहुँच सेटिंग।",
          ),
        },
        practical: {
          label: pick(
            "Practical information",
            "ব্যৱহাৰিক তথ্য",
            "व्यावहारिक जानकारी",
          ),
          heading: pick(
            "Courts, cases and the Constitution",
            "আদালত, মামলা আৰু সংবিধান",
            "अदालतें, मामले और संविधान",
          ),
          intro: pick(
            "Court functions, papers, hearings and legal help.",
            "আদালতৰ কাম, কাগজ, শুনানী আৰু আইনী সহায়।",
            "अदालत के कार्य, कागज़, सुनवाई और कानूनी सहायता।",
          ),
        },
        empty: {
          heading: pick(
            "No matching answer",
            "মিল থকা উত্তৰ নাই",
            "कोई मिलता उत्तर नहीं",
          ),
          body: pick(
            "Try a broader search term.",
            "বহল সন্ধান শব্দ চেষ্টা কৰক।",
            "व्यापक खोज शब्द आज़माएँ।",
          ),
          clear: pick("Clear search", "সন্ধান মচক", "खोज साफ़ करें"),
        },
        disclaimer: pick(
          "General information only; not legal advice or an official record.",
          "কেৱল সাধাৰণ তথ্য; আইনী পৰামৰ্শ বা চৰকাৰী ৰেকৰ্ড নহয়।",
          "केवल सामान्य जानकारी; कानूनी सलाह या आधिकारिक रिकॉर्ड नहीं।",
        ),
        translationNotice: x.notice,
      },
      faqs: faqPack(code),
      case: {
        identity: {
          kicker: pick(
            "Case",
            "মামলা",
            "मामला",
          ),
          recordValues: x.record,
        },
        agenda: {
          heading: pick(
            "Hearing agenda",
            "শুনানীৰ কাৰ্যসূচী",
            "सुनवाई कार्यसूची",
          ),
          today: pick("Today", "আজি", "आज"),
          none: pick(
            "No hearing listed",
            "শুনানী তালিকাভুক্ত নাই",
            "कोई सुनवाई सूचीबद्ध नहीं",
          ),
          next: pick("Next hearing", "পৰৱৰ্তী শুনানী", "अगली सुनवाई"),
          status: pick("Status", "অৱস্থা", "स्थिति"),
        },
        record: {
          heading: pick("Read the record", "ৰেকৰ্ড পঢ়ক", "रिकॉर्ड पढ़ें"),
          official: pick(
            "Official record",
            "চৰকাৰী ৰেকৰ্ড",
            "आधिकारिक रिकॉर्ड",
          ),
          meaning: pick("In plain language", "সহজ ভাষাত", "सरल भाषा में"),
          verify: pick("What to verify", "কি যাচাই কৰিব", "क्या सत्यापित करें"),
          officialText: pick(
            "An interim order asks both sides to bring relevant property papers.",
            "অন্তৱৰ্তী আদেশে দুয়ো পক্ষক সম্পত্তিৰ কাগজ আনিবলৈ কৈছে।",
            "अंतरिम आदेश दोनों पक्षों से संपत्ति के कागज़ लाने को कहता है।",
          ),
          meaningText: pick(
            "No final decision has been made.",
            "চূড়ান্ত সিদ্ধান্ত হোৱা নাই।",
            "अंतिम निर्णय नहीं हुआ है।",
          ),
          verifyText: pick(
            "Confirm attendance, filing and the authoritative order.",
            "উপস্থিতি, দাখিল আৰু প্ৰামাণিক আদেশ নিশ্চিত কৰক।",
            "उपस्थिति, दाखिला और प्रामाणिक आदेश पक्का करें।",
          ),
        },
        documents: {
          heading: x.nav.documents,
          view: a[1],
          items: [
            {
              title: pick("Interim order", "অন্তৱৰ্তী আদেশ", "अंतरिम आदेश"),
              detail: pick(
                "Latest order",
                "শেহতীয়া আদেশ",
                "नवीनतम आदेश",
              ),
              meaning: pick(
                "This is a temporary direction about papers. It is not a final decision about the property.",
                "এইটো কাগজ সম্পৰ্কীয় অস্থায়ী নিৰ্দেশ। সম্পত্তিৰ বিষয়ে চূড়ান্ত সিদ্ধান্ত নহয়।",
                "यह कागज़ों के बारे में अस्थायी निर्देश है। संपत्ति पर अंतिम निर्णय नहीं है।",
              ),
            },
            {
              title: pick(
                "Property paper checklist",
                "সম্পত্তিৰ কাগজৰ তালিকা",
                "संपत्ति कागज़ सूची",
              ),
              detail: pick(
                "Preparation guide",
                "প্ৰস্তুতিৰ নিৰ্দেশিকা",
                "तैयारी मार्गदर्शिका",
              ),
              meaning: pick(
                "A preparation list of papers to gather. It is not a court order and does not prove ownership.",
                "গোট কৰিবলগীয়া কাগজৰ প্ৰস্তুতি তালিকা। ই আদালতৰ আদেশ নহয় আৰু মালিকীস্বত্ব প্ৰমাণ নকৰে।",
                "इकट्ठा करने वाले कागज़ों की तैयारी सूची। यह अदालती आदेश नहीं है और स्वामित्व सिद्ध नहीं करता।",
              ),
            },
            {
              title: pick(
                "Case status note",
                "মামলাৰ অৱস্থাৰ টোকা",
                "मामला स्थिति नोट",
              ),
              detail: pick(
                "Status summary",
                "অৱস্থাৰ সাৰাংশ",
                "स्थिति सारांश",
              ),
              meaning: pick(
                "A short summary of the current status. Confirm dates and attendance with the court record.",
                "বৰ্তমান অৱস্থাৰ চমু সাৰাংশ। তাৰিখ আৰু উপস্থিতি আদালতৰ ৰেকৰ্ডৰ সৈতে নিশ্চিত কৰক।",
                "वर्तमान स्थिति का संक्षिप्त सार। तारीख और उपस्थिति अदालत रिकॉर्ड से पक्की करें।",
              ),
            },
          ],
        },
        history: {
          heading: pick("Case history", "মামলাৰ ইতিহাস", "मामले का इतिहास"),
          items: [
            {
              title: pick(
                "Interim order recorded",
                "অন্তৱৰ্তী আদেশ ৰেকৰ্ড কৰা হ’ল",
                "अंतरिम आदेश दर्ज",
              ),
              detail: pick(
                "A document-related next step is shown.",
                "নথি-সম্পৰ্কীয় পৰৱৰ্তী পদক্ষেপ দেখুওৱা হৈছে।",
                "दस्तावेज़ संबंधी अगला कदम दिखाया है।",
              ),
            },
            {
              title: pick(
                "Next hearing listed",
                "পৰৱৰ্তী শুনানী তালিকাভুক্ত",
                "अगली सुनवाई सूचीबद्ध",
              ),
              detail: pick(
                "Prepare papers and objections.",
                "কাগজ আৰু আপত্তি সাজু কৰক।",
                "कागज़ और आपत्तियाँ तैयार करें।",
              ),
            },
            {
              title: pick(
                "Compliance review",
                "অনুপালন পৰ্যালোচনা",
                "अनुपालन समीक्षा",
              ),
              detail: pick(
                "The court may review completed directions.",
                "আদালতে পালন কৰা নিৰ্দেশ চাব পাৰে।",
                "अदालत पूरे निर्देशों की समीक्षा कर सकती है।",
              ),
            },
          ],
        },
        support: {
          heading: pick("Need support?", "সহায় লাগে?", "सहायता चाहिए?"),
          body: pick(
            "Use legal aid or Tele-Law.",
            "আইনী সহায় বা Tele-Law ব্যৱহাৰ কৰক।",
            "कानूनी सहायता या Tele-Law उपयोग करें।",
          ),
          action: pick("Open Help", "সহায় খোলক", "सहायता खोलें"),
          accessible: pick(
            "Open general court and legal-support information",
            "সাধাৰণ আদালত আৰু আইনী সহায়ৰ তথ্য খোলক",
            "सामान्य अदालत और कानूनी सहायता जानकारी खोलें",
          ),
        },
      },
      glossary: (isEn
        ? [
            [
              "CNR",
              "A unique Case Number Record used to identify a case.",
              "Use it to find the exact record.",
              "Explain CNR",
            ],
            [
              "Interim order",
              "A temporary court direction before a final decision.",
              "It may state what to do before the next hearing.",
              "Explain interim order",
            ],
            [
              "Objections",
              "Reasons for disagreeing with a request or document.",
              "The court may ask for these before the next step.",
              "Explain objections",
            ],
            [
              "Attendance",
              "Being present yourself or through an authorised representative.",
              "Confirm requirements from the official record.",
              "Explain attendance",
            ],
            [
              "Filing format",
              "The required way to submit a document.",
              "Check it before submission.",
              "Explain filing format",
            ],
          ]
        : isAs
          ? [
              [
                "CNR",
                "মামলা চিনাক্ত কৰা একক Case Number Record।",
                "সঠিক ৰেকৰ্ড বিচাৰিবলৈ ব্যৱহাৰ কৰক।",
                "CNR বুজাওক",
              ],
              [
                "অন্তৱৰ্তী আদেশ",
                "চূড়ান্ত সিদ্ধান্তৰ আগৰ সাময়িক আদালতী নিৰ্দেশ।",
                "পৰৱৰ্তী শুনানীৰ আগৰ কাম ক’ব পাৰে।",
                "অন্তৱৰ্তী আদেশ বুজাওক",
              ],
              [
                "আপত্তি",
                "অনুৰোধ বা নথিৰ সৈতে অসন্মতিৰ কাৰণ।",
                "আদালতে পৰৱৰ্তী পদক্ষেপৰ আগতে বিচাৰিব পাৰে।",
                "আপত্তি বুজাওক",
              ],
              [
                "উপস্থিতি",
                "নিজে বা অনুমোদিত প্ৰতিনিধিৰে আদালতত থকা।",
                "চৰকাৰী ৰেকৰ্ডৰ পৰা নিয়ম নিশ্চিত কৰক।",
                "উপস্থিতি বুজাওক",
              ],
              [
                "দাখিলৰ পদ্ধতি",
                "নথি জমা দিয়াৰ নিৰ্ধাৰিত ধৰণ।",
                "জমাৰ আগতে পৰীক্ষা কৰক।",
                "দাখিলৰ পদ্ধতি বুজাওক",
              ],
            ]
          : [
              [
                "CNR",
                "मामले की पहचान का विशिष्ट Case Number Record।",
                "सही रिकॉर्ड खोजने के लिए उपयोग करें।",
                "CNR समझाएँ",
              ],
              [
                "अंतरिम आदेश",
                "अंतिम निर्णय से पहले अस्थायी अदालती निर्देश।",
                "यह अगली सुनवाई से पहले का काम बता सकता है।",
                "अंतरिम आदेश समझाएँ",
              ],
              [
                "आपत्तियाँ",
                "अनुरोध या दस्तावेज़ से असहमति के कारण।",
                "अदालत अगले कदम से पहले इन्हें माँग सकती है।",
                "आपत्तियाँ समझाएँ",
              ],
              [
                "उपस्थिति",
                "स्वयं या अधिकृत प्रतिनिधि के माध्यम से अदालत में मौजूद रहना।",
                "आधिकारिक रिकॉर्ड से ज़रूरत पक्की करें।",
                "उपस्थिति समझाएँ",
              ],
              [
                "दाखिला प्रारूप",
                "दस्तावेज़ जमा करने की आवश्यक विधि।",
                "जमा करने से पहले जाँचें।",
                "दाखिला प्रारूप समझाएँ",
              ],
            ]
      ).map(([label, meaning, why, accessibleLabel]) => ({
        label,
        meaning,
        why,
        accessibleLabel,
      })),
    });
  }
  const packs = { en: content("en"), as: content("as"), hi: content("hi") };
  window.ECOURTS_I18N = Object.freeze({
    languages: Object.freeze(languages),
    rtlLanguages: Object.freeze(rtlLanguages),
    packs,
    getPath,
    createResolver,
    resolve: createResolver(packs),
    isRequiredField,
    legacy: Object.freeze({ text: packs, terms: packs.en.glossary }),
  });
})();
