/**
 * ContractorQCAgent
 *
 * AI-powered quality control using GPT-4 Vision.
 * Analyzes job-site photos to detect defects, generate punch lists,
 * and provide pass/fail recommendations.
 *
 * Uses multimodal AI (text + vision) to:
 * - Identify code violations
 * - Detect workmanship issues
 * - Flag safety concerns
 * - Generate remediation steps
 */

import OpenAI from 'openai';
import type {
  QCAgentInput,
  QCAgentOutput,
  QCAnalysisResult,
  PunchListItem,
  SafetyFlag,
  QCAssessment,
  IssueSeverity,
  PhotoAnalysis
} from '@/lib/types/contractor-qc';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class ContractorQCAgent {
  /**
   * Analyze job photos and generate QC report
   */
  static async analyzeJob(input: QCAgentInput): Promise<QCAgentOutput> {
    const { job_type, service_type, industry, photos, checklist, common_defects } = input;

    if (photos.length === 0) {
      throw new Error('At least one photo is required for QC analysis');
    }

    // Step 1: Analyze individual photos
    const photo_analyses = await this.analyzePhotos(photos, industry, job_type, checklist, common_defects);

    // Step 2: Aggregate results into punch list
    const punch_list = this.aggregatePunchList(photo_analyses);

    // Step 3: Detect safety issues
    const safety_flags = this.extractSafetyFlags(photo_analyses);

    // Step 4: Calculate overall assessment
    const overall_assessment = this.calculateOverallAssessment(punch_list, safety_flags);

    // Step 5: Calculate confidence
    const confidence_score = this.calculateConfidence(photo_analyses, photos.length);

    // Step 6: Generate customer message
    const customer_message = this.generateCustomerMessage(overall_assessment, punch_list, industry);

    // Step 7: Generate analysis notes
    const analysis_notes = this.generateAnalysisNotes(photo_analyses, punch_list, safety_flags);

    // Count issues by severity
    const critical_issues_count = punch_list.filter(i => i.severity === 'critical').length;
    const minor_issues_count = punch_list.filter(i => ['low', 'medium'].includes(i.severity)).length;

    const analysis: QCAnalysisResult = {
      overall_assessment,
      confidence_score,
      punch_list_items: punch_list,
      critical_issues_count,
      minor_issues_count,
      safety_flags,
      customer_message_template: customer_message,
      analysis_notes,
      photos_analyzed: photos.length,
      ai_model: 'gpt-4o'
    };

    // Generate next steps
    const next_steps = this.generateNextSteps(overall_assessment, punch_list);

    // Generate recommended actions
    const recommended_actions = this.generateRecommendedActions(overall_assessment, punch_list, safety_flags);

    return {
      analysis,
      next_steps,
      recommended_actions
    };
  }

  /**
   * Analyze individual photos using GPT-4 Vision
   */
  private static async analyzePhotos(
    photos: QCAgentInput['photos'],
    industry: string,
    job_type: string,
    checklist?: QCAgentInput['checklist'],
    common_defects?: QCAgentInput['common_defects']
  ): Promise<PhotoAnalysis[]> {
    const analyses: PhotoAnalysis[] = [];

    // Build system prompt with checklist and defects
    const system_prompt = this.buildSystemPrompt(industry, job_type, checklist, common_defects);

    // Analyze photos in batches (GPT-4o supports multiple images)
    const batch_size = 4; // Analyze up to 4 photos at once
    for (let i = 0; i < photos.length; i += batch_size) {
      const batch = photos.slice(i, i + batch_size);

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: system_prompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: this.buildAnalysisPrompt(batch, job_type)
                },
                ...batch.map(photo => ({
                  type: 'image_url' as const,
                  image_url: {
                    url: photo.url,
                    detail: 'high' as const
                  }
                }))
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.3 // Lower temperature for consistent analysis
        });

        // Parse response (structured JSON)
        const result = this.parseVisionResponse(response.choices[0].message.content || '', batch);
        analyses.push(...result);

      } catch (error) {
        console.error('Error analyzing photo batch:', error);

        // Add placeholder analyses for failed batch
        batch.forEach(photo => {
          analyses.push({
            photo_id: photo.url,
            photo_url: photo.url,
            detected_issues: [],
            quality_indicators: {
              focus: 'fair',
              lighting: 'fair',
              angle: 'fair',
              completeness: 'partial'
            },
            notes: 'Analysis failed - please review manually'
          });
        });
      }
    }

    return analyses;
  }

  /**
   * Build system prompt with industry context
   */
  private static buildSystemPrompt(
    industry: string,
    job_type: string,
    checklist?: QCAgentInput['checklist'],
    common_defects?: QCAgentInput['common_defects']
  ): string {
    let prompt = `You are an expert ${industry} quality control inspector analyzing job-site photos.

Your task: Identify defects, code violations, safety issues, and workmanship problems.

Job Type: ${job_type}
Industry: ${industry}

`;

    if (checklist && checklist.length > 0) {
      prompt += `**Inspection Checklist:**\n`;
      checklist.forEach((item, i) => {
        prompt += `${i + 1}. ${item.category}: ${item.item}\n`;
        prompt += `   Pass Criteria: ${item.pass_criteria}\n`;
      });
      prompt += `\n`;
    }

    if (common_defects && common_defects.length > 0) {
      prompt += `**Common Defects to Look For:**\n`;
      common_defects.forEach(defect => {
        prompt += `- ${defect.defect_name} (${defect.severity}): ${defect.visual_indicators}\n`;
      });
      prompt += `\n`;
    }

    prompt += `**Analysis Guidelines:**
1. Focus on visible issues that affect quality, safety, or code compliance
2. Rate severity: critical (must fix before handoff), high (should fix soon), medium (cosmetic/minor), low (nitpick)
3. Provide specific, actionable remediation steps
4. Note photo quality (focus, lighting, angle) - flag if insufficient
5. Flag any safety hazards immediately

**Output Format (JSON):**
{
  "photos": [
    {
      "photo_number": 1,
      "detected_issues": [
        {
          "defect": "Description of issue",
          "severity": "critical|high|medium|low",
          "confidence": 0.85,
          "location_description": "Where in photo",
          "remediation": "How to fix"
        }
      ],
      "quality_indicators": {
        "focus": "good|fair|poor",
        "lighting": "good|fair|poor",
        "angle": "good|fair|poor",
        "completeness": "complete|partial|insufficient"
      },
      "safety_flags": [
        {
          "issue": "Safety concern description",
          "severity": "critical|high",
          "immediate_action_required": true
        }
      ],
      "notes": "Additional observations"
    }
  ]
}`;

    return prompt;
  }

  /**
   * Build analysis prompt for specific photos
   */
  private static buildAnalysisPrompt(photos: QCAgentInput['photos'], job_type: string): string {
    let prompt = `Analyze these ${photos.length} job-site photos:\n\n`;

    photos.forEach((photo, i) => {
      prompt += `Photo ${i + 1}: ${photo.type}`;
      if (photo.description) {
        prompt += ` - ${photo.description}`;
      }
      prompt += `\n`;
    });

    prompt += `\nProvide detailed QC analysis in JSON format as specified.`;

    return prompt;
  }

  /**
   * Parse GPT-4 Vision response
   */
  private static parseVisionResponse(content: string, photos: QCAgentInput['photos']): PhotoAnalysis[] {
    try {
      // Extract JSON from response (handles markdown code blocks)
      const json_match = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      if (!json_match) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(json_match[1] || json_match[0]);

      return parsed.photos.map((photo_result: any, i: number) => ({
        photo_id: photos[i].url,
        photo_url: photos[i].url,
        detected_issues: photo_result.detected_issues || [],
        quality_indicators: photo_result.quality_indicators || {
          focus: 'fair',
          lighting: 'fair',
          angle: 'fair',
          completeness: 'partial'
        },
        notes: photo_result.notes || ''
      }));

    } catch (error) {
      console.error('Error parsing vision response:', error);

      // Return placeholder analyses
      return photos.map(photo => ({
        photo_id: photo.url,
        photo_url: photo.url,
        detected_issues: [],
        quality_indicators: {
          focus: 'fair',
          lighting: 'fair',
          angle: 'fair',
          completeness: 'partial'
        },
        notes: 'Failed to parse AI response'
      }));
    }
  }

  /**
   * Aggregate photo analyses into unified punch list
   */
  private static aggregatePunchList(photo_analyses: PhotoAnalysis[]): PunchListItem[] {
    const punch_list: PunchListItem[] = [];

    photo_analyses.forEach((analysis, photo_index) => {
      analysis.detected_issues.forEach(issue => {
        // Check if similar issue already exists
        const existing = punch_list.find(item =>
          item.issue.toLowerCase().includes(issue.defect.toLowerCase().slice(0, 20))
        );

        if (existing) {
          // Merge with existing (update confidence if higher)
          if (issue.confidence > existing.confidence) {
            existing.confidence = issue.confidence;
          }
          if (issue.severity === 'critical' && existing.severity !== 'critical') {
            existing.severity = 'critical';
          }
        } else {
          // Add new item
          punch_list.push({
            issue: issue.defect,
            severity: issue.severity as IssueSeverity,
            photo_ref: `Photo ${photo_index + 1}`,
            location: issue.location_description,
            remediation: (issue as any).remediation || 'Consult with supervisor',
            confidence: issue.confidence,
            estimated_time: this.estimateRemediationTime(issue.severity as IssueSeverity)
          });
        }
      });
    });

    // Sort by severity (critical first)
    return punch_list.sort((a, b) => {
      const severity_order: Record<IssueSeverity, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3
      };
      return severity_order[a.severity] - severity_order[b.severity];
    });
  }

  /**
   * Extract safety flags from analyses
   */
  private static extractSafetyFlags(photo_analyses: PhotoAnalysis[]): SafetyFlag[] {
    const flags: SafetyFlag[] = [];

    photo_analyses.forEach((analysis, photo_index) => {
      const safety_issues = (analysis as any).safety_flags || [];

      safety_issues.forEach((flag: any) => {
        flags.push({
          issue: flag.issue,
          photo_ref: `Photo ${photo_index + 1}`,
          severity: flag.severity,
          immediate_action_required: flag.immediate_action_required || false
        });
      });
    });

    return flags;
  }

  /**
   * Calculate overall assessment
   */
  private static calculateOverallAssessment(
    punch_list: PunchListItem[],
    safety_flags: SafetyFlag[]
  ): QCAssessment {
    // Critical issues or safety flags = fail
    if (punch_list.some(item => item.severity === 'critical') || safety_flags.length > 0) {
      return 'fail';
    }

    // More than 5 high issues = needs review
    const high_issues = punch_list.filter(item => item.severity === 'high').length;
    if (high_issues > 5) {
      return 'needs_review';
    }

    // More than 10 medium issues = needs review
    const medium_issues = punch_list.filter(item => item.severity === 'medium').length;
    if (medium_issues > 10) {
      return 'needs_review';
    }

    // Otherwise pass (may have minor issues)
    return 'pass';
  }

  /**
   * Calculate confidence in analysis
   */
  private static calculateConfidence(photo_analyses: PhotoAnalysis[], total_photos: number): number {
    let confidence = 0.7; // Base confidence

    // More photos = higher confidence
    if (total_photos >= 10) confidence += 0.15;
    else if (total_photos >= 5) confidence += 0.10;
    else if (total_photos >= 3) confidence += 0.05;

    // Good photo quality = higher confidence
    const avg_quality = photo_analyses.reduce((sum, analysis) => {
      const quality_score =
        (analysis.quality_indicators.focus === 'good' ? 1 : analysis.quality_indicators.focus === 'fair' ? 0.5 : 0) +
        (analysis.quality_indicators.lighting === 'good' ? 1 : analysis.quality_indicators.lighting === 'fair' ? 0.5 : 0) +
        (analysis.quality_indicators.angle === 'good' ? 1 : analysis.quality_indicators.angle === 'fair' ? 0.5 : 0);
      return sum + (quality_score / 3);
    }, 0) / photo_analyses.length;

    confidence += avg_quality * 0.15;

    return Math.min(1.0, confidence);
  }

  /**
   * Generate customer message
   */
  private static generateCustomerMessage(
    assessment: QCAssessment,
    punch_list: PunchListItem[],
    industry: string
  ): string {
    let message = '';

    if (assessment === 'pass') {
      message = `Hi [Customer Name],\n\n`;
      message += `Great news! We've completed your ${industry} project and it has passed our quality inspection. `;

      if (punch_list.length > 0) {
        message += `We did note a few minor items that we've already addressed:\n\n`;
        punch_list.slice(0, 3).forEach(item => {
          message += `- ${item.issue}\n`;
        });
        message += `\n`;
      }

      message += `Your system is ready to use. We'll follow up to ensure everything is working perfectly.\n\n`;
      message += `Thank you for choosing us!\n\n`;
      message += `[Your Company Name]\n[Phone]`;

    } else if (assessment === 'needs_review') {
      message = `Hi [Customer Name],\n\n`;
      message += `We've completed your ${industry} project. Our quality inspector has identified a few items `;
      message += `that need attention before final sign-off:\n\n`;

      punch_list.filter(i => ['critical', 'high'].includes(i.severity)).slice(0, 5).forEach(item => {
        message += `- ${item.issue}\n`;
      });

      message += `\nOur team is addressing these items today. We'll update you when complete.\n\n`;
      message += `Thank you for your patience!\n\n`;
      message += `[Your Company Name]\n[Phone]`;

    } else { // fail
      message = `Internal Note: Do not send to customer yet.\n\n`;
      message += `Critical issues found:\n\n`;

      punch_list.filter(i => i.severity === 'critical').forEach(item => {
        message += `- ${item.issue}\n`;
      });

      message += `\nSchedule crew to remediate before customer handoff.`;
    }

    return message;
  }

  /**
   * Generate analysis notes
   */
  private static generateAnalysisNotes(
    photo_analyses: PhotoAnalysis[],
    punch_list: PunchListItem[],
    safety_flags: SafetyFlag[]
  ): string {
    let notes = `QC Analysis Summary:\n\n`;

    notes += `Photos Analyzed: ${photo_analyses.length}\n`;
    notes += `Issues Found: ${punch_list.length}\n`;

    if (safety_flags.length > 0) {
      notes += `Safety Flags: ${safety_flags.length} ⚠️\n\n`;
      notes += `**SAFETY CONCERNS:**\n`;
      safety_flags.forEach(flag => {
        notes += `- ${flag.issue} (${flag.severity})\n`;
      });
      notes += `\n`;
    }

    notes += `**Issue Breakdown:**\n`;
    notes += `- Critical: ${punch_list.filter(i => i.severity === 'critical').length}\n`;
    notes += `- High: ${punch_list.filter(i => i.severity === 'high').length}\n`;
    notes += `- Medium: ${punch_list.filter(i => i.severity === 'medium').length}\n`;
    notes += `- Low: ${punch_list.filter(i => i.severity === 'low').length}\n\n`;

    // Note photo quality issues
    const poor_quality_photos = photo_analyses.filter(a =>
      a.quality_indicators.focus === 'poor' ||
      a.quality_indicators.lighting === 'poor' ||
      a.quality_indicators.completeness === 'insufficient'
    );

    if (poor_quality_photos.length > 0) {
      notes += `**Photo Quality Concerns:**\n`;
      notes += `${poor_quality_photos.length} photos had quality issues that may affect analysis accuracy.\n`;
      notes += `Consider retaking with better lighting/angle.\n\n`;
    }

    notes += `Analysis performed by GPT-4o multimodal AI.`;

    return notes;
  }

  /**
   * Generate next steps
   */
  private static generateNextSteps(assessment: QCAssessment, punch_list: PunchListItem[]): string[] {
    const steps: string[] = [];

    if (assessment === 'fail') {
      steps.push('Do not hand off to customer yet');
      steps.push('Schedule crew to address critical issues');

      const critical = punch_list.filter(i => i.severity === 'critical');
      if (critical.length > 0) {
        steps.push(`Fix ${critical.length} critical issue(s): ${critical[0].issue.slice(0, 50)}...`);
      }

      steps.push('Re-inspect after remediation');

    } else if (assessment === 'needs_review') {
      steps.push('Review punch list with crew lead');
      steps.push('Address high-priority items today');
      steps.push('Schedule follow-up inspection');
      steps.push('Update customer on timeline');

    } else { // pass
      steps.push('Prepare for customer handoff');
      steps.push('Send customer message template');
      steps.push('Schedule final walkthrough');

      if (punch_list.length > 0) {
        steps.push(`Note ${punch_list.length} minor item(s) in job file`);
      }

      steps.push('Generate invoice');
    }

    return steps;
  }

  /**
   * Generate recommended actions
   */
  private static generateRecommendedActions(
    assessment: QCAssessment,
    punch_list: PunchListItem[],
    safety_flags: SafetyFlag[]
  ): Array<{ action: string; priority: number; reasoning: string }> {
    const actions: Array<{ action: string; priority: number; reasoning: string }> = [];

    // Safety flags = highest priority
    if (safety_flags.length > 0) {
      actions.push({
        action: 'Address safety concerns immediately',
        priority: 1,
        reasoning: `${safety_flags.length} safety flag(s) detected. Must resolve before continuing.`
      });
    }

    // Critical issues
    const critical_count = punch_list.filter(i => i.severity === 'critical').length;
    if (critical_count > 0) {
      actions.push({
        action: `Fix ${critical_count} critical issue(s)`,
        priority: safety_flags.length > 0 ? 2 : 1,
        reasoning: 'Critical issues prevent job completion and customer handoff.'
      });
    }

    // High issues
    const high_count = punch_list.filter(i => i.severity === 'high').length;
    if (high_count > 0) {
      actions.push({
        action: `Address ${high_count} high-priority issue(s)`,
        priority: critical_count > 0 ? 3 : 2,
        reasoning: 'High-priority issues should be resolved before customer sign-off.'
      });
    }

    // If passed, suggest proactive actions
    if (assessment === 'pass') {
      actions.push({
        action: 'Send customer satisfaction survey',
        priority: 1,
        reasoning: 'Job passed QC - good time to request review/referral.'
      });

      actions.push({
        action: 'Upload photos to portfolio',
        priority: 2,
        reasoning: 'Quality work - showcase on website and social media.'
      });
    }

    return actions.slice(0, 5); // Top 5 actions
  }

  /**
   * Estimate remediation time
   */
  private static estimateRemediationTime(severity: IssueSeverity): string {
    const estimates: Record<IssueSeverity, string> = {
      critical: '2-4 hours',
      high: '1-2 hours',
      medium: '30-60 minutes',
      low: '15-30 minutes'
    };
    return estimates[severity];
  }
}
