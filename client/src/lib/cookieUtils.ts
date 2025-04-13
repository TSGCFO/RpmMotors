// Cookie utility functions

// Set a cookie with default or provided options
export function setCookie(
  name: string,
  value: string,
  options: {
    days?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  const {
    days = 30,
    path = '/',
    domain = '',
    secure = true,
    sameSite = 'lax'
  } = options;

  // Calculate expiration date
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);

  // Build cookie string
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookieString += `; expires=${expirationDate.toUTCString()}`;
  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; samesite=${sameSite}`;

  // Set cookie
  document.cookie = cookieString;
}

// Get a cookie value by name
export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  return null;
}

// Delete a cookie by name
export function deleteCookie(name: string, path = '/'): void {
  // Setting expiration in the past effectively deletes the cookie
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

// Check if user has given consent for cookies
export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export function hasConsentedToCookies(): boolean {
  return getCookie('cookie_consent') === 'true';
}

export function getConsentPreferences(): ConsentPreferences | null {
  const preferencesStr = localStorage.getItem('cookie_preferences');
  if (!preferencesStr) return null;
  
  try {
    return JSON.parse(preferencesStr) as ConsentPreferences;
  } catch (e) {
    console.error('Error parsing cookie preferences', e);
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  const preferences = getConsentPreferences();
  return !!preferences?.analytics;
}

export function hasMarketingConsent(): boolean {
  const preferences = getConsentPreferences();
  return !!preferences?.marketing;
}

export function hasPersonalizationConsent(): boolean {
  const preferences = getConsentPreferences();
  return !!preferences?.personalization;
}

// Save user's cookie consent preference
export function saveConsentPreference(consent: boolean): void {
  setCookie('cookie_consent', consent ? 'true' : 'false', { days: 365 });
  
  // If consent is given, set initial session data
  if (consent) {
    // Initialize session if it doesn't exist
    if (!getSessionId()) {
      createNewSession();
    }
    
    // Set user visit count
    const visits = getUserVisitCount();
    setUserVisitCount(visits + 1);
  }
}

//
// User preference and tracking cookies
//

// Save recently viewed vehicle IDs
export function saveRecentlyViewedVehicle(vehicleId: number): void {
  if (!hasConsentedToCookies()) return;
  
  const recentlyViewed = getRecentlyViewedVehicles();
  
  // Add vehicle ID if not already in list
  if (!recentlyViewed.includes(vehicleId)) {
    // Add to the beginning of the array
    recentlyViewed.unshift(vehicleId);
    
    // Keep only the most recent 5 vehicles
    const limitedList = recentlyViewed.slice(0, 5);
    
    // Save back to cookie
    setCookie('recently_viewed_vehicles', JSON.stringify(limitedList), { days: 30 });
    
    // Track this for analytics
    trackVehicleInterest(vehicleId);
  }
}

// Get list of recently viewed vehicle IDs
export function getRecentlyViewedVehicles(): number[] {
  const cookieValue = getCookie('recently_viewed_vehicles');
  if (!cookieValue) return [];
  
  try {
    return JSON.parse(cookieValue);
  } catch (e) {
    return [];
  }
}

// Save user's filter preferences
export function saveFilterPreferences(filters: Record<string, string>): void {
  if (!hasConsentedToCookies()) return;
  setCookie('filter_preferences', JSON.stringify(filters), { days: 30 });
  
  // Track this for user preference analytics
  trackUserPreferences('filters', filters);
}

// Get user's filter preferences
export function getFilterPreferences(): Record<string, string> | null {
  if (!hasConsentedToCookies()) return null;
  
  const cookieValue = getCookie('filter_preferences');
  if (!cookieValue) return null;
  
  try {
    return JSON.parse(cookieValue);
  } catch (e) {
    return null;
  }
}

// Track user's browsing session data for A/B testing
export function trackPageView(path: string): void {
  if (!hasConsentedToCookies()) return;
  
  // Get current session data
  const sessionData = getSessionData();
  
  // Add this page view
  sessionData.pageViews.push({
    path,
    timestamp: new Date().toISOString()
  });
  
  // Save updated session data
  saveSessionData(sessionData);
}

//
// Analytics & Insights Cookies
//

// Get count of vehicles viewed by user
export function getViewedVehiclesCount(): number {
  const cookieValue = getCookie('viewed_vehicles_count');
  return cookieValue ? parseInt(cookieValue, 10) : 0;
}

// Save user's viewed vehicles count for analytics
export function incrementViewedVehiclesCount(): void {
  if (!hasConsentedToCookies()) return;
  
  const currentCount = getViewedVehiclesCount();
  setCookie('viewed_vehicles_count', String(currentCount + 1), { days: 30 });
}

// Get a unique session ID for this browsing session
export function getSessionId(): string | null {
  return getCookie('session_id');
}

// Create a new session ID
function createNewSession(): string {
  const sessionId = generateUniqueId();
  setCookie('session_id', sessionId, { days: 1 }); // Sessions expire after 1 day
  
  // Initialize empty session data
  saveSessionData({
    id: sessionId,
    startTime: new Date().toISOString(),
    pageViews: [],
    vehicleInterests: [], 
    userPreferences: {},
    referrer: document.referrer || 'direct',
    utmSource: getQueryParam('utm_source'),
    utmMedium: getQueryParam('utm_medium'),
    utmCampaign: getQueryParam('utm_campaign')
  });
  
  return sessionId;
}

// Get UTM parameters from URL
function getQueryParam(name: string): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

// Generate a unique ID for session tracking
function generateUniqueId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Session data interface
interface SessionData {
  id: string;
  startTime: string;
  pageViews: { path: string; timestamp: string }[];
  vehicleInterests: { id: number; timestamp: string }[];
  userPreferences: Record<string, any>;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

// Save session data
function saveSessionData(data: SessionData): void {
  setCookie('session_data', JSON.stringify(data), { days: 1 });
}

// Get session data
function getSessionData(): SessionData {
  const cookieValue = getCookie('session_data');
  if (!cookieValue) {
    // Create default empty session
    const sessionId = getSessionId() || createNewSession();
    return {
      id: sessionId,
      startTime: new Date().toISOString(),
      pageViews: [],
      vehicleInterests: [],
      userPreferences: {},
      referrer: document.referrer || 'direct',
      utmSource: getQueryParam('utm_source'),
      utmMedium: getQueryParam('utm_medium'),
      utmCampaign: getQueryParam('utm_campaign')
    };
  }
  
  try {
    return JSON.parse(cookieValue);
  } catch (e) {
    // If parsing fails, create a new session
    return {
      id: getSessionId() || createNewSession(),
      startTime: new Date().toISOString(),
      pageViews: [],
      vehicleInterests: [],
      userPreferences: {},
      referrer: document.referrer || 'direct',
      utmSource: getQueryParam('utm_source'),
      utmMedium: getQueryParam('utm_medium'),
      utmCampaign: getQueryParam('utm_campaign')
    };
  }
}

// Track vehicle interest for analytics
function trackVehicleInterest(vehicleId: number): void {
  if (!hasConsentedToCookies()) return;
  
  // Get current session data
  const sessionData = getSessionData();
  
  // Add this vehicle interest
  sessionData.vehicleInterests.push({
    id: vehicleId,
    timestamp: new Date().toISOString()
  });
  
  // Save updated session data
  saveSessionData(sessionData);
  
  // Update popular vehicles list
  updatePopularVehicles(vehicleId);
}

// Track user preferences for personalization
function trackUserPreferences(type: string, data: any): void {
  if (!hasConsentedToCookies()) return;
  
  // Get current session data
  const sessionData = getSessionData();
  
  // Update preferences
  sessionData.userPreferences[type] = data;
  
  // Save updated session data
  saveSessionData(sessionData);
}

// Set user visit count
function setUserVisitCount(count: number): void {
  if (!hasConsentedToCookies()) return;
  setCookie('user_visit_count', String(count), { days: 365 });
}

// Get user visit count
export function getUserVisitCount(): number {
  const cookieValue = getCookie('user_visit_count');
  return cookieValue ? parseInt(cookieValue, 10) : 0;
}

//
// Marketing & Retargeting Cookies
//

// Track UTM parameters for marketing effectiveness
export function trackUtmParameters(): void {
  if (!hasConsentedToCookies()) return;
  
  const utmSource = getQueryParam('utm_source');
  const utmMedium = getQueryParam('utm_medium');
  const utmCampaign = getQueryParam('utm_campaign');
  
  if (utmSource || utmMedium || utmCampaign) {
    // Store UTM parameters in cookies
    if (utmSource) setCookie('utm_source', utmSource, { days: 30 });
    if (utmMedium) setCookie('utm_medium', utmMedium, { days: 30 });
    if (utmCampaign) setCookie('utm_campaign', utmCampaign, { days: 30 });
    
    // Add to visit sources list
    addToVisitSources({
      source: utmSource || 'unknown',
      medium: utmMedium || 'unknown',
      campaign: utmCampaign || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
}

// Store information about visit sources for attribution
interface VisitSource {
  source: string;
  medium: string;
  campaign: string;
  timestamp: string;
}

// Add to visit sources
function addToVisitSources(data: VisitSource): void {
  const sources = getVisitSources();
  sources.push(data);
  
  // Keep only the most recent 10 sources
  const limitedList = sources.slice(-10);
  
  setCookie('visit_sources', JSON.stringify(limitedList), { days: 90 });
}

// Get visit sources
function getVisitSources(): VisitSource[] {
  const cookieValue = getCookie('visit_sources');
  if (!cookieValue) return [];
  
  try {
    return JSON.parse(cookieValue);
  } catch (e) {
    return [];
  }
}

//
// Targeted Content & Recommendations
//

// Get popular vehicles based on user interests
export function getPopularVehicles(): number[] {
  const cookieValue = getCookie('popular_vehicles');
  if (!cookieValue) return [];
  
  try {
    // Format is an array of [vehicleId, count] pairs
    const vehicleCounts: [number, number][] = JSON.parse(cookieValue);
    // Sort by count (highest first) and return just the IDs
    return vehicleCounts
      .sort((a, b) => b[1] - a[1])
      .map(pair => pair[0]);
  } catch (e) {
    return [];
  }
}

// Update the popular vehicles list
function updatePopularVehicles(vehicleId: number): void {
  const cookieValue = getCookie('popular_vehicles');
  let vehicleCounts: [number, number][] = [];
  
  if (cookieValue) {
    try {
      vehicleCounts = JSON.parse(cookieValue);
    } catch (e) {
      vehicleCounts = [];
    }
  }
  
  // Find if this vehicle is already in the list
  const existingIndex = vehicleCounts.findIndex(pair => pair[0] === vehicleId);
  
  if (existingIndex >= 0) {
    // Increment the count
    vehicleCounts[existingIndex][1]++;
  } else {
    // Add new vehicle with count 1
    vehicleCounts.push([vehicleId, 1]);
  }
  
  // Save back to cookie
  setCookie('popular_vehicles', JSON.stringify(vehicleCounts), { days: 30 });
}

//
// A/B Testing
//

// Get the current A/B test variant for this user
export function getABTestVariant(testName: string): string {
  const cookieValue = getCookie(`abtest_${testName}`);
  if (cookieValue) return cookieValue;
  
  // If no variant assigned yet, randomly assign one
  const variants = ['A', 'B'];
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  
  setCookie(`abtest_${testName}`, randomVariant, { days: 90 });
  return randomVariant;
}

// Track an A/B test conversion
export function trackABTestConversion(testName: string, action: string): void {
  if (!hasConsentedToCookies()) return;
  
  const variant = getABTestVariant(testName);
  
  // Get current conversions
  const cookieValue = getCookie(`abtest_${testName}_conversions`);
  let conversions: { action: string, timestamp: string }[] = [];
  
  if (cookieValue) {
    try {
      conversions = JSON.parse(cookieValue);
    } catch (e) {
      conversions = [];
    }
  }
  
  // Add this conversion
  conversions.push({
    action,
    timestamp: new Date().toISOString()
  });
  
  // Save back to cookie
  setCookie(`abtest_${testName}_conversions`, JSON.stringify(conversions), { days: 90 });
  
  // This data would typically be sent to a server for analysis
  console.log(`A/B Test: ${testName}, Variant: ${variant}, Action: ${action}`);
}