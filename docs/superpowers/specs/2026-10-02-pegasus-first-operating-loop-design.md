# Approved Pegasus First Complete Operating Loop Design

Source: Library libfile_cbae594403d08191bf4e8cc72850a354, Pegasus_First_Release_Design_Addendum.docx. Approved in user message Sentinel_987b77feab8481919ea1016e4259f32f and reconfirmed Sentinel_9695ee3e984c81919ba566e01e6772fa. This extracted text travels with the implementation plan; it does not authorize live activation.

<PARSED TEXT FOR PAGE: 1 / 3>

Pegasus DreamScapes • 1
Pegasus First Complete
Operating Loop
Design addendum for review | October 2 2026
This refines the nine-page operating-platform vision into the next useful release. It builds on the 
current website and Pegasus HQ, with one shared identity and one continuous record of the work.
The release recommendation
Collect buyer criteria, review every inquiry, give the work an owner and next action, and move 
real property opportunities through the existing qualification gates.
Apollo should be able to open HQ and immediately know: who needs attention, what they want, what 
happens next, when it is due, and what evidence is missing. When a property warrants further work, 
its source and decisions should travel with it into the same War Room.
Assignment-first becomes a deliberate acquisition preference to test against each property's facts. 
The system compares assignment, double close, and Pegasus execution before commitments. It 
never assumes an exit will be permitted, funded, or successful.
1 A buyer bench that is useful from launch
Use one “Share your buying criteria” experience across the website's buyer and MarketFlow entry 
points. Reuse the existing buyer intake and receipt pipeline. Preserve the three homepage doors; 
keep representation and capital conversations distinct.
Capture a practical buybox:
 Target areas and property types
 Price range, explicitly identifying purchase price or total project budget
 Strategy, renovation tolerance and occupancy exclusions
 Timing and realistic closing window
 Purchasing entity/role and self-reported funding approach
 Contact permission, with deal-alert opt-in kept separate
Do not ask for bank statements or account numbers in the public form. Do not collect protected-class 
preferences. Submitting criteria does not create buyer representation, a verified-buyer designation, 
priority, or a guaranteed match.
In HQ, Apollo reviews the inquiry and deliberately links or creates a private buyer profile attached to 
the existing contact record. The directory serves Acquisitions and Dispositions, showing criteria, 
freshness, review status and a next action. Capacity claims remain “self-reported” until evidence is 
reviewed. Potential duplicate contacts are presented for a human decision.
The first version needs useful search and visible reasons a buyer may fit a property. It does not need 
an automated marketplace or a mysterious match score.

<PARSED TEXT FOR PAGE: 2 / 3>

Pegasus DreamScapes • 2
2 One inquiry queue with real accountability
The existing HQ Intake hub becomes the working review surface. Its views answer four questions: 
what is new, what is waiting, what is due, and what is resolved?
Each open inquiry has a named owner, a specific next action and a due/review date. Apollo is the 
initial operator. Department and lane suggestions help route the work but never substitute for 
accountability.
Selecting a row opens a focused detail panel with the person's/property's context, the working 
decision and the original submission/consent evidence. Classify the actual request: property 
candidate, buyer mandate, representation, vendor, capital, development partner or other relationship.
Buyer, vendor and capital inquiries stay valuable relationship records. They do not become fictional 
property Deals or War Rooms merely to obtain a task. Waiting and archive decisions keep their 
reasons; a correction adds an audited change rather than erasing history.
3 Property inquiries enter the machinery already built
An explicitly reviewed property candidate can create or link one canonical Submission and Seed. 
Missing property facts or consent stay missing until properly resolved. Original payloads and receipts 
remain unchanged.
The existing path remains:
Inquiry → Submission → Seed → human triage → reviewed/released Strategy Snapshot → 
Lane Choice → qualified Opportunity and War Room
Existing owner, next-action and due-date support should be completed in the UI so those details 
survive every handoff. The new bridge must be atomic and safe to retry: duplicate clicks or a lost 
response cannot create another Seed.
Promotion creates a War Room only when the existing qualification gates are met. No new shortcut 
bypasses them. The activity trail links back to its sources without copying private inquiry details into 
public status pages or general activity feeds.
4 Compare three exits inside the same War Room
Reuse HQ's existing Offer Architect, underwriting packages, approvals and Acquisition workspace. 
Make the readiness checks fit the selected path:
 Assignment: contractual rights and consent, continuing obligations, current buyer fit, net 
economics, timing and fallback
 Double close: both transaction legs, title/escrow/lender posture, funding availability, all closing 
costs, timing and fallback
 Pegasus execution: capital, scope, delivery capacity, operating economics, risks and fallback
Every material check has evidence, an owner and a clear state: unknown, needs review, evidenced or
blocked. Unknown never appears green. Do not force assignment reviews to supply irrelevant 
refinance or DSCR numbers just to pass the current underwriting form.
A human selects the preferred exit and requests approval. A changed contract, buyer capacity, 
financing plan or exit must reopen the relevant review. Selection does not automatically send an offer,
distribute the property, create representation, sign an agreement or move funds.

<PARSED TEXT FOR PAGE: 3 / 3>

Pegasus DreamScapes • 3
5 Make the website and HQ feel like one product
Share brand identity, typography, terminology and interaction patterns. Keep the public website clear 
and inviting; make HQ denser and more purposeful.
HQ Today should lead with the actual next obligations, decisions and blockers. An action appears 
once even as its record moves from inquiry to Seed to Opportunity. Every count opens the underlying 
records. Unavailable information is labeled rather than presented as zero.
Queue → detail → Seed → War Room should preserve context and navigation. The War Room keeps
its existing Command, Plan, Money and Record structure. Mobile supports quick review, claim and 
next-action updates; desktop supports deeper evidence work. Keyboard access, clear focus, readable
errors, unsaved-work recovery and repeated-click safety are part of the design.
Peggy can summarize, identify missing information and propose next steps with sources. The human 
remains responsible for decisions and releases.
Delivery gates
1. Approve this written design. Reconcile the intake bridge with the canonical workflow. Correct 
Snapshot release to require Apollo’s Pin, the human-written one-sentence flag of at least 20 
characters, alongside the substantive reviewer note. This is a content requirement, not a security 
PIN. Do not revive old public SLA or paid-product promises
2. Review the implementation plan. Confirm exact changes and tests against the current draft 
branches, then implement in an isolated branch with synthetic data
3. Prove the full loop. Test cross-organization denial, role changes, consent, duplicate retries, stale 
edits, source lineage, buyer classification, relevant exit gates, mobile/keyboard use and safe 
recovery
4. Approve activation separately. Verify actual deployed schema/grants, authentication, audit￾ledger readiness, provider configuration and real notification arrival before any live write or launch 
claim
Success is a polished, trustworthy loop that Apollo can use end to end. Full departmental execution, 
public inventory, buyer accounts, automated marketing, payments and a broader matching engine 
remain later releases.
Source grounding
This design extends HQ draft PR #293 and the existing canonical Seeds, tasks, contacts, approvals 
and War Room implementation. The website review is pinned to PR #28 commit c44bd79; the HQ 
review is pinned to 8d3d41e. Source inspection is not evidence of live activation.
