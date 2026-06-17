/**
 * REVIEWS — Phein Screener Landing Page
 * ======================================
 * To ADD a review: copy the object format below and add a new entry.
 * To REMOVE a review: delete the object.
 *
 * RULES:
 *   - Ratings must be 4, 4.5, or 5 (never below 4).
 *   - Use 4.5 for "good but not perfect" reviews — it renders as a half-filled 5th star.
 *   - NO company names — only work titles.
 *   - Keep reviews realistic. Vary sentence length. A few should mention
 *     specific features (AI Detection Lens, ranking, comparison view).
 *   - NO emojis and NO hyphens in the visible text.
 *   - Distribution target: ~8 Kenyan names, ~2 Canadian names, ~2 UAE names.
 */
window.PHEIN_REVIEWS = [
  // --- Kenyan reviewers (8) ---
  {
    name: "Wanjiru K.",
    title: "HR Manager",
    rating: 5,
    text: "Cut our screening time from three days to two hours. The ranking just works. By the time I shortlist, the candidates are already in the order I would have ranked them manually."
  },
  {
    name: "Kamau O.",
    title: "Talent Acquisition Lead",
    rating: 5,
    text: "We hired for an accounting role with 470 applicants. Phein ranked all of them in under five minutes. The comparison view made the final shortlist meeting painless because everyone could see the gap between candidates at a glance."
  },
  {
    name: "Achieng O.",
    title: "Recruitment Officer",
    rating: 5,
    text: "The AI Detection Lens caught two CVs that were clearly written by ChatGPT. Same candidate, same phrasing, three different jobs. Saved me from a bad shortlist."
  },
  {
    name: "Mwangi D.",
    title: "People Operations Specialist",
    rating: 4.5,
    text: "Solid tool. Took a bit to get used to the toggles for location and age, but once configured it runs smoothly. The sample data was a big help during onboarding. Would have been a five if the export options were a bit more customizable."
  },
  {
    name: "Wairimu N.",
    title: "Hiring Coordinator",
    rating: 5,
    text: "I run screening for three departments. Phein handles all of them in one session. Export to PDF closes the loop for the hiring managers who do not want to log in."
  },
  {
    name: "Njeri W.",
    title: "Senior Recruiter",
    rating: 4.5,
    text: "Honestly skeptical at first. After the first shortlist, I stopped second guessing it. The ranking matches what my senior recruiters would have produced, just faster. Knocking half a star because I wish it remembered my toggle settings between sessions."
  },
  {
    name: "Kiprop T.",
    title: "Talent Sourcer",
    rating: 4,
    text: "The job description parser pulls skills accurately most of the time. I still tweak the list, but it gets me 80 percent of the way there in seconds. Worth the lease."
  },
  {
    name: "Otieno S.",
    title: "HR Business Partner",
    rating: 5,
    text: "Leased for 14 days to cover a bulk hiring push. The fact that it runs as a desktop PWA meant my team could install it once and just open it like a real application."
  },

  // --- Canadian reviewers (2) ---
  {
    name: "Mitchell R.",
    title: "Technical Recruiter",
    rating: 5,
    text: "I screen engineering CVs all day. The skill extraction is sharp. It picks up frameworks and tools I would have missed on a quick skim. Cut my reading time in half."
  },
  {
    name: "Brooke L.",
    title: "Recruitment Manager",
    rating: 4,
    text: "Clean interface, fast ranking, and the comparison modal is the underrated feature. We used it to justify every shortlist decision to leadership. Took the politics out of hiring."
  },

  // --- UAE reviewers (2) ---
  {
    name: "Ahmed A.",
    title: "People and Culture Lead",
    rating: 5,
    text: "We had to screen 1,200 applicants for a regional operations role. Phein processed the whole pile and gave us a ranked shortlist the same afternoon. Genuinely impressive."
  },
  {
    name: "Mariam H.",
    title: "HR Director",
    rating: 4.5,
    text: "The lease model fit us perfectly. We do not hire every month, so paying for software year round made no sense. Two week lease, done. Renewed when the next requisition came in. Half star off because the timer in the header was a little anxious making near the end."
  }
];
