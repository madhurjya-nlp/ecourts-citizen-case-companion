(() => {
  const SAMPLE_DISCLOSURE =
    "Sample data - hackathon prototype. Not an official court record.";

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFKC")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "");

  const asList = (value) =>
    Array.isArray(value) ? value.filter((entry) => String(entry).trim()) : [];

  const makeRecord = ({
    id,
    cnr,
    caseNo,
    title,
    court,
    type,
    status,
    parties,
    lawyers,
    dates,
    documents,
    timeline,
    aliases,
  }) =>
    Object.freeze({
      id,
      cnr,
      caseNo,
      title,
      court,
      type,
      status,
      parties: Object.freeze([...parties]),
      lawyers: Object.freeze({ ...lawyers }),
      dates: Object.freeze({ ...dates }),
      documents: Object.freeze(documents.map((document) => Object.freeze({ ...document }))),
      timeline: Object.freeze(timeline.map((event) => Object.freeze({ ...event }))),
      aliases: Object.freeze([...aliases]),
      synthetic: true,
      dataLabel: SAMPLE_DISCLOSURE,
    });

  const seededRecords = [
    makeRecord({
      id: "DEMO-CASE-001",
      cnr: "DEMO010002026",
      caseNo: "DEMO-CIV-114-2026",
      title: "Demo Petitioner A v. Demo Respondent B",
      court: "Sample Civil Court",
      type: "Civil suit",
      status: "Documents and objections",
      parties: ["Demo Petitioner A", "Demo Respondent B"],
      lawyers: { petitioner: "Demo Advocate A", respondent: "Demo Advocate B" },
      dates: { filing: "2026-01-10", nextHearing: "2026-09-14" },
      documents: [
        { id: "DEMO-DOC-001", title: "Interim order", kind: "Latest order" },
        { id: "DEMO-DOC-002", title: "Property paper checklist", kind: "Preparation guide" },
      ],
      timeline: [
        { date: "2026-07-18", label: "Interim order recorded" },
        { date: "2026-09-14", label: "Next hearing listed" },
      ],
      aliases: ["Demo Petitioner A", "property paper demo", "demo civil 114"],
    }),
    makeRecord({
      id: "DEMO-CASE-002",
      cnr: "DEMO-CIV-114-B",
      caseNo: "DEMO-CIV-115-2026",
      title: "Demo Petitioner A v. Demo Respondent C",
      court: "Sample Civil Court",
      type: "Civil suit",
      status: "Notice to respondent",
      parties: ["Demo Petitioner A", "Demo Respondent C"],
      lawyers: { petitioner: "Demo Advocate C", respondent: "Demo Advocate D" },
      dates: { filing: "2026-02-12", nextHearing: "2026-10-05" },
      documents: [
        { id: "DEMO-DOC-003", title: "Sample notice", kind: "Court document" },
      ],
      timeline: [
        { date: "2026-02-12", label: "Sample filing received" },
        { date: "2026-10-05", label: "Sample hearing listed" },
      ],
      aliases: ["Demo Petitioner A", "property paper demo", "demo civil 115"],
    }),
  ];

  const generatedRecords = Array.from({ length: 148 }, (_, index) => {
    const number = String(index + 1).padStart(3, "0");
    const year = 2024 + (index % 3);
    const petitioner = `Demo Petitioner ${number}`;
    const respondent = `Demo Respondent ${number}`;
    return makeRecord({
      id: `SYNTH-CASE-${number}`,
      cnr: `DEMO-REPO-${number}`,
      caseNo: `SAMPLE-CIV-${number}-${year}`,
      title: `${petitioner} v. ${respondent}`,
      court: `Sample District Court ${((index % 12) + 1).toString().padStart(2, "0")}`,
      type: index % 2 ? "Consumer matter" : "Civil suit",
      status: index % 3 ? "Sample matter listed" : "Sample matter under review",
      parties: [petitioner, respondent],
      lawyers: {
        petitioner: `Demo Advocate ${number}A`,
        respondent: `Demo Advocate ${number}B`,
      },
      dates: {
        filing: `${year}-02-${String((index % 20) + 1).padStart(2, "0")}`,
        nextHearing: `${year + 1}-08-${String((index % 20) + 1).padStart(2, "0")}`,
      },
      documents: [
        { id: `SYNTH-DOC-${number}-A`, title: "Sample case note", kind: "Prototype document" },
      ],
      timeline: [
        { date: `${year}-02-01`, label: "Sample record created" },
        { date: `${year + 1}-08-01`, label: "Sample next step" },
      ],
      aliases: [petitioner, `sample matter ${number}`],
    });
  });

  const records = Object.freeze([...seededRecords, ...generatedRecords]);

  const findMatches = ({ caseNumber = "", court = "", parties = [] } = {}) => {
    const normalizedCaseNumber = normalize(caseNumber);
    const normalizedCourt = normalize(court);
    const requestedParties = asList(parties).map(normalize).filter(Boolean);

    if (normalizedCaseNumber) {
      const exact = records.filter(
        (record) =>
          normalize(record.cnr) === normalizedCaseNumber ||
          normalize(record.caseNo) === normalizedCaseNumber,
      );
      if (exact.length) {
        const courtMatches = normalizedCourt
          ? exact.filter((record) => normalize(record.court) === normalizedCourt)
          : exact;
        return courtMatches.length
          ? { kind: "exact", records: courtMatches }
          : { kind: "none", records: [] };
      }
    }

    if (!requestedParties.length) return { kind: "none", records: [] };

    const partyCandidates = records.filter((record) => {
      const searchable = [...record.parties, ...record.aliases].map(normalize);
      return requestedParties.every((party) =>
        searchable.some((candidate) => candidate === party || candidate.includes(party)),
      );
    });
    if (!partyCandidates.length) return { kind: "none", records: [] };

    const candidates = normalizedCourt
      ? partyCandidates.filter((record) => normalize(record.court) === normalizedCourt)
      : partyCandidates;
    if (!candidates.length) return { kind: "none", records: [] };
    return candidates.length === 1
      ? { kind: "exact", records: candidates }
      : { kind: "ambiguous", records: candidates };
  };

  window.ECOURTS_CASE_REPOSITORY = Object.freeze({ records, findMatches });
})();
