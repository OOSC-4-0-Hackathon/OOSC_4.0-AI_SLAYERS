/**
 * Parses the raw JSON streamed from the backend into the FivePartCaseDossier structure
 * expected by the studio UI components.
 */
export function parseMarkdownToDossier(markdown, domain = 'GENERAL_CIVIL') {
  let parsed = null;
  try {
    // Extract JSON block if the LLM wrapped it in markdown codeblocks
    let jsonStr = markdown.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse LLM dossier JSON:", e);
    parsed = {};
  }

  // Helper for knowledge gaps
  const gapMessage = "Not established from retrieved authority.";

  // Build the complete structure with safe fallbacks
  const dossier = {
    problemAndRights: {
      docketId: `DOC-${Math.floor(Math.random() * 10000)}`,
      domain: domain,
      summary: parsed?.problemAndRights?.summary || gapMessage,
      citizenProtections: Array.isArray(parsed?.problemAndRights?.citizenProtections) 
        ? parsed.problemAndRights.citizenProtections : [],
      relevantSections: Array.isArray(parsed?.problemAndRights?.relevantSections) 
        ? parsed.problemAndRights.relevantSections : [],
      keyTakeaway: parsed?.problemAndRights?.keyTakeaway || gapMessage
    },
    evidenceRequired: {
      minimumEvidentiaryThreshold: parsed?.evidenceRequired?.minimumEvidentiaryThreshold || gapMessage,
      items: Array.isArray(parsed?.evidenceRequired?.items) ? parsed.evidenceRequired.items.map((item, idx) => ({
        id: `ev-${idx+1}`,
        title: item.title || 'Evidence',
        description: item.description || '',
        isMandatory: item.isMandatory !== false, // default true
        evidentiaryWeight: item.evidentiaryWeight || 'SUPPORTING',
        checked: false
      })) : [],
      auditReadinessScore: 0 // calculated below
    },
    relevantAuthority: {
      designatedBody: parsed?.relevantAuthority?.designatedBody || gapMessage,
      officerTitle: parsed?.relevantAuthority?.officerTitle || gapMessage,
      jurisdictionLevel: parsed?.relevantAuthority?.jurisdictionLevel || "State/UT and property location are required to determine the exact forum.",
      statutoryTimeLimit: parsed?.relevantAuthority?.statutoryTimeLimit || gapMessage,
      appealPeriod: parsed?.relevantAuthority?.appealPeriod || gapMessage,
      filingFee: parsed?.relevantAuthority?.filingFee || gapMessage,
      escalationPath: Array.isArray(parsed?.relevantAuthority?.escalationPath) ? parsed.relevantAuthority.escalationPath : [],
      officialPortalUrl: parsed?.relevantAuthority?.officialPortalUrl || ''
    },
    actionPlan: {
      totalEstimatedDays: parsed?.actionPlan?.totalEstimatedDays || 0,
      steps: Array.isArray(parsed?.actionPlan?.steps) ? parsed.actionPlan.steps : []
    },
    documentGeneration: {
      documentType: parsed?.documentGeneration?.documentType || 'Notice/Application',
      title: parsed?.documentGeneration?.title || 'Formal Legal Draft',
      actReference: parsed?.documentGeneration?.actReference || gapMessage,
      suggestedFormNumber: parsed?.documentGeneration?.suggestedFormNumber || '',
      placeholders: parsed?.documentGeneration?.placeholders || {},
      templateBody: parsed?.documentGeneration?.templateBody || gapMessage,
      instructions: Array.isArray(parsed?.documentGeneration?.instructions) ? parsed.documentGeneration.instructions : []
    }
  };

  // Calculate a mock score for audit readiness based on the number of items required
  // If there are 0 items, 0%. If they are not checked, 0%. The UI updates this when checked.
  dossier.evidenceRequired.auditReadinessScore = 0; 
  
  return dossier;
}
