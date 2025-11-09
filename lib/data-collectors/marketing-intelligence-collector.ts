/**
 * Marketing Intelligence Data Collector
 * Enhanced web scraping focused on extracting marketing insights
 */

import * as cheerio from 'cheerio'

export interface MarketingIntelligence {
  website: string
  collectedAt: string

  // Brand & Messaging
  brandAnalysis: {
    businessName: string
    tagline?: string
    valueProp?: string
    headlines: string[]
    keyMessages: string[]
    tone: string // formal, casual, professional, friendly, etc.
    emotionalAppeal: string[]
  }

  // Content Analysis
  contentAnalysis: {
    hasBlog: boolean
    blogPostCount?: number
    recentBlogTitles?: string[]
    contentTypes: string[] // blog, video, podcast, case studies, etc.
    mediaRichness: number // 1-10 score based on images, videos, etc.
    contentTopics: string[]
  }

  // SEO Intelligence
  seoData: {
    metaTitle?: string
    metaDescription?: string
    h1Tags: string[]
    h2Tags: string[]
    targetKeywords: string[]
    imageCount: number
    imagesWithAlt: number
    internalLinks: number
    externalLinks: number
    hasSchema: boolean
    loadSpeed?: string
  }

  // Social Presence
  socialLinks: {
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    youtube?: string
    tiktok?: string
    pinterest?: string
  }

  // Conversion Elements
  conversionAnalysis: {
    ctaButtons: string[] // text of CTA buttons
    leadMagnets: string[] // free downloads, trials, etc.
    formsFound: number
    chatWidget: boolean
    phoneNumbers: string[]
    emailAddresses: string[]
    bookingSystem: boolean
  }

  // Competitive Intelligence
  competitiveSignals: {
    awardsAndCertifications: string[]
    yearsInBusiness?: string
    teamSize?: string
    serviceArea?: string
    priceSignals: string[] // "starting at $X", "from $X", etc.
    socialProof: {
      testimonialCount: number
      reviewBadges: string[]
      clientLogos: boolean
      caseStudies: boolean
    }
  }

  // Visual Brand
  visualBrand: {
    primaryColors: string[]
    logoFound: boolean
    imageStyle: string // professional, casual, stock photos, custom, etc.
    videoPresence: boolean
  }
}

export class MarketingIntelligenceCollector {
  /**
   * Collect comprehensive marketing intelligence from a website
   */
  async collect(url: string): Promise<MarketingIntelligence> {
    const startTime = Date.now()

    try {
      // Fetch the homepage
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Extract marketing intelligence
      const intelligence: MarketingIntelligence = {
        website: url,
        collectedAt: new Date().toISOString(),

        brandAnalysis: this.extractBrandAnalysis($, html),
        contentAnalysis: this.extractContentAnalysis($, url),
        seoData: this.extractSEOData($),
        socialLinks: this.extractSocialLinks($),
        conversionAnalysis: this.extractConversionElements($),
        competitiveSignals: this.extractCompetitiveSignals($),
        visualBrand: this.extractVisualBrand($, html),
      }

      console.log(`Marketing intelligence collected in ${Date.now() - startTime}ms`)

      return intelligence

    } catch (error) {
      console.error('Marketing intelligence collection failed:', error)
      throw error
    }
  }

  /**
   * Extract brand messaging and tone
   */
  private extractBrandAnalysis($: ReturnType<typeof cheerio.load>, html: string): MarketingIntelligence['brandAnalysis'] {
    // Business name
    const businessName =
      $('meta[property="og:site_name"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').text().split('|')[0].trim() ||
      'Unknown Business'

    // Tagline/slogan
    const tagline =
      $('meta[property="og:description"]').attr('content')?.substring(0, 100) ||
      $('h2').first().text().trim() ||
      $('p').first().text().trim().substring(0, 150)

    // Value proposition (usually in hero section)
    const valueProp =
      $('.hero h1, .hero h2, [class*="hero"] h1, [class*="hero"] h2').first().text().trim() ||
      $('h1').first().text().trim()

    // Headlines (all H1 and H2)
    const headlines = Array.from(new Set([
      ...$('h1').map((_, el) => $(el).text().trim()).get(),
      ...$('h2').map((_, el) => $(el).text().trim()).get()
        .filter(h => h.length > 0 && h.length < 200)
    ])).slice(0, 10)

    // Key messages from prominent paragraphs
    const keyMessages = $('.hero p, [class*="hero"] p, .value-prop, [class*="benefit"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(msg => msg.length > 20 && msg.length < 300)
      .slice(0, 5)

    // Detect tone by analyzing language
    const bodyText = $('body').text().toLowerCase()
    let tone = 'professional'

    if (bodyText.includes('we\'re') || bodyText.includes('you\'ll') || bodyText.includes('let\'s')) {
      tone = 'casual'
    }
    if (bodyText.includes('innovative') || bodyText.includes('cutting-edge') || bodyText.includes('industry-leading')) {
      tone = 'corporate'
    }
    if (bodyText.includes('friendly') || bodyText.includes('welcoming') || bodyText.includes('family')) {
      tone = 'friendly'
    }

    // Emotional appeal keywords
    const emotionalKeywords = [
      'trust', 'trusted', 'expert', 'experienced', 'passionate',
      'caring', 'dedicated', 'reliable', 'quality', 'premium',
      'affordable', 'fast', 'easy', 'simple', 'guaranteed'
    ]

    const emotionalAppeal = emotionalKeywords.filter(keyword =>
      bodyText.includes(keyword)
    )

    return {
      businessName,
      tagline: tagline || undefined,
      valueProp: valueProp || undefined,
      headlines,
      keyMessages,
      tone,
      emotionalAppeal
    }
  }

  /**
   * Extract content marketing intelligence
   */
  private extractContentAnalysis($: ReturnType<typeof cheerio.load>, url: string): MarketingIntelligence['contentAnalysis'] {
    const bodyText = $('body').text().toLowerCase()

    // Check for blog
    const hasBlog =
      bodyText.includes('blog') ||
      $('a[href*="blog"]').length > 0 ||
      $('a[href*="/posts"]').length > 0

    // Count blog posts if blog page is linked
    const blogLinks = $('a[href*="blog"], a[href*="/posts"]')
    const blogPostCount = blogLinks.length

    // Recent blog titles
    const recentBlogTitles = $('[class*="blog"] h2, [class*="blog"] h3, [class*="post"] h2')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(title => title.length > 0)
      .slice(0, 5)

    // Content types detected
    const contentTypes: string[] = []
    if (hasBlog) contentTypes.push('blog')
    if ($('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0) contentTypes.push('video')
    if (bodyText.includes('podcast') || $('a[href*="podcast"]').length > 0) contentTypes.push('podcast')
    if (bodyText.includes('case study') || bodyText.includes('case studies')) contentTypes.push('case-studies')
    if (bodyText.includes('whitepaper') || bodyText.includes('ebook')) contentTypes.push('downloads')
    if (bodyText.includes('webinar')) contentTypes.push('webinars')

    // Media richness score
    const imageCount = $('img').length
    const videoCount = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length
    const mediaRichness = Math.min(10, Math.round(
      (imageCount / 5) + (videoCount * 2)
    ))

    // Extract content topics from headings
    const allHeadings = $('h1, h2, h3')
      .map((_, el) => $(el).text().trim().toLowerCase())
      .get()

    // Simple topic extraction (look for common business topics)
    const topicKeywords = [
      'service', 'product', 'solution', 'pricing', 'about',
      'contact', 'testimonial', 'review', 'portfolio', 'work',
      'process', 'team', 'technology', 'industry', 'blog'
    ]

    const contentTopics = topicKeywords.filter(topic =>
      allHeadings.some(heading => heading.includes(topic))
    )

    return {
      hasBlog,
      blogPostCount: blogPostCount || undefined,
      recentBlogTitles: recentBlogTitles.length > 0 ? recentBlogTitles : undefined,
      contentTypes,
      mediaRichness,
      contentTopics
    }
  }

  /**
   * Extract SEO data
   */
  private extractSEOData($: ReturnType<typeof cheerio.load>): MarketingIntelligence['seoData'] {
    const metaTitle = $('title').text().trim()
    const metaDescription = $('meta[name="description"]').attr('content')

    const h1Tags = $('h1').map((_, el) => $(el).text().trim()).get()
    const h2Tags = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 10)

    // Extract potential target keywords from title and H1s
    const targetKeywords = [
      ...metaTitle.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3),
      ...h1Tags.flatMap(h1 => h1.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3))
    ]
    .filter((word: string, index: number, self: string[]) => self.indexOf(word) === index)
    .slice(0, 10)

    const images = $('img')
    const imageCount = images.length
    const imagesWithAlt = images.filter((_, el) => !!$(el).attr('alt')).length

    const internalLinks = $('a[href^="/"], a[href^="./"]').length
    const externalLinks = $('a[href^="http"]').length

    // Check for structured data (schema)
    const hasSchema =
      $('script[type="application/ld+json"]').length > 0 ||
      $('[itemscope]').length > 0

    return {
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      h1Tags,
      h2Tags,
      targetKeywords,
      imageCount,
      imagesWithAlt,
      internalLinks,
      externalLinks,
      hasSchema
    }
  }

  /**
   * Extract social media links
   */
  private extractSocialLinks($: ReturnType<typeof cheerio.load>): MarketingIntelligence['socialLinks'] {
    const links = $('a[href]').map((_, el) => $(el).attr('href')).get()

    const findSocial = (platform: string) =>
      links.find(link => link?.includes(platform))

    return {
      facebook: findSocial('facebook.com'),
      instagram: findSocial('instagram.com'),
      linkedin: findSocial('linkedin.com'),
      twitter: findSocial('twitter.com') || findSocial('x.com'),
      youtube: findSocial('youtube.com'),
      tiktok: findSocial('tiktok.com'),
      pinterest: findSocial('pinterest.com')
    }
  }

  /**
   * Extract conversion elements
   */
  private extractConversionElements($: ReturnType<typeof cheerio.load>): MarketingIntelligence['conversionAnalysis'] {
    // CTA buttons
    const ctaButtons = $('button, a.button, a.btn, [class*="cta"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(text => text.length > 0 && text.length < 50)
      .slice(0, 10)

    // Lead magnets
    const bodyText = $('body').text().toLowerCase()
    const leadMagnets: string[] = []

    if (bodyText.includes('free consultation')) leadMagnets.push('Free Consultation')
    if (bodyText.includes('free trial')) leadMagnets.push('Free Trial')
    if (bodyText.includes('free quote')) leadMagnets.push('Free Quote')
    if (bodyText.includes('download') && (bodyText.includes('guide') || bodyText.includes('ebook'))) {
      leadMagnets.push('Downloadable Resource')
    }
    if (bodyText.includes('webinar')) leadMagnets.push('Webinar')

    // Forms
    const formsFound = $('form').length

    // Chat widget
    const chatWidget =
      $('[class*="chat"], [id*="chat"], [class*="intercom"], [class*="drift"]').length > 0 ||
      bodyText.includes('live chat')

    // Contact info
    const phoneNumbers = $('body').text()
      .match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || []

    const emailAddresses = $('a[href^="mailto:"]')
      .map((_, el) => $(el).attr('href')?.replace('mailto:', ''))
      .get()
      .filter(Boolean) as string[]

    // Booking system
    const bookingSystem =
      bodyText.includes('book now') ||
      bodyText.includes('schedule') ||
      bodyText.includes('appointment') ||
      $('[class*="booking"], [class*="calendar"], [class*="schedule"]').length > 0

    return {
      ctaButtons,
      leadMagnets,
      formsFound,
      chatWidget,
      phoneNumbers: [...new Set(phoneNumbers)].slice(0, 3),
      emailAddresses: [...new Set(emailAddresses)].slice(0, 3),
      bookingSystem
    }
  }

  /**
   * Extract competitive signals
   */
  private extractCompetitiveSignals($: ReturnType<typeof cheerio.load>): MarketingIntelligence['competitiveSignals'] {
    const bodyText = $('body').text()

    // Awards and certifications
    const awardKeywords = ['award', 'certified', 'certification', 'accredited', 'rated', 'winner']
    const awardsAndCertifications = awardKeywords
      .flatMap(keyword => {
        const regex = new RegExp(`[^.]*${keyword}[^.]*\\.`, 'gi')
        return bodyText.match(regex) || []
      })
      .map(text => text.trim())
      .filter(text => text.length < 150)
      .slice(0, 5)

    // Years in business
    const yearsMatch = bodyText.match(/(\d{2,4})\s*years?\s*(of\s*experience|in\s*business)/i)
    const yearsInBusiness = yearsMatch ? yearsMatch[1] + ' years' : undefined

    // Team size
    const teamMatch = bodyText.match(/(\d+)\+?\s*(team members|employees|staff|professionals)/i)
    const teamSize = teamMatch ? teamMatch[1] + '+ team members' : undefined

    // Service area
    const locationMatch = bodyText.match(/(serving|located in|based in)\s+([^.,]{3,50})/i)
    const serviceArea = locationMatch ? locationMatch[2].trim() : undefined

    // Price signals
    const priceSignals = bodyText
      .match(/(starting at|from|as low as|only)\s*\$[\d,]+/gi) || []

    // Social proof
    const testimonialCount = $('[class*="testimonial"], [class*="review"]').length
    const reviewBadges = $('img[src*="google"], img[alt*="review"], img[alt*="rating"]')
      .map((_, el) => $(el).attr('alt') || 'Review Badge')
      .get()
      .slice(0, 3)

    const clientLogos = $('[class*="client"], [class*="logo"], [class*="partner"] img').length > 0
    const caseStudies = bodyText.toLowerCase().includes('case stud')

    return {
      awardsAndCertifications,
      yearsInBusiness,
      teamSize,
      serviceArea,
      priceSignals: priceSignals.slice(0, 5),
      socialProof: {
        testimonialCount,
        reviewBadges,
        clientLogos,
        caseStudies
      }
    }
  }

  /**
   * Extract visual brand elements
   */
  private extractVisualBrand($: ReturnType<typeof cheerio.load>, html: string): MarketingIntelligence['visualBrand'] {
    // Extract colors from inline styles (basic approach)
    const colorMatches = html.match(/#[0-9A-Fa-f]{6}/g) || []
    const primaryColors = [...new Set(colorMatches)].slice(0, 5)

    // Logo detection
    const logoFound = $('img[alt*="logo" i], [class*="logo"] img, #logo img').length > 0

    // Image style detection (basic)
    const imageUrls = $('img')
      .map((_, el) => $(el).attr('src') || '')
      .get()
      .filter(src => src.length > 0)

    let imageStyle = 'unknown'
    if (imageUrls.some(url => url.includes('unsplash') || url.includes('pexels') || url.includes('shutterstock'))) {
      imageStyle = 'stock-photos'
    } else if (imageUrls.length > 5) {
      imageStyle = 'custom'
    }

    // Video presence
    const videoPresence = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0

    return {
      primaryColors,
      logoFound,
      imageStyle,
      videoPresence
    }
  }

  /**
   * Generate marketing insights summary from collected data
   */
  generateInsightsSummary(intelligence: MarketingIntelligence): string {
    const insights: string[] = []

    // Brand insights
    insights.push(`Brand: ${intelligence.brandAnalysis.businessName}`)
    insights.push(`Tone: ${intelligence.brandAnalysis.tone}`)

    // Content insights
    if (intelligence.contentAnalysis.hasBlog) {
      insights.push(`✓ Has blog content`)
    } else {
      insights.push(`⚠ Missing blog - content opportunity`)
    }

    // SEO insights
    if (!intelligence.seoData.metaDescription) {
      insights.push(`⚠ Missing meta description`)
    }
    if (intelligence.seoData.imageCount > intelligence.seoData.imagesWithAlt) {
      insights.push(`⚠ ${intelligence.seoData.imageCount - intelligence.seoData.imagesWithAlt} images missing alt text`)
    }

    // Social insights
    const socialCount = Object.values(intelligence.socialLinks).filter(Boolean).length
    insights.push(`Social channels: ${socialCount}/7`)

    // Conversion insights
    if (intelligence.conversionAnalysis.leadMagnets.length === 0) {
      insights.push(`⚠ No lead magnets detected - missing opportunities`)
    }

    return insights.join('\n')
  }
}
