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
export function hasConsentedToCookies(): boolean {
  return getCookie('cookie_consent') === 'true';
}

// Save user's cookie consent preference
export function saveConsentPreference(consent: boolean): void {
  setCookie('cookie_consent', consent ? 'true' : 'false', { days: 365 });
}

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

// Save user's viewed vehicles count for analytics
export function incrementViewedVehiclesCount(): void {
  if (!hasConsentedToCookies()) return;
  
  const currentCount = getViewedVehiclesCount();
  setCookie('viewed_vehicles_count', String(currentCount + 1), { days: 30 });
}

// Get count of vehicles viewed by user
export function getViewedVehiclesCount(): number {
  const cookieValue = getCookie('viewed_vehicles_count');
  return cookieValue ? parseInt(cookieValue, 10) : 0;
}