/**
 * Rule-based contextual responses for ARU IMS AI Assistant (no external API).
 */

export function getDefaultSuggestions(context) {
  const map = {
    student: ['How do I apply for an internship?', 'What documents do I need?', 'How can I improve my profile?', 'What is the selection process?'],
    landing: ['How do I apply for an internship?', 'What documents do I need?', 'How can I improve my profile?', 'What is the selection process?'],
    company: ['How do I post an internship?', 'How to review applications?', 'Partnership requirements?', 'How to contact students?'],
    examiner: ['How to evaluate reports?', 'Grading criteria explanation', 'How to conduct viva?', 'Feedback guidelines'],
    advisor: ['How to track student progress?', 'Meeting scheduling help', 'Best mentoring practices', 'How to contact students?'],
    superadmin: ['How to approve partners?', 'Assign examiners to students', 'Generate system report', 'User management guide'],
  };
  return map[context] || map.landing;
}

export function getTopicList(context) {
  const lists = {
    student: `• Applying and tracking applications
• Documents and profile quality
• Interviews and deadlines`,
    landing: `• Getting started as a student
• Partnerships for companies
• Support and navigation`,
    company: `• Posting and approving internships
• Reviewing candidates
• Partnership and messaging`,
    examiner: `• Report evaluation and rubrics
• Viva sessions and feedback
• Grades and consistency`,
    advisor: `• Advisee progress and meetings
• Mentoring and messaging
• Early warning and interventions`,
    superadmin: `• Approvals and assignments
• Reports and analytics
• User management`,
  };
  return lists[context] || lists.landing;
}

export function getWelcomeMessage(context) {
  const messages = {
    student: `👋 **Welcome, Student!**

I'm your **ARU AI Assistant**. I can walk you through applications, documents, profile tips, and how the internship process works at Arsi University.

Tap a suggestion below or ask anything in your own words.`,
    landing: `👋 **Welcome to ARU IMS**

I'm the **ARU AI Assistant** — here for students, partners, and staff. Sign in for role-specific guidance, or ask general questions about internships at Arsi University.`,
    company: `🏢 **Welcome, Partner Company**

I can help you **post internships**, **review applicants**, understand **partnership steps**, and use the company workspace effectively.`,
    examiner: `📋 **Welcome, Examiner**

I can guide you on **evaluating reports**, **rubric use**, **viva sessions**, and **fair, consistent feedback**.`,
    advisor: `👨‍💼 **Welcome, Advisor**

I can help you **track advisees**, **schedule meetings**, apply **mentoring best practices**, and stay organized.`,
    superadmin: `⚙️ **Welcome, Super Admin**

I can help with **approvals**, **assigning staff**, **reports**, and **user management** in ARU IMS.`,
  };
  return messages[context] || messages.landing;
}

export function getSuggestionChips(context) {
  return getDefaultSuggestions(context);
}

/**
 * @returns {{ text: string, suggestions?: string[] }}
 */
export function generateResponse(message, context) {
  const lowerMsg = message.toLowerCase();

  if (context === 'student' || context === 'landing') {
    if (lowerMsg.includes('selection') || lowerMsg.includes('process')) {
      return {
        text: `🎯 **Internship Selection Process (Overview)**

Typical flow in ARU IMS:

1️⃣ **Application** — You apply with CV, optional cover letter, and any required documents.
2️⃣ **Screening** — Companies review applications; AI match scores help prioritize fit.
3️⃣ **Shortlist** — Strong candidates move to interview or further review.
4️⃣ **Interview** — May be virtual or in person; prepare using your dashboard tools.
5️⃣ **Offer & placement** — Status updates appear under **My Applications**.

💡 Timelines vary by company and department. Check each posting for deadlines.

What stage do you want detail on?`,
        suggestions: ['How do I apply for an internship?', 'Interview tips?', 'What documents do I need?'],
      };
    }
    if (lowerMsg.includes('apply') || lowerMsg.includes('application')) {
      return {
        text: `📝 **How to Apply for an Internship**

Here's the step-by-step process:

1️⃣ **Complete Your Profile**
   - Log in to your student dashboard
   - Fill in your academic details, skills, and upload your CV
   - A complete profile increases your chances by 60%

2️⃣ **Browse Opportunities**
   - Go to **Browse Internships**
   - Use filters to find matching positions
   - Look for the **AI Match Score** — higher scores mean better fit

3️⃣ **Submit Application**
   - Click **Apply Now** on your chosen internship
   - Upload required documents (CV, cover letter, transcripts)
   - Review and submit

4️⃣ **Track Progress**
   - Check **My Applications** for status updates
   - You'll get notifications for interview invitations

💡 **Pro Tip:** Apply to 5–8 positions for best results. Applying to multiple relevant roles improves placement odds.

Need help with anything specific?`,
        suggestions: ['What documents do I need?', 'How to write a good CV?', 'Application deadline questions?'],
      };
    }
    if (lowerMsg.includes('document') || lowerMsg.includes('cv') || lowerMsg.includes('resume')) {
      return {
        text: `📄 **Required Documents for Application**

Here's what you'll typically need:

✅ **CV/Resume** (Required)
   - Latest education and skills
   - Keep it 1–2 pages
   - Use **AI Resume Analyzer** in your dashboard when available

✅ **Cover Letter** (Highly Recommended)
   - Tailor it to each position
   - Explain your interest and fit

✅ **Academic Transcript** (Sometimes Required)
   - Unofficial copy is often acceptable early on

✅ **Portfolio/GitHub** (For Tech Roles)
   - Link projects that prove practical skills

💡 Students with complete profiles and tailored cover letters are much more likely to get interview calls.

Would you like help preparing any of these?`,
        suggestions: ['Help me write a CV', 'Cover letter tips?', 'How to upload documents?'],
      };
    }
    if (lowerMsg.includes('profile') || lowerMsg.includes('improve')) {
      return {
        text: `⭐ **Improving Your Profile for Better Matches**

Your profile is your first impression.

📊 **Checklist:**
☑ Personal information
☑ Academic details (CGPA, year)
☑ **8–10+ relevant skills**
☑ Experience and projects
☑ Professional photo (recommended)

🎯 **Skills employers value:**
- Technical: programming, data, design
- Soft: communication, teamwork, problem-solving

💡 Add skills that match your target internships; refresh your CV summary when you complete new coursework.

Want ideas for skills to add?`,
        suggestions: ['What is the selection process?', 'What documents do I need?', 'How do I apply for an internship?'],
      };
    }
  }

  if (context === 'company') {
    if (lowerMsg.includes('post') || lowerMsg.includes('internship') || lowerMsg.includes('create')) {
      return {
        text: `📋 **How to Post an Internship**

1️⃣ Open your **company dashboard** → **Post Internship**
2️⃣ Enter title, modality, location, duration, stipend (if any)
3️⃣ Write a clear description (responsibilities, requirements, learning outcomes)
4️⃣ Set skills and eligibility
5️⃣ **Save** and **submit for approval** from **Manage Internships**

💡 Clear descriptions and stipend transparency attract stronger applicants.

Need help with wording?`,
        suggestions: ['How to review applications?', 'Partnership requirements?', 'How to contact students?'],
      };
    }
    if (lowerMsg.includes('review') || lowerMsg.includes('application') || lowerMsg.includes('candidate')) {
      return {
        text: `👥 **Reviewing Applications**

Use the **Applicants** area:

📊 **Kanban / list** — Move candidates through stages
⭐ **AI match** — Prioritize strong fit
📝 **Detail view** — Shortlist, screen, schedule interviews

💡 Respond within about a week when possible; faster responses improve acceptance rates.

Want interview or offer tips?`,
        suggestions: ['How to interview candidates?', 'Making an offer', 'How do I post an internship?'],
      };
    }
    if (lowerMsg.includes('partner') || lowerMsg.includes('partnership')) {
      return {
        text: `🤝 **Partnership with Arsi University**

**Benefits:** access to students, postings, AI matching, and structured evaluation support.

**Typical requirements:** legitimate organization, internship structure, mentor/supervisor, commitment to learning outcomes.

**Flow:** request partnership → admin review → activation → post roles.

💡 Use the landing page or admin-indicated channel to submit a partnership request.

Ready to draft a posting after approval?`,
        suggestions: ['How do I post an internship?', 'How to review applications?', 'How to contact students?'],
      };
    }
    if (lowerMsg.includes('contact') && lowerMsg.includes('student')) {
      return {
        text: `💬 **Contacting Students**

Use **Messages** in your company dashboard to reach applicants or interns you are connected with. Keep communication professional and inside the platform when required by policy.

For bulk outreach, coordinate with your ARU liaison if applicable.`,
        suggestions: ['How to review applications?', 'How do I post an internship?', 'Partnership requirements?'],
      };
    }
  }

  if (context === 'examiner') {
    if (lowerMsg.includes('evaluate') || lowerMsg.includes('report') || lowerMsg.includes('grade')) {
      return {
        text: `📝 **Evaluating Student Reports**

**Typical rubric areas:**
1️⃣ Technical content — accuracy, depth
2️⃣ Structure & clarity
3️⃣ Methodology
4️⃣ Learning outcomes
5️⃣ Presentation & references

⚡ Use **AI Suggest Scores** and draft feedback where available; always apply your professional judgment.

💡 Actionable feedback (strengths + improvements) helps students improve faster.

Need viva guidance too?`,
        suggestions: ['Grading criteria explanation', 'How to conduct viva?', 'Feedback guidelines'],
      };
    }
    if (lowerMsg.includes('criteria') || lowerMsg.includes('rubric')) {
      return {
        text: `📐 **Grading Criteria**

Weights may vary by department — check your local rubric template in **Settings** if available.

Generally: technical accuracy, documentation quality, methodology, and communication carry the most weight. Keep grading consistent across students in the same cohort.

Use the platform's evaluation form so scores and comments are recorded in one place.`,
        suggestions: ['How to evaluate reports?', 'Feedback guidelines', 'How to conduct viva?'],
      };
    }
    if (lowerMsg.includes('viva') || lowerMsg.includes('defense') || lowerMsg.includes('oral')) {
      return {
        text: `🎤 **Conducting Viva / Oral Defense**

**Before:** Read the report; prepare questions on weak spots and core contributions.

**During:** Clarify methodology, probe understanding, stay fair and time-boxed.

**After:** Record outcomes in the system; align scores with written work.

💡 AI tools can suggest question banks — verify questions fit your course standards.

Want feedback wording tips?`,
        suggestions: ['Feedback guidelines', 'How to evaluate reports?', 'Grading criteria explanation'],
      };
    }
    if (lowerMsg.includes('feedback')) {
      return {
        text: `✍️ **Feedback Guidelines**

- Reference the report sections you graded
- Give **2–3 strengths** and **2–3 improvements**
- Avoid vague praise; tie comments to criteria
- Maintain a respectful, academic tone

This keeps appeals low and learning high.`,
        suggestions: ['How to evaluate reports?', 'How to conduct viva?', 'Grading criteria explanation'],
      };
    }
  }

  if (context === 'advisor') {
    if (lowerMsg.includes('student') || lowerMsg.includes('advisee') || lowerMsg.includes('track') || lowerMsg.includes('progress')) {
      return {
        text: `👨‍🎓 **Managing Advisees**

Use your advisor workspace to:
✅ See roster, stages, and engagement
✅ Review applications and documents
✅ Schedule meetings and message students
✅ Watch for **at-risk** signals (inactivity, no applications)

💡 Bi-weekly check-ins during application season improve outcomes.

Need meeting tips?`,
        suggestions: ['Meeting scheduling help', 'Best mentoring practices', 'How to contact students?'],
      };
    }
    if (lowerMsg.includes('meeting') || lowerMsg.includes('schedule')) {
      return {
        text: `📅 **Scheduling Meetings**

- Pick a consistent weekly window
- Send a short agenda (goals, blockers, next steps)
- Use **Meetings** in the dashboard to log notes
- Follow up on action items

💡 Shorter, regular meetings beat rare long ones for internship seasons.`,
        suggestions: ['Best mentoring practices', 'How to track student progress?', 'How to contact students?'],
      };
    }
    if (lowerMsg.includes('mentor') || lowerMsg.includes('practice')) {
      return {
        text: `🌱 **Mentoring Practices**

- Ask open questions; let students own their plan
- Celebrate small wins
- Connect them to resources (CV help, mock interviews)
- Document decisions and deadlines

Consistency builds trust.`,
        suggestions: ['Meeting scheduling help', 'How to track student progress?', 'How to contact students?'],
      };
    }
    if (lowerMsg.includes('contact') && lowerMsg.includes('student')) {
      return {
        text: `💬 **Contacting Students**

Use **Messages** in your advisor dashboard. Prefer in-app messaging for record-keeping. Keep guidance specific and actionable.`,
        suggestions: ['Meeting scheduling help', 'How to track student progress?', 'Best mentoring practices'],
      };
    }
  }

  if (context === 'superadmin') {
    if (lowerMsg.includes('approve') || lowerMsg.includes('approval') || lowerMsg.includes('pending')) {
      return {
        text: `⏳ **Pending Approvals**

Use **Pending Approvals** in the super admin area:

📋 **Common types:** partnership requests, internship submissions, registration workflows (as configured)

⚡ **Workflow:** open item → verify details → **approve**, **reject with reason**, or **request more info**

💡 Use AI or summary panels when available to speed review. **Live counts** appear in your dashboard — this assistant does not read the database.

Need assignment help?`,
        suggestions: ['Assign examiners to students', 'User management guide', 'Generate system report'],
      };
    }
    if (lowerMsg.includes('assign') || lowerMsg.includes('examiner') || lowerMsg.includes('advisor')) {
      return {
        text: `📝 **Assigning Examiners & Advisors**

1️⃣ Filter by department / cohort
2️⃣ Identify unassigned students
3️⃣ Match staff by workload and expertise
4️⃣ Confirm assignments in the **Assign** tools

💡 Balance workloads: very high loads can reduce feedback quality. Use reports to spot imbalance.

Want reporting tips?`,
        suggestions: ['Generate system report', 'User management guide', 'How to approve partners?'],
      };
    }
    if (lowerMsg.includes('report') || lowerMsg.includes('analytics') || lowerMsg.includes('statistics')) {
      return {
        text: `📊 **System Reports**

Depending on your build, you may export:
- Registrations and approvals
- Placement / internship activity
- Workload distribution
- Audit or activity logs

Use filters (date, department, role) before export. For exact menu paths, follow the **Reports** or **Analytics** sections in your admin UI.

Which area do you want to focus on?`,
        suggestions: ['User management guide', 'How to approve partners?', 'Assign examiners to students'],
      };
    }
    if (lowerMsg.includes('user') || lowerMsg.includes('manage')) {
      return {
        text: `👥 **User Management**

**Typical actions:** search users, edit profiles, suspend access, reset passwords, review roles.

**Good practice:** verify identity before resets; document suspensions with a reason; avoid bulk deletes without backup.

Use filters for department and role to audit cohorts quickly.`,
        suggestions: ['How to approve partners?', 'Generate system report', 'Assign examiners to students'],
      };
    }
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return {
      text: `👋 Hello! How can I help you today?

I'm your **ARU AI Assistant**. I can help with:
✅ Navigating ARU IMS
✅ Role-specific guidance
✅ Tips for internships and evaluations

Ask anything, or tap a suggestion below.`,
      suggestions: getDefaultSuggestions(context),
    };
  }

  if (lowerMsg.includes('thank')) {
    return {
      text: `You're very welcome! 😊

I'm always here when you need a quick answer.

💡 For account or technical issues, contact **support@aru.edu.et**.

Good luck with your work in ARU IMS! 🚀`,
      suggestions: getDefaultSuggestions(context),
    };
  }

  return {
    text: `I understand you're asking about **"${message}"**.

I may not have a dedicated answer for that exact phrase, but I can help with:

${getTopicList(context)}

Try rephrasing, or pick a suggestion below.`,
    suggestions: getDefaultSuggestions(context),
  };
}
