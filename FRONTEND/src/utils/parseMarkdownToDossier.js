/**
 * Parses the raw Markdown streamed from the backend into the FivePartCaseDossier structure
 * expected by the studio UI components.
 */
export function parseMarkdownToDossier(markdown, domain = 'GENERAL_CIVIL') {
  const dossier = {
    problemAndRights: {
      docketId: `DOC-${Math.floor(Math.random() * 10000)}`,
      domain: domain,
      summary: '',
      citizenProtections: [],
      relevantSections: [],
      keyTakeaway: ''
    },
    evidenceRequired: {
      minimumEvidentiaryThreshold: 'Standard Preponderance of Evidence',
      items: [],
      auditReadinessScore: 85
    },
    relevantAuthority: {
      designatedBody: 'Relevant Authority',
      officerTitle: 'Nodal Officer',
      jurisdictionLevel: 'Local/District',
      statutoryTimeLimit: '30 Days',
      appealPeriod: '90 Days',
      filingFee: 'Nominal/Varies',
      escalationPath: [],
      officialPortalUrl: ''
    },
    actionPlan: {
      totalEstimatedDays: 45,
      steps: []
    },
    documentGeneration: {
      documentType: 'Notice/Application',
      title: 'Formal Legal Draft',
      actReference: '',
      placeholders: {},
      templateBody: '',
      instructions: []
    }
  };

  // Helper to extract a section's text
  const extractSection = (title) => {
    const regex = new RegExp(`###? ${title}[\\s\\S]*?(?=###? |$)`, 'i');
    const match = markdown.match(regex);
    return match ? match[0].replace(new RegExp(`###? ${title}`, 'i'), '').trim() : '';
  };

  // 1. Problem & Rights
  const problemText = extractSection('Problem & Rights');
  if (problemText) {
    dossier.problemAndRights.summary = problemText;
    dossier.problemAndRights.keyTakeaway = "Rely on the statutory provisions listed above.";
    // Mock a section for the UI to render the statutes
    dossier.problemAndRights.relevantSections.push({
      act: "Relevant Act",
      section: "Section",
      title: "Applicable Provision",
      statutoryQuote: "Based on the generated legal analysis.",
      plainExplanation: "See text above for details.",
      relevanceScore: 0.95
    });
  }

  // 2. Evidence
  const evidenceText = extractSection('Evidence Required');
  if (evidenceText) {
    const lines = evidenceText.split('\n');
    let idCounter = 1;
    lines.forEach(line => {
      const match = line.match(/^[-*]\s*(.+)/);
      if (match) {
        dossier.evidenceRequired.items.push({
          id: `ev-${idCounter++}`,
          title: match[1].split(':')[0] || match[1].substring(0, 30),
          description: match[1],
          isMandatory: true,
          evidentiaryWeight: 'HIGH',
          checked: false
        });
      }
    });
    if (dossier.evidenceRequired.items.length === 0) {
      dossier.evidenceRequired.items.push({
        id: 'ev-1', title: 'Evidence Analysis', description: evidenceText, isMandatory: true, evidentiaryWeight: 'HIGH', checked: false
      });
    }
  }

  // 3. Authority
  const authorityText = extractSection('Relevant Authority');
  if (authorityText) {
    dossier.relevantAuthority.designatedBody = authorityText.split('\n')[0] || "Appropriate Forum";
    dossier.relevantAuthority.escalationPath.push({
      tier: 1,
      authorityName: dossier.relevantAuthority.designatedBody,
      timeframe: 'Immediate',
      prerequisite: 'Gather evidence',
      procedure: authorityText
    });
  }

  // 4. Action Plan
  const actionText = extractSection('Action Plan');
  if (actionText) {
    const lines = actionText.split('\n');
    let stepNum = 1;
    lines.forEach(line => {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) {
        dossier.actionPlan.steps.push({
          stepNumber: stepNum++,
          title: `Step ${stepNum - 1}`,
          timeframe: 'TBD',
          description: match[1],
          actionType: 'FILING',
          status: 'pending'
        });
      }
    });
    if (dossier.actionPlan.steps.length === 0) {
      dossier.actionPlan.steps.push({
        stepNumber: 1, title: 'Step 1', timeframe: 'TBD', description: actionText, actionType: 'FILING', status: 'pending'
      });
    }
  }

  // 5. Document Generation
  const docText = extractSection('Document Generation');
  if (docText) {
    dossier.documentGeneration.templateBody = docText;
  }

  return dossier;
}
