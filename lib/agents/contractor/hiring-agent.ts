/**
 * ContractorHiringAgent
 *
 * Generates job ads, screening questions, and onboarding checklists
 * for contractor businesses.
 *
 * Outputs:
 * - Industry-specific job ad copy
 * - Scoreable screening questionnaire
 * - 7-day onboarding checklist
 * - Posting strategy and timeline
 */

import type {
  RoleType,
  EmploymentType,
  HiringAgentInput,
  HiringAgentOutput,
  GeneratedJobAd,
  ScreeningQuestion,
  OnboardingChecklistItem,
  PostingSchedule,
  PlatformRecommendation,
  HiringTimeline
} from '@/lib/types/contractor-hiring';

export class ContractorHiringAgent {
  /**
   * Generate complete hiring package (job ad + screening + onboarding)
   */
  static generateHiringPackage(input: HiringAgentInput): HiringAgentOutput {
    const job_ad = this.generateJobAd(input);
    const onboarding_checklist = this.generateOnboardingChecklist(input.role_type, input.profile.industry);
    const timeline = this.generateHiringTimeline(input.role_type);
    const next_steps = this.generateNextSteps(input);

    return {
      generated_job_ad: job_ad,
      onboarding_checklist_preview: onboarding_checklist,
      hiring_timeline: timeline,
      recommended_next_steps: next_steps
    };
  }

  /**
   * Generate job ad with industry and role-specific content
   */
  private static generateJobAd(input: HiringAgentInput): GeneratedJobAd {
    const { role_type, job_title, pay_min, pay_max, pay_type, location, employment_type, profile } = input;

    // Generate title
    const ad_title = this.generateJobTitle(role_type, job_title, profile.industry);

    // Generate description
    const ad_description = this.generateJobDescription(input);

    // Generate requirements
    const requirements = this.generateRequirements(input);

    // Generate benefits
    const benefits = this.generateBenefits(input);

    // Generate screening questions
    const screening_questions = this.generateScreeningQuestions(input);

    // Generate posting schedule
    const posting_schedule = this.generatePostingSchedule(role_type);

    // Estimate time to hire
    const time_to_hire = this.estimateTimeToHire(role_type, location);

    // Estimate applicant quality
    const quality = this.estimateApplicantQuality(input);

    // Recommend platforms
    const platforms = this.recommendPlatforms(role_type, employment_type);

    return {
      job_ad_title: ad_title,
      job_ad_description: ad_description,
      requirements,
      benefits,
      screening_questions,
      posting_schedule,
      estimated_time_to_hire_days: time_to_hire,
      expected_applicant_quality: quality,
      recommended_platforms: platforms
    };
  }

  /**
   * Generate job title
   */
  private static generateJobTitle(
    role_type: RoleType,
    custom_title: string | undefined,
    industry: string
  ): string {
    if (custom_title) return custom_title;

    const titles: Record<RoleType, string> = {
      installer: `${industry} Installer`,
      technician: `${industry} Technician`,
      foreman: `${industry} Foreman / Crew Lead`,
      office: 'Office Administrator',
      laborer: 'General Laborer',
      apprentice: `${industry} Apprentice`,
      dispatcher: 'Service Dispatcher',
      sales: 'Sales Representative',
      other: `${industry} Specialist`
    };

    return titles[role_type] || `${industry} Professional`;
  }

  /**
   * Generate job description
   */
  private static generateJobDescription(input: HiringAgentInput): string {
    const { role_type, location, profile, employment_type, pay_min, pay_max, pay_type } = input;

    let description = `**About Us**\n`;
    description += `We're a local ${profile.industry} contractor serving ${location} and surrounding areas. `;
    description += `Our team is known for quality work, professionalism, and customer satisfaction.\n\n`;

    description += `**The Role**\n`;
    description += `We're hiring a ${this.getRoleDescription(role_type)} to join our growing team. `;
    description += `This is a ${employment_type.replace('_', '-')} position `;

    if (pay_min && pay_max) {
      description += `paying $${pay_min}-${pay_max}`;
      description += pay_type === 'hourly' ? '/hour' : pay_type === 'salary' ? '/year' : '';
    }
    description += `.\n\n`;

    description += `**Typical Day**\n`;
    description += this.getTypicalDayDescription(role_type, profile.industry);
    description += `\n\n`;

    description += `**What We're Looking For**\n`;
    description += `- Reliable, professional, and safety-focused\n`;
    description += `- Team player with strong work ethic\n`;
    description += `- Good communication with customers and crew\n`;
    description += this.getRoleSpecificExpectations(role_type, profile.industry);

    description += `\n**Why Join Us?**\n`;
    description += `- Competitive pay and benefits\n`;
    description += `- Stable, year-round work\n`;
    description += `- Modern tools and equipment\n`;
    description += `- Training and career growth opportunities\n`;
    description += `- Family-owned business with great culture\n\n`;

    description += `**Apply Now**\n`;
    description += `Submit your application with resume and references. `;
    description += `We review applications daily and contact qualified candidates within 48 hours.`;

    return description;
  }

  /**
   * Get role description
   */
  private static getRoleDescription(role_type: RoleType): string {
    const descriptions: Record<RoleType, string> = {
      installer: 'skilled installer',
      technician: 'service technician',
      foreman: 'crew leader / foreman',
      office: 'office administrator',
      laborer: 'general laborer',
      apprentice: 'apprentice',
      dispatcher: 'dispatcher',
      sales: 'sales representative',
      other: 'team member'
    };
    return descriptions[role_type] || 'professional';
  }

  /**
   * Get typical day description by role
   */
  private static getTypicalDayDescription(role_type: RoleType, industry: string): string {
    switch (role_type) {
      case 'installer':
        return `You'll install ${industry.toLowerCase()} systems at residential and commercial properties. ` +
          `Work includes reading blueprints, running lines, mounting equipment, and testing installations. ` +
          `You'll work with a team and interact with customers on-site.`;

      case 'technician':
        return `You'll diagnose and repair ${industry.toLowerCase()} systems at customer locations. ` +
          `Work includes troubleshooting, replacing parts, preventive maintenance, and explaining recommendations to customers. ` +
          `You'll drive a company vehicle with tools and parts.`;

      case 'foreman':
        return `You'll lead a crew of 2-4 team members on installations and service calls. ` +
          `Responsibilities include job planning, crew coordination, quality control, and customer communication. ` +
          `You'll ensure safety, efficiency, and customer satisfaction.`;

      case 'laborer':
        return `You'll assist with material handling, site prep, cleanup, and basic tasks. ` +
          `Work includes loading/unloading, digging, carrying tools, and helping skilled trades. ` +
          `This is a great entry point to learn the trade.`;

      case 'apprentice':
        return `You'll learn the ${industry.toLowerCase()} trade while working alongside experienced technicians. ` +
          `We'll train you in tools, techniques, safety, and customer service. ` +
          `This role includes hands-on work and formal training.`;

      case 'dispatcher':
        return `You'll coordinate service calls, schedule jobs, communicate with customers and crew, and track job status. ` +
          `Work includes answering phones, routing technicians, and ensuring efficient operations.`;

      case 'office':
        return `You'll handle administrative tasks including scheduling, billing, customer inquiries, and paperwork. ` +
          `Work includes phone support, data entry, filing, and assisting the team.`;

      default:
        return `You'll support our ${industry} operations in a hands-on role. ` +
          `Specific duties will be discussed during the interview.`;
    }
  }

  /**
   * Get role-specific expectations
   */
  private static getRoleSpecificExpectations(role_type: RoleType, industry: string): string {
    let expectations = '';

    switch (role_type) {
      case 'installer':
      case 'technician':
        expectations += `- Valid driver's license (clean record preferred)\n`;
        expectations += `- Ability to lift 50+ lbs and work in various conditions\n`;
        expectations += `- Basic tool knowledge\n`;
        break;

      case 'foreman':
        expectations += `- 5+ years of field experience\n`;
        expectations += `- Proven leadership and communication skills\n`;
        expectations += `- Valid driver's license\n`;
        break;

      case 'laborer':
        expectations += `- No experience required (we'll train)\n`;
        expectations += `- Ability to lift 50+ lbs regularly\n`;
        expectations += `- Reliable transportation\n`;
        break;

      case 'apprentice':
        expectations += `- Eagerness to learn and grow\n`;
        expectations += `- High school diploma or GED\n`;
        expectations += `- Reliable transportation\n`;
        break;
    }

    return expectations;
  }

  /**
   * Generate requirements list
   */
  private static generateRequirements(input: HiringAgentInput): string[] {
    const { role_type, required_experience_years, required_certifications } = input;
    const requirements: string[] = [];

    // Experience
    if (required_experience_years) {
      requirements.push(`${required_experience_years}+ years of experience in ${input.profile.industry}`);
    } else if (role_type === 'foreman') {
      requirements.push('5+ years of field experience');
    } else if (role_type === 'installer' || role_type === 'technician') {
      requirements.push('2+ years of relevant experience');
    }

    // Driver's license
    if (['installer', 'technician', 'foreman', 'sales'].includes(role_type)) {
      requirements.push('Valid driver\'s license with clean driving record');
    }

    // Physical requirements
    if (['installer', 'technician', 'foreman', 'laborer'].includes(role_type)) {
      requirements.push('Ability to lift 50+ lbs and work in various weather conditions');
    }

    // Certifications
    if (required_certifications && required_certifications.length > 0) {
      required_certifications.forEach(cert => {
        requirements.push(cert);
      });
    } else if (input.profile.industry === 'HVAC' && role_type !== 'laborer') {
      requirements.push('EPA 608 certification (or willingness to obtain)');
    }

    // Background check
    requirements.push('Must pass background check and drug screening');

    return requirements;
  }

  /**
   * Generate benefits list
   */
  private static generateBenefits(input: HiringAgentInput): string[] {
    const benefits: string[] = [];

    // Start with provided benefits
    if (input.profile.existing_benefits && input.profile.existing_benefits.length > 0) {
      benefits.push(...input.profile.existing_benefits);
    }

    // Add standard contractor benefits
    const standard_benefits = [
      'Health insurance',
      'Paid time off',
      'Paid holidays',
      'Company vehicle and gas card',
      'Tool allowance',
      'Uniform provided',
      'Ongoing training and certifications',
      'Performance bonuses',
      'Referral bonuses',
      '401(k) retirement plan'
    ];

    // Add benefits not already listed
    standard_benefits.forEach(benefit => {
      if (!benefits.some(b => b.toLowerCase().includes(benefit.toLowerCase()))) {
        benefits.push(benefit);
      }
    });

    return benefits.slice(0, 8); // Top 8 benefits
  }

  /**
   * Generate screening questions
   */
  private static generateScreeningQuestions(input: HiringAgentInput): ScreeningQuestion[] {
    const { role_type, required_experience_years, required_certifications, profile } = input;
    const questions: ScreeningQuestion[] = [];

    // Experience question
    questions.push({
      question: `How many years of ${profile.industry} experience do you have?`,
      type: 'number',
      weight: 10,
      required: true,
      correct_answer: required_experience_years || 2
    });

    // Driver's license (for field roles)
    if (['installer', 'technician', 'foreman', 'sales'].includes(role_type)) {
      questions.push({
        question: 'Do you have a valid driver\'s license with a clean driving record?',
        type: 'yes_no',
        weight: 9,
        required: true,
        correct_answer: 'yes'
      });
    }

    // Certification (if applicable)
    if (profile.industry === 'HVAC' && role_type !== 'laborer') {
      questions.push({
        question: 'Do you have EPA 608 certification?',
        type: 'multiple_choice',
        weight: 7,
        required: true,
        choices: ['Yes - Universal', 'Yes - Type I or II', 'No, but willing to obtain', 'No'],
        correct_answer: 'Yes - Universal'
      });
    }

    // Physical ability
    if (['installer', 'technician', 'foreman', 'laborer'].includes(role_type)) {
      questions.push({
        question: 'Can you lift 50+ lbs regularly and work in various weather conditions?',
        type: 'yes_no',
        weight: 8,
        required: true,
        correct_answer: 'yes'
      });
    }

    // Work schedule
    questions.push({
      question: 'Are you available for full-time work, Monday-Friday (with occasional weekends)?',
      type: 'yes_no',
      weight: 9,
      required: true,
      correct_answer: 'yes'
    });

    // Customer service (for customer-facing roles)
    if (['technician', 'installer', 'sales'].includes(role_type)) {
      questions.push({
        question: 'Rate your comfort level interacting with customers (1-5)',
        type: 'number',
        weight: 6,
        required: true,
        scoring_criteria: 'Score 4 or 5 = 6 points, 3 = 3 points, 1-2 = 0 points'
      });
    }

    // Background check consent
    questions.push({
      question: 'Do you consent to a background check and drug screening?',
      type: 'yes_no',
      weight: 10,
      required: true,
      correct_answer: 'yes'
    });

    // Start date
    questions.push({
      question: 'How soon can you start if offered the position?',
      type: 'multiple_choice',
      weight: 5,
      required: true,
      choices: ['Immediately', 'Within 1 week', 'Within 2 weeks', '3-4 weeks', 'More than 4 weeks'],
      correct_answer: 'Within 1 week'
    });

    return questions;
  }

  /**
   * Generate posting schedule
   */
  private static generatePostingSchedule(role_type: RoleType): PostingSchedule {
    // Monday mornings = best time to post (highest engagement)
    return {
      primary_day: 'Monday',
      primary_time: '9:00 AM',
      refresh_days: ['Wednesday', 'Friday'],
      reasoning: 'Job seekers are most active early in the week. Refresh mid-week and Friday to stay visible.'
    };
  }

  /**
   * Estimate time to hire
   */
  private static estimateTimeToHire(role_type: RoleType, location: string): number {
    // Base estimates by role
    const base_days: Record<RoleType, number> = {
      laborer: 7,
      apprentice: 10,
      installer: 14,
      technician: 14,
      dispatcher: 14,
      office: 14,
      sales: 18,
      foreman: 21,
      other: 14
    };

    return base_days[role_type] || 14;
  }

  /**
   * Estimate applicant quality
   */
  private static estimateApplicantQuality(input: HiringAgentInput): 'low' | 'medium' | 'high' | 'very_high' {
    const { pay_min, pay_type, employment_type, profile } = input;

    // Higher pay = higher quality applicants
    if (pay_min && pay_type === 'hourly') {
      if (pay_min >= 28) return 'very_high';
      if (pay_min >= 22) return 'high';
      if (pay_min >= 18) return 'medium';
      return 'low';
    }

    // Full-time with benefits = higher quality
    if (employment_type === 'full_time' && profile.existing_benefits && profile.existing_benefits.length >= 3) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Recommend platforms
   */
  private static recommendPlatforms(
    role_type: RoleType,
    employment_type: EmploymentType
  ): PlatformRecommendation[] {
    const platforms: PlatformRecommendation[] = [];

    // Indeed - always top recommendation for contractors
    platforms.push({
      platform: 'indeed',
      priority: 1,
      reasoning: 'Largest job board with high contractor traffic. Best ROI for most roles.',
      estimated_reach: '500-1,500 views in first week',
      cost_estimate: '$5-15/day sponsored posting'
    });

    // Facebook - great for local blue-collar roles
    platforms.push({
      platform: 'facebook',
      priority: 2,
      reasoning: 'Strong local reach. Effective for laborer, installer, and technician roles.',
      estimated_reach: '300-800 views in local area',
      cost_estimate: 'Free organic post or $10-20/day boosted'
    });

    // Craigslist - still effective for local hourly roles
    if (['laborer', 'apprentice', 'installer'].includes(role_type)) {
      platforms.push({
        platform: 'craigslist',
        priority: 3,
        reasoning: 'Cost-effective for entry-level and hourly positions. Strong local reach.',
        estimated_reach: '100-300 views',
        cost_estimate: '$0-25 per posting'
      });
    }

    return platforms;
  }

  /**
   * Generate onboarding checklist
   */
  private static generateOnboardingChecklist(
    role_type: RoleType,
    industry: string
  ): OnboardingChecklistItem[] {
    // Return industry/role-specific checklist
    // These are pulled from system templates in database
    // For now, return generic checklist

    const generic_checklist: OnboardingChecklistItem[] = [
      {
        day: 1,
        task: 'Complete all hiring paperwork',
        owner: 'admin',
        description: 'I-9, W-4, direct deposit, emergency contact',
        completed: false
      },
      {
        day: 1,
        task: 'Issue PPE and uniform',
        owner: 'admin',
        description: 'Safety equipment and company clothing',
        completed: false
      },
      {
        day: 1,
        task: 'Safety orientation',
        owner: 'foreman',
        description: 'OSHA basics, company safety policies',
        completed: false
      },
      {
        day: 2,
        task: 'Shadow experienced team member',
        owner: 'foreman',
        description: 'Observe typical workday',
        completed: false
      },
      {
        day: 3,
        task: 'Tool and equipment training',
        owner: 'foreman',
        description: 'Locate, use, and care for tools',
        completed: false
      },
      {
        day: 4,
        task: 'Hands-on task assignments',
        owner: 'foreman',
        description: 'Begin performing role duties with supervision',
        completed: false
      },
      {
        day: 5,
        task: 'Company systems training',
        owner: 'admin',
        description: 'Timekeeping, job tracking, communication',
        completed: false
      },
      {
        day: 6,
        task: 'Customer interaction training',
        owner: 'foreman',
        description: 'Professional communication and service standards',
        completed: false
      },
      {
        day: 7,
        task: 'End-of-week review',
        owner: 'foreman',
        description: 'Performance feedback and goal setting',
        completed: false
      }
    ];

    return generic_checklist;
  }

  /**
   * Generate hiring timeline
   */
  private static generateHiringTimeline(role_type: RoleType): HiringTimeline {
    return {
      post_job: 'Day 1: Post job to Indeed, Facebook, and Craigslist',
      screening: 'Days 2-5: Review applications and screen top candidates',
      interviews: 'Days 6-10: Conduct phone screens and in-person interviews',
      decision: 'Days 11-12: Make job offer to top candidate',
      onboarding: 'Days 13-14: Complete paperwork and background check',
      start_date: 'Day 15: New hire first day'
    };
  }

  /**
   * Generate next steps
   */
  private static generateNextSteps(input: HiringAgentInput): string[] {
    return [
      'Review and customize the job ad copy',
      'Post to Indeed (highest priority)',
      'Share on Facebook business page and local groups',
      'Set up email notifications for new applications',
      'Prepare interview questions based on screening results',
      'Schedule time for first-round interviews next week'
    ];
  }
}
