import Candidate from '../models/Candidate.js';
import Drive from '../models/Drive.js';

// POST /api/ats/analyze  — multipart: resume file + driveId + candidateId (optional)
export const analyzeResume = async (req, res, next) => {
  try {
    const { driveId, candidateId } = req.body;

    if (!req.file) return res.status(400).json({ success: false, message: 'No resume file uploaded' });

    let resumeText = '';

    // Parse PDF or TXT
    if (req.file.mimetype === 'application/pdf') {
      try {
        // Dynamic import for pdf-parse (ESM compat)
        const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
        const result = await pdfParse(req.file.buffer);
        resumeText = result.text;
      } catch (e) {
        // Fallback: use raw buffer as text (for demo if pdf-parse fails)
        resumeText = req.file.buffer.toString('utf-8', 0, Math.min(req.file.buffer.length, 5000));
      }
    } else {
      resumeText = req.file.buffer.toString('utf-8');
    }

    resumeText = resumeText.toLowerCase();

    // --- Extract skills from resume text ---
    const KNOWN_SKILLS = [
      // Languages
      'javascript','typescript','python','java','c++','c#','ruby','go','rust','swift','kotlin','php','scala','r','matlab',
      // Frontend
      'react','vue','angular','html','css','tailwind','sass','webpack','vite','next.js','nextjs','gatsby',
      // Backend
      'node.js','nodejs','express','django','flask','spring','fastapi','laravel','rails','graphql','rest api',
      // DB
      'mongodb','mysql','postgresql','redis','sqlite','oracle','cassandra','dynamodb','firebase','supabase',
      // Cloud/DevOps
      'aws','azure','gcp','docker','kubernetes','terraform','jenkins','github actions','ci/cd','linux','bash',
      // Data/ML
      'machine learning','deep learning','tensorflow','pytorch','scikit-learn','pandas','numpy','data analysis',
      'nlp','computer vision','sql','power bi','tableau','excel',
      // Other
      'git','agile','scrum','jira','figma','photoshop','communication','leadership','teamwork','problem solving',
    ];

    const extractedSkills = KNOWN_SKILLS.filter(skill => resumeText.includes(skill));

    // Extract experience (look for patterns like "X years" or "X+ years")
    const expMatches = resumeText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?/gi) || [];
    let experience = 0;
    if (expMatches.length > 0) {
      const nums = expMatches.map(m => parseInt(m)).filter(n => n < 50);
      experience = nums.length ? Math.max(...nums) : 0;
    }

    // Extract education signals
    const hasPhd = /ph\.?d|doctorate/i.test(resumeText);
    const hasMasters = /master|mtech|m\.?s\.?|mba|m\.?e\./i.test(resumeText);
    const hasBachelors = /bachelor|b\.?tech|b\.?e\.|b\.?sc|b\.?s\.|undergraduate/i.test(resumeText);
    const cgpaMatch = resumeText.match(/(?:cgpa|gpa|grade)[:\s]*([0-9.]+)/i);
    const cgpa = cgpaMatch ? parseFloat(cgpaMatch[1]) : 0;

    // Education score
    const educationScore = hasPhd ? 100 : hasMasters ? 90 : hasBachelors ? 75 : 60;

    // --- If driveId provided, compare against drive requirements ---
    let driveSkills = [];
    let requiredExp = 0;
    let driveContext = null;

    if (driveId) {
      try {
        const drive = await Drive.findById(driveId).select('name requiredSkills requiredExperience jobRole');
        if (drive) {
          driveSkills = (drive.requiredSkills || []).map(s => s.toLowerCase());
          requiredExp = drive.requiredExperience || 0;
          driveContext = { name: drive.name, jobRole: drive.jobRole };
        }
      } catch {}
    }

    // --- Compute ATS score ---
    // Skill match (40%)
    let skillMatch = 0;
    let matchedSkills = [];
    let missingSkills = [];

    if (driveSkills.length > 0) {
      matchedSkills = driveSkills.filter(s => extractedSkills.includes(s) || resumeText.includes(s));
      missingSkills = driveSkills.filter(s => !matchedSkills.includes(s));
      skillMatch = Math.min(100, Math.round((matchedSkills.length / driveSkills.length) * 100));
    } else {
      // No drive requirements: score based on breadth of skills
      skillMatch = Math.min(100, extractedSkills.length * 5);
      matchedSkills = extractedSkills;
    }

    // Experience match (30%)
    let expMatch = 0;
    if (requiredExp > 0) {
      expMatch = experience >= requiredExp ? 100 : Math.round((experience / requiredExp) * 100);
    } else {
      expMatch = experience >= 3 ? 100 : experience >= 1 ? 75 : experience > 0 ? 50 : 40;
    }

    // Education match (15%)
    const eduMatch = cgpa >= 8.5 ? 100 : cgpa >= 7.5 ? 85 : cgpa >= 6.5 ? 70 : educationScore;

    // Keyword/role relevance (15%) — based on resume richness
    const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
    const keywordMatch = wordCount > 500 ? 85 : wordCount > 200 ? 70 : wordCount > 50 ? 55 : 40;

    const atsScore = Math.round(
      skillMatch * 0.40 +
      expMatch * 0.30 +
      eduMatch * 0.15 +
      keywordMatch * 0.15
    );

    const atsStatus = atsScore >= 75 ? 'shortlisted' : atsScore >= 50 ? 'review' : 'rejected';

    const breakdown = {
      skillMatch,
      experienceMatch: expMatch,
      educationMatch: eduMatch,
      keywordRelevance: keywordMatch,
    };

    // --- Optionally update the candidate record ---
    if (candidateId) {
      try {
        await Candidate.findByIdAndUpdate(candidateId, {
          skills: [...new Set([...extractedSkills])],
          experience,
          atsScore,
          atsStatus,
          atsBreakdown: breakdown,
          resumeText: resumeText.slice(0, 3000), // store first 3k chars
        });
      } catch {}
    }

    res.json({
      success: true,
      atsScore,
      atsStatus,
      breakdown,
      extractedSkills,
      matchedSkills,
      missingSkills,
      experience,
      cgpa: cgpa || null,
      educationLevel: hasPhd ? 'PhD' : hasMasters ? 'Masters' : hasBachelors ? 'Bachelors' : 'Not detected',
      resumeWordCount: resumeText.split(/\s+/).filter(Boolean).length,
      driveContext,
      recommendation: atsScore >= 75
        ? 'Strong match — recommend for interview rounds'
        : atsScore >= 50
        ? 'Partial match — review manually before proceeding'
        : 'Weak match — consider for other roles or reject',
    });
  } catch (err) { next(err); }
};
