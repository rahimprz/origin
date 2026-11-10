// Origin Books Publishing — product catalogue.
// Source of truth for services, process stages and FAQ, shared by the public
// site, the admin dashboard and the API.

export const VOLUMES = [
  {
    slug: 'writing',
    no: 1,
    name: 'Writing',
    short: 'Writing',
    ink: 'writing',
    line: 'For the idea that needs words: writers who draft with you, in your voice.',
    intro:
      'Bring a voice memo, a folder of notes or a half-finished draft. Our writers interview you, build the structure and draft chapter by chapter, so the finished manuscript still sounds like you.',
    video: 'typewriter',
  },
  {
    slug: 'editorial',
    no: 2,
    name: 'Editorial',
    short: 'Editorial',
    ink: 'editorial',
    line: 'For the draft that needs a second pair of eyes, from big-picture shape to the final comma.',
    intro:
      'Every manuscript needs a different kind of edit. We read yours first, tell you plainly what it needs, then edit at the right depth: structure, line, copy or proof.',
    video: 'keystrike',
  },
  {
    slug: 'design',
    no: 3,
    name: 'Design & Production',
    short: 'Design',
    ink: 'design',
    line: 'For the text that needs to become a book: covers, pages, pictures and sound.',
    intro:
      'Cover, interior, illustration and audio, designed together so the book feels like one piece of work in every edition.',
    video: 'pages',
  },
  {
    slug: 'publishing',
    no: 4,
    name: 'Publishing & Distribution',
    short: 'Publishing',
    ink: 'publishing',
    line: 'For the finished book that needs a release: set up properly, available widely.',
    intro:
      'ISBNs, metadata, files and accounts, handled carefully. We publish on Amazon KDP and set up wider retail, bookstore and library availability so your book is not tied to one store.',
    video: 'library',
  },
  {
    slug: 'marketing',
    no: 5,
    name: 'Marketing & Author Platform',
    short: 'Marketing',
    ink: 'marketing',
    line: 'For the published book that needs readers, and the author who needs a home online.',
    intro:
      'Launch plans, retail pages, review outreach, media, websites and social content, shaped around your book and the readers it was written for.',
    video: 'park',
  },
];

export const SERVICES = [
  // Writing
  { id: 'ghostwriting', vol: 'writing', name: 'Ghostwriting', blurb: 'A professional writer drafts your book from your ideas, interviews and notes.', involves: ['Discovery interviews and a chapter plan', 'Drafting chapter by chapter, with your review at each step', 'Revisions until the voice is unmistakably yours'] },
  { id: 'memoir', vol: 'writing', name: 'Memoir and Autobiography', blurb: 'Your life story, structured with care and told in your own voice.', involves: ['Guided conversations about the moments that matter', 'A timeline and a narrative shape', 'Drafts that keep your way of speaking'] },
  { id: 'biography', vol: 'writing', name: 'Biography Writing', blurb: 'The story of someone else’s life, researched and told with respect.', involves: ['Research, records and interviews', 'A chapter plan built around the life', 'Drafting with a factual review'] },
  { id: 'fiction', vol: 'writing', name: 'Fiction Writing', blurb: 'Plot, character and pacing developed from your premise into a full novel.', involves: ['Premise, characters and world', 'A scene-by-scene outline', 'Drafting with attention to voice and pace'] },
  { id: 'nonfiction', vol: 'writing', name: 'Nonfiction and Business Books', blurb: 'Your expertise organised into a book readers can learn from.', involves: ['The core idea and the reader it serves', 'Structure, examples and research', 'Clear, confident drafting'] },
  { id: 'childrens-writing', vol: 'writing', name: 'Children’s Book Writing', blurb: 'Stories written for the age they are meant for, ready for illustration.', involves: ['Age range and reading level', 'Story, rhythm and page turns', 'A text written with pictures in mind'] },
  { id: 'book-proposal', vol: 'writing', name: 'Book Proposals and Descriptions', blurb: 'The pages that sell the book: proposals, back-cover copy and author bios.', involves: ['Book proposal or pitch document', 'Back-cover and retail descriptions', 'Author bio in several lengths'] },
  // Editorial
  { id: 'manuscript-assessment', vol: 'editorial', name: 'Manuscript Assessment', blurb: 'An honest read of the whole manuscript and a written plan for what comes next.', involves: ['A full read by an editor', 'A report on strengths and what to fix', 'A recommended level of edit'] },
  { id: 'developmental-editing', vol: 'editorial', name: 'Developmental Editing', blurb: 'Big-picture editing of structure, argument, plot and character.', involves: ['Structure and pacing notes', 'Chapter-level guidance', 'A follow-up review of your revision'] },
  { id: 'line-editing', vol: 'editorial', name: 'Line and Copy Editing', blurb: 'Sentence-level editing for clarity, flow, consistency and correctness.', involves: ['Line-by-line edits with tracked changes', 'A style sheet for names, spellings and terms', 'Consistency across the whole book'] },
  { id: 'proofreading', vol: 'editorial', name: 'Proofreading', blurb: 'A careful final check of the laid-out pages before anything is printed.', involves: ['Typos, punctuation and spacing', 'Layout errors and stray lines', 'A clean, approved final proof'] },
  { id: 'beta-reading', vol: 'editorial', name: 'Beta Reader Feedback', blurb: 'Reactions from readers in your genre before the book goes out.', involves: ['Readers chosen for your genre', 'Structured questions about the book', 'A summary of what readers felt'] },
  // Design & production
  { id: 'cover-design', vol: 'design', name: 'Cover Design', blurb: 'An original cover made for your genre, your readers and every format.', involves: ['Genre and shelf research', 'Original cover concepts to choose from', 'Front, spine and back files for print and eBook'] },
  { id: 'interior-design', vol: 'design', name: 'Interior Design and Typesetting', blurb: 'Pages set with care: typefaces, margins, chapter openers and rhythm.', involves: ['A page design for your book', 'Typesetting the full manuscript', 'Images, tables, notes and special pages'] },
  { id: 'ebook-formatting', vol: 'design', name: 'eBook Formatting', blurb: 'Clean reflowable eBooks that read well on every device.', involves: ['EPUB and Kindle files', 'Linked contents, notes and navigation', 'Device testing before release'] },
  { id: 'illustration', vol: 'design', name: 'Illustration', blurb: 'Pictures made for the story, from children’s books to maps and diagrams.', involves: ['Style exploration for your audience', 'Characters, scenes or diagrams', 'Print-ready artwork'] },
  { id: 'audiobook', vol: 'design', name: 'Audiobook Production', blurb: 'An audio edition, from choosing a narrator to finished files.', involves: ['Narrator casting and direction', 'Recording, editing and mastering', 'Files prepared for audio retailers'] },
  { id: 'print-production', vol: 'design', name: 'Print Production and Proofs', blurb: 'Paper, binding and finish chosen well, with printed proofs checked.', involves: ['Trim size, paper and binding advice', 'Print-ready file preparation', 'Printed proof review'] },
  // Publishing & distribution
  { id: 'publishing-plan', vol: 'publishing', name: 'Self-Publishing Setup', blurb: 'A publishing plan for your formats and markets, carried out for you.', involves: ['Formats, markets and pricing options explained', 'Retailer accounts set up in your name', 'A release checklist, completed'] },
  { id: 'amazon-kdp', vol: 'publishing', name: 'Amazon KDP Publishing', blurb: 'Kindle, paperback and hardcover editions set up on Amazon.', involves: ['Files checked against KDP requirements', 'Listing, categories and keywords', 'Proof copies and release'] },
  { id: 'wide-distribution', vol: 'publishing', name: 'IngramSpark and Wide Distribution', blurb: 'Availability beyond Amazon: bookstores, libraries and online retailers.', involves: ['IngramSpark setup', 'Retailer and wholesaler availability', 'Library and bookstore ordering options'] },
  { id: 'isbn-metadata', vol: 'publishing', name: 'ISBN, Barcode and Metadata', blurb: 'The details that let stores, libraries and search engines find your book.', involves: ['ISBNs for each edition', 'Barcode for the back cover', 'Titles, categories and descriptions'] },
  { id: 'ebook-publishing', vol: 'publishing', name: 'eBook Publishing', blurb: 'Your eBook released on the major eBook stores.', involves: ['Kindle and EPUB stores', 'Store listings and previews', 'Validation before release'] },
  { id: 'print-publishing', vol: 'publishing', name: 'Paperback and Hardcover Publishing', blurb: 'Print editions made available to order online and in shops.', involves: ['Paperback and hardcover setup', 'Spine and cover checks', 'Print-on-demand availability'] },
  { id: 'copyright-guidance', vol: 'publishing', name: 'Copyright and Library Registration', blurb: 'Guidance on copyright pages, registration and library records.', involves: ['Copyright page wording', 'Registration guidance for your country', 'Library and legal deposit information'] },
  // Marketing & author platform
  { id: 'launch-plan', vol: 'marketing', name: 'Book Launch Planning', blurb: 'A launch timeline that builds attention before release day and after it.', involves: ['Pre-launch timeline', 'Launch-week activity plan', 'Follow-through after release'] },
  { id: 'retail-optimisation', vol: 'marketing', name: 'Retail Page Optimisation', blurb: 'A book page that helps the right readers find and choose your book.', involves: ['Keywords, categories and description', 'Cover and preview presentation', 'Enhanced content guidance'] },
  { id: 'review-outreach', vol: 'marketing', name: 'Advance Reader and Review Outreach', blurb: 'Early copies sent to genuine readers and reviewers in your genre.', involves: ['Advance reader copies', 'Reviewer and reader outreach', 'Campaign tracking'] },
  { id: 'media-outreach', vol: 'marketing', name: 'Media and Podcast Outreach', blurb: 'Pitches to outlets and shows whose audiences would want your book.', involves: ['Outlet and podcast research', 'Press kit and pitch writing', 'Outreach and follow-up'] },
  { id: 'author-website', vol: 'marketing', name: 'Author Website', blurb: 'A website built around you and your books, easy for you to update.', involves: ['Site plan and page writing', 'Design around your books', 'Launch and a simple handover'] },
  { id: 'social-content', vol: 'marketing', name: 'Social Media Content', blurb: 'Posts and visuals that keep your book in front of readers.', involves: ['Content themes and a calendar', 'Posts and graphics for your book', 'A consistent author voice'] },
  { id: 'newsletter', vol: 'marketing', name: 'Reader Newsletter Setup', blurb: 'A direct line to your readers that you own.', involves: ['Newsletter platform setup', 'Sign-up offer and welcome emails', 'A simple content plan'] },
  { id: 'author-brand', vol: 'marketing', name: 'Author Brand and Positioning', blurb: 'A clear identity that connects you, this book and the next one.', involves: ['Positioning for you and your genre', 'Visual identity direction', 'Bio, photo and voice guidance'] },
];

SERVICES.forEach((s, i) => {
  s.no = i + 1;
});

export const serviceById = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
export const volumeBySlug = Object.fromEntries(VOLUMES.map((v) => [v.slug, v]));
export const servicesIn = (slug) => SERVICES.filter((s) => s.vol === slug);

export const STAGES = [
  { id: 'manuscript', name: 'First draft', line: 'Start with an idea, a box of notes, half a draft or a finished manuscript.' },
  { id: 'editorial', name: 'Editing', line: 'Shape the structure, sharpen the sentences and check every line.' },
  { id: 'design', name: 'Design', line: 'Give the book its cover and the pages it will be read on.' },
  { id: 'publishing', name: 'Publishing', line: 'Prepare each edition and set it up with care on every platform.' },
  { id: 'distribution', name: 'Distribution', line: 'Make the book available to order well beyond one store.' },
  { id: 'readers', name: 'Readers', line: 'Introduce the finished book to the people it was written for.' },
];

export const BOOK_STATES = [
  { id: 'idea', name: 'Just an idea' },
  { id: 'notes', name: 'Notes or outline' },
  { id: 'partial', name: 'Partial draft' },
  { id: 'finished', name: 'Finished manuscript' },
];

export const FORMATS = [
  { id: 'ebook', name: 'eBook' },
  { id: 'paperback', name: 'Paperback' },
  { id: 'hardcover', name: 'Hardcover' },
  { id: 'audiobook', name: 'Audiobook' },
];

export const LEAD_STATUSES = [
  { id: 'new', name: 'New' },
  { id: 'contacted', name: 'Contacted' },
  { id: 'proposal', name: 'Proposal sent' },
  { id: 'won', name: 'Won' },
  { id: 'lost', name: 'Closed' },
];

export const LEAD_SOURCES = [
  { id: 'planner', name: 'Book planner' },
  { id: 'starter', name: 'Hero starter' },
  { id: 'contact', name: 'Contact form' },
  { id: 'offer', name: 'Offer popup' },
];

export const FAQ = [
  { q: 'I only have an idea. Is it too early to get in touch?', a: 'No. Many books start as a conversation. Tell us about the idea and we will explain the options, from ghostwriting to coaching you through your own draft.' },
  { q: 'Can you publish my book on Amazon and beyond?', a: 'Yes. We prepare and set up Kindle, paperback and hardcover editions on Amazon KDP, and can set up wider availability through IngramSpark so bookstores, libraries and other retailers can order your book.' },
  { q: 'Which formats can my book be published in?', a: 'eBook, paperback, hardcover and audiobook. You can start with one and add others later, or release them together.' },
  { q: 'How do I know what kind of editing my manuscript needs?', a: 'Start with a manuscript assessment. An editor reads the whole book and recommends the right level of edit, so you do not pay for more editing than the book needs.' },
  { q: 'I already have an idea for my cover. Can you work with it?', a: 'Yes. Share what you have in mind and our designers will develop it into concepts that also work for your genre, your readers and every format.' },
  { q: 'Do you work with first-time authors?', a: 'Yes. We explain each stage in plain language, tell you what happens next and make sure nothing is decided without you.' },
  { q: 'Can you help after the book is published?', a: 'Yes. Launch planning, retail page improvements, review outreach, media pitching, an author website and social content can all start before or after release.' },
];

export const REASONS = [
  { title: 'Start wherever you are', line: 'An idea, notes, a partial draft or a finished manuscript are all good places to begin.' },
  { title: 'One team, first page to launch', line: 'Writers, editors, designers and publishers who work on the same book together.' },
  { title: 'People who read your book', line: 'Every recommendation comes from someone who has read the manuscript, not a template.' },
  { title: 'Professional standards', line: 'Every edition is prepared for its format, its platform and its readers.' },
  { title: 'More than one shelf', line: 'Your publishing plan can reach bookstores, libraries and retailers beyond Amazon.' },
  { title: 'Always know what’s next', line: 'You see the current stage of your book and what happens after it.' },
];

