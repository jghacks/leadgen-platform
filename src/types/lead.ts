export type ReachabilityTier = "HOT_LEAD" | "VERY_LIKELY" | "MEDIUM" | "LOW_PRIORITY";
export type LeadStatus = "NEW" | "CONTACTED" | "INTERESTED" | "PROPOSAL_SENT" | "NEGOTIATING" | "WON" | "LOST" | "NOT_INTERESTED" | "DO_NOT_CONTACT";
export type LeadSource = "GOOGLE_MAPS" | "YELP" | "BBB" | "FACEBOOK" | "LINKEDIN" | "CHAMBER_OF_COMMERCE" | "MANUAL" | "IMPORT";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Lead {
  id: string;
  userId: string;
  businessName: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  niche: string;
  category?: string;
  description?: string;
  googleRating?: number;
  reviewCount?: number;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  source: LeadSource;
  googlePlaceId?: string;
  websiteAge?: number;
  techStack?: string[];
  hasSSL?: boolean;
  isMobileOptimized?: boolean;
  hasOnlineBooking?: boolean;
  hasChatbot?: boolean;
  hasAI?: boolean;
  hasEcommerce?: boolean;
  seoScore?: number;
  performanceScore?: number;
  designScore?: number;
  pageSpeedDesktop?: number;
  pageSpeedMobile?: number;
  estimatedTraffic?: number;
  estimatedRevenue?: string;
  runsAds?: boolean;
  reachabilityScore?: number;
  reachabilityTier?: ReachabilityTier;
  reachabilityFactors?: ReachabilityFactors;
  status: LeadStatus;
  priority: Priority;
  dealValue?: number;
  pipelineStageId?: string;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  lastContactedAt?: string;
  followUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReachabilityFactors {
  respondsToReviews: boolean;
  activeSocialMedia: boolean;
  modernWebsite: boolean;
  runsAds: boolean;
  weakBranding: boolean;
  competitorsBetter: boolean;
  publicContact: boolean;
  websiteAbandoned: boolean;
  websiteBroken: boolean;
}

export interface ScraperFilters {
  niche: string;
  location: string;
  city?: string;
  state?: string;
  radius: number;
  minReviews: number;
  requireWebsite: boolean;
  requireEmail: boolean;
  outdatedWebsiteOnly: boolean;
  aiOpportunityOnly: boolean;
  minReachabilityScore?: number;
}

export interface ScraperResult {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  totalFound: number;
  processed: number;
  leads: Lead[];
}

export interface LeadWithRelations extends Lead {
  audit?: AuditSummary;
  outreaches?: OutreachSummary[];
  crmNotes?: CrmNote[];
  generatedWebsite?: WebsiteSummary;
  pipelineStage?: PipelineStageSummary;
}

interface AuditSummary {
  id: string;
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
  aiSummary?: string;
  createdAt: string;
}

interface OutreachSummary {
  id: string;
  type: string;
  status: string;
  sentAt?: string;
}

interface CrmNote {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

interface WebsiteSummary {
  id: string;
  status: string;
  deployedUrl?: string;
}

interface PipelineStageSummary {
  id: string;
  name: string;
  color: string;
}
