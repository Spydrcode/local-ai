/**
 * U.S. Census Bureau API Integration
 * Provides market sizing, demographic data, and business statistics
 * Docs: https://www.census.gov/data/developers/guidance/api-user-guide.html
 *
 * Cost: FREE (no API key required for most endpoints)
 * Data sources:
 * - American Community Survey (ACS) - Demographics
 * - County Business Patterns (CBP) - Business counts by industry
 * - Economic Census - Industry statistics
 */

export interface CensusDemographics {
  zipCode: string;
  population: number;
  medianHouseholdIncome: number;
  medianHomeValue: number;
  medianAge?: number;
  householdCount?: number;
  perCapitaIncome?: number;
}

export interface BusinessStatistics {
  stateCode: string;
  countyCode: string;
  naicsCode?: string;
  businessCount: number;
  employeeCount: number;
  annualPayroll?: number;
}

export interface MarketSizeEstimate {
  population: number;
  householdCount: number;
  medianIncome: number;
  estimatedCustomers: number;
  estimatedTAM: number; // Total Addressable Market
  estimatedSAM: number; // Serviceable Addressable Market
  estimatedSOM: number; // Serviceable Obtainable Market
}

/**
 * Get demographic data for a ZIP code
 * Uses American Community Survey 5-Year Data (most comprehensive)
 */
export async function getCensusDemographics(
  zipCode: string
): Promise<CensusDemographics | null> {
  try {
    // ACS 5-Year estimates (2021 data)
    // Variables:
    // B01003_001E = Total Population
    // B19013_001E = Median Household Income
    // B25077_001E = Median Home Value
    // B01002_001E = Median Age
    // B11001_001E = Total Households
    // B19301_001E = Per Capita Income

    const response = await fetch(
      `https://api.census.gov/data/2021/acs/acs5?` +
        new URLSearchParams({
          get: "B01003_001E,B19013_001E,B25077_001E,B01002_001E,B11001_001E,B19301_001E",
          for: `zip code tabulation area:${zipCode}`,
        }),
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      console.warn(`Census API warning: ${response.status} for ZIP ${zipCode}`);
      return null;
    }

    const data = await response.json();

    if (!data || data.length < 2) {
      console.log(`ℹ️  No Census data found for ZIP code ${zipCode}`);
      return null;
    }

    // Response format: [["B01003_001E", "B19013_001E", ...], [values...]]
    const values = data[1];

    const demographics: CensusDemographics = {
      zipCode: values[6],
      population: parseInt(values[0]) || 0,
      medianHouseholdIncome: parseInt(values[1]) || 0,
      medianHomeValue: parseInt(values[2]) || 0,
      medianAge: parseFloat(values[3]) || undefined,
      householdCount: parseInt(values[4]) || undefined,
      perCapitaIncome: parseInt(values[5]) || undefined,
    };

    console.log(
      `✅ Census demographics for ${zipCode}: ${demographics.population.toLocaleString()} pop, $${demographics.medianHouseholdIncome.toLocaleString()} median income`
    );

    return demographics;
  } catch (error: any) {
    if (error.name === "TimeoutError") {
      console.error("Census API timeout");
    } else {
      console.error("Error fetching Census demographics:", error.message);
    }
    return null;
  }
}

/**
 * Get business counts by industry (NAICS code) and location
 * Uses County Business Patterns data
 */
export async function getBusinessStatistics(
  stateCode: string,
  countyCode: string,
  naicsCode?: string
): Promise<BusinessStatistics | null> {
  try {
    const params: Record<string, string> = {
      get: "ESTAB,EMP,PAYANN",
      for: `county:${countyCode}`,
      in: `state:${stateCode}`,
    };

    if (naicsCode) {
      params["NAICS2017"] = naicsCode;
    }

    const response = await fetch(
      `https://api.census.gov/data/2021/cbp?${new URLSearchParams(params)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      console.warn(`Census CBP API warning: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data || data.length < 2) {
      return null;
    }

    const values = data[1];

    return {
      stateCode,
      countyCode,
      naicsCode,
      businessCount: parseInt(values[0]) || 0,
      employeeCount: parseInt(values[1]) || 0,
      annualPayroll: parseInt(values[2]) || undefined,
    };
  } catch (error: any) {
    console.error("Error fetching business statistics:", error.message);
    return null;
  }
}

/**
 * NAICS codes for common local business industries
 */
export const NAICS_CODES = {
  restaurants: "722",
  retail: "44-45",
  healthcare: "621",
  construction: "23",
  professional_services: "54",
  real_estate: "531",
  automotive: "441",
  beauty_salons: "812111",
  fitness: "713940",
  legal_services: "5411",
  accounting: "5412",
  marketing: "54181",
  home_services: "5617",
  education: "61",
  entertainment: "71",
};

/**
 * Convert ZIP code to state/county FIPS codes
 * Note: This is a simplified version. In production, use ZIP to FIPS lookup table
 */
export async function getCountyFromZip(
  zipCode: string
): Promise<{ stateCode: string; countyCode: string } | null> {
  try {
    // Use Census geocoding API
    const response = await fetch(
      `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?` +
        new URLSearchParams({
          address: zipCode,
          benchmark: "Public_AR_Current",
          vintage: "Current_Current",
          format: "json",
        }),
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const county =
      data.result?.addressMatches?.[0]?.geographies?.["Counties"]?.[0];

    if (!county) return null;

    return {
      stateCode: county.STATE,
      countyCode: county.COUNTY,
    };
  } catch (error) {
    console.error("Error geocoding ZIP:", error);
    return null;
  }
}

/**
 * Estimate Total Addressable Market (TAM), SAM, and SOM
 */
export async function estimateMarketSize(params: {
  zipCode: string;
  industry?: keyof typeof NAICS_CODES;
  averageTransactionValue: number;
  marketPenetrationRate?: number; // Default 5%
  serviceableMarketRate?: number; // Default 50% of TAM
  obtainableMarketRate?: number; // Default 10% of SAM
}): Promise<MarketSizeEstimate | null> {
  const {
    zipCode,
    industry,
    averageTransactionValue,
    marketPenetrationRate = 0.05,
    serviceableMarketRate = 0.5,
    obtainableMarketRate = 0.1,
  } = params;

  const demographics = await getCensusDemographics(zipCode);

  if (!demographics) {
    return null;
  }

  // TAM: Total population that could use the service
  const estimatedCustomers = Math.floor(
    demographics.population * marketPenetrationRate
  );
  const estimatedTAM = estimatedCustomers * averageTransactionValue;

  // SAM: Portion of TAM you can service (geographic/capability constraints)
  const serviceableCustomers = Math.floor(estimatedCustomers * serviceableMarketRate);
  const estimatedSAM = serviceableCustomers * averageTransactionValue;

  // SOM: Portion of SAM you can realistically capture
  const obtainableCustomers = Math.floor(serviceableCustomers * obtainableMarketRate);
  const estimatedSOM = obtainableCustomers * averageTransactionValue;

  console.log(
    `✅ Market size estimate for ${zipCode}: TAM=$${estimatedTAM.toLocaleString()}, SAM=$${estimatedSAM.toLocaleString()}, SOM=$${estimatedSOM.toLocaleString()}`
  );

  return {
    population: demographics.population,
    householdCount: demographics.householdCount || 0,
    medianIncome: demographics.medianHouseholdIncome,
    estimatedCustomers,
    estimatedTAM,
    estimatedSAM,
    estimatedSOM,
  };
}

/**
 * Get competitive landscape statistics for a location/industry
 */
export async function getCompetitiveLandscape(params: {
  zipCode: string;
  industry: keyof typeof NAICS_CODES;
}): Promise<{
  demographics: CensusDemographics | null;
  businessStats: BusinessStatistics | null;
  competitionDensity: string;
  marketOpportunity: string;
} | null> {
  const { zipCode, industry } = params;

  const demographics = await getCensusDemographics(zipCode);
  if (!demographics) return null;

  const county = await getCountyFromZip(zipCode);
  if (!county) {
    return {
      demographics,
      businessStats: null,
      competitionDensity: "unknown",
      marketOpportunity: "Unable to assess without county data",
    };
  }

  const naicsCode = NAICS_CODES[industry];
  const businessStats = await getBusinessStatistics(
    county.stateCode,
    county.countyCode,
    naicsCode
  );

  // Calculate competition density
  let competitionDensity = "moderate";
  let marketOpportunity = "moderate opportunity";

  if (businessStats && demographics.population > 0) {
    const businessesPerCapita = businessStats.businessCount / demographics.population;

    if (businessesPerCapita > 0.001) {
      competitionDensity = "high";
      marketOpportunity = "saturated market - differentiation critical";
    } else if (businessesPerCapita > 0.0005) {
      competitionDensity = "moderate";
      marketOpportunity = "competitive market - positioning important";
    } else {
      competitionDensity = "low";
      marketOpportunity = "underserved market - growth opportunity";
    }
  }

  return {
    demographics,
    businessStats,
    competitionDensity,
    marketOpportunity,
  };
}

/**
 * Get comprehensive market intelligence for a business
 */
export async function getMarketIntelligence(params: {
  zipCode: string;
  industry?: keyof typeof NAICS_CODES;
  averageTransactionValue?: number;
}): Promise<{
  demographics: CensusDemographics | null;
  marketSize: MarketSizeEstimate | null;
  competitiveLandscape: Awaited<ReturnType<typeof getCompetitiveLandscape>>;
  insights: string[];
  metadata: {
    source: string;
    collectedAt: string;
    hasData: boolean;
  };
}> {
  const startTime = Date.now();
  const { zipCode, industry, averageTransactionValue = 1000 } = params;

  const demographics = await getCensusDemographics(zipCode);

  const marketSize = await estimateMarketSize({
    zipCode,
    industry,
    averageTransactionValue,
  });

  const competitiveLandscape = industry
    ? await getCompetitiveLandscape({ zipCode, industry })
    : null;

  // Generate insights
  const insights: string[] = [];

  if (demographics) {
    if (demographics.medianHouseholdIncome > 75000) {
      insights.push("High-income area - premium pricing viable");
    } else if (demographics.medianHouseholdIncome < 50000) {
      insights.push("Budget-conscious market - value pricing recommended");
    }

    if (demographics.population > 50000) {
      insights.push("Large population - sufficient market density");
    } else if (demographics.population < 10000) {
      insights.push("Small population - may need to expand service area");
    }
  }

  if (competitiveLandscape) {
    insights.push(`Competition: ${competitiveLandscape.competitionDensity}`);
    insights.push(competitiveLandscape.marketOpportunity);
  }

  if (marketSize) {
    insights.push(
      `Estimated serviceable market: $${marketSize.estimatedSAM.toLocaleString()}/year`
    );
  }

  const duration = Date.now() - startTime;
  console.log(`✅ Market intelligence collection complete (${duration}ms)`);

  return {
    demographics,
    marketSize,
    competitiveLandscape,
    insights,
    metadata: {
      source: "census-bureau",
      collectedAt: new Date().toISOString(),
      hasData: demographics !== null,
    },
  };
}
