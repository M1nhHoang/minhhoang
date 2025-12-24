/**
 * Seasonal Date Detector
 * Detects current season and special events based on date
 */

/**
 * Event definitions with date ranges
 * Priority: higher number = higher priority (events override seasons)
 */
const EVENTS = {
  // Special holidays (highest priority)
  christmas: {
    id: 'christmas',
    name: 'Giáng Sinh',
    priority: 100,
    getDateRange: (year) => ({
      start: new Date(year, 11, 20), // Dec 20
      end: new Date(year, 11, 26, 23, 59, 59) // Dec 26
    })
  },
  tet: {
    id: 'tet',
    name: 'Tết Nguyên Đán',
    priority: 100,
    // Tết dates vary each year - this is approximate
    // In real implementation, you'd calculate from lunar calendar
    getDateRange: (year) => {
      // Approximate Tết dates (usually late Jan - mid Feb)
      // This should be updated yearly or calculated from lunar calendar
      const tetDates = {
        2025: { start: new Date(2025, 0, 25), end: new Date(2025, 1, 9) },
        2026: { start: new Date(2026, 1, 14), end: new Date(2026, 1, 28) },
        2027: { start: new Date(2027, 1, 3), end: new Date(2027, 1, 17) }
      };
      return tetDates[year] || { start: new Date(year, 0, 25), end: new Date(year, 1, 9) };
    }
  },
  valentine: {
    id: 'valentine',
    name: 'Valentine',
    priority: 90,
    getDateRange: (year) => ({
      start: new Date(year, 1, 12), // Feb 12
      end: new Date(year, 1, 15, 23, 59, 59) // Feb 15
    })
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    priority: 90,
    getDateRange: (year) => ({
      start: new Date(year, 9, 25), // Oct 25
      end: new Date(year, 10, 1, 23, 59, 59) // Nov 1
    })
  },
  
  // Seasons (lower priority)
  spring: {
    id: 'spring',
    name: 'Mùa Xuân',
    priority: 10,
    getDateRange: (year) => ({
      start: new Date(year, 1, 15), // Feb 15
      end: new Date(year, 4, 15, 23, 59, 59) // May 15
    })
  },
  summer: {
    id: 'summer',
    name: 'Mùa Hè',
    priority: 10,
    getDateRange: (year) => ({
      start: new Date(year, 4, 16), // May 16
      end: new Date(year, 7, 31, 23, 59, 59) // Aug 31
    })
  },
  autumn: {
    id: 'autumn',
    name: 'Mùa Thu',
    priority: 10,
    getDateRange: (year) => ({
      start: new Date(year, 8, 1), // Sep 1
      end: new Date(year, 10, 15, 23, 59, 59) // Nov 15
    })
  },
  winter: {
    id: 'winter',
    name: 'Mùa Đông',
    priority: 10,
    getDateRange: (year) => ({
      // Winter spans across years
      start: new Date(year, 10, 16), // Nov 16
      end: new Date(year + 1, 1, 14, 23, 59, 59) // Feb 14 next year
    })
  }
};

/**
 * Check if a date falls within a range
 */
function isDateInRange(date, start, end) {
  return date >= start && date <= end;
}

/**
 * Detect current season based on date
 * @param {Date} date - Date to check (defaults to now)
 * @returns {string} Season id
 */
export function detectSeason(date = new Date()) {
  const year = date.getFullYear();
  
  // Check winter specially since it spans years
  const winterCurrent = EVENTS.winter.getDateRange(year);
  const winterPrevious = EVENTS.winter.getDateRange(year - 1);
  
  if (isDateInRange(date, winterCurrent.start, winterCurrent.end) ||
      isDateInRange(date, winterPrevious.start, winterPrevious.end)) {
    return 'winter';
  }
  
  // Check other seasons
  for (const [id, event] of Object.entries(EVENTS)) {
    if (['spring', 'summer', 'autumn'].includes(id)) {
      const range = event.getDateRange(year);
      if (isDateInRange(date, range.start, range.end)) {
        return id;
      }
    }
  }
  
  return 'winter'; // Default fallback
}

/**
 * Detect active special events
 * @param {Date} date - Date to check
 * @returns {Array} Array of active event ids, sorted by priority
 */
export function detectEvents(date = new Date()) {
  const year = date.getFullYear();
  const activeEvents = [];
  
  for (const [id, event] of Object.entries(EVENTS)) {
    // Skip seasons, only check special events
    if (['spring', 'summer', 'autumn', 'winter'].includes(id)) continue;
    
    const range = event.getDateRange(year);
    if (isDateInRange(date, range.start, range.end)) {
      activeEvents.push({
        id,
        name: event.name,
        priority: event.priority
      });
    }
  }
  
  // Sort by priority (highest first)
  return activeEvents.sort((a, b) => b.priority - a.priority);
}

/**
 * Get the active theme id based on current date
 * Returns the highest priority event, or current season
 * @param {Date} date - Date to check
 * @returns {Object} { themeId, themeName, isEvent, season }
 */
export function getActiveTheme(date = new Date()) {
  const season = detectSeason(date);
  const events = detectEvents(date);
  
  if (events.length > 0) {
    const topEvent = events[0];
    return {
      themeId: topEvent.id,
      themeName: topEvent.name,
      isEvent: true,
      season
    };
  }
  
  const seasonInfo = EVENTS[season];
  return {
    themeId: season,
    themeName: seasonInfo?.name || 'Default',
    isEvent: false,
    season
  };
}

/**
 * Get all registered events and seasons
 */
export function getAllThemes() {
  return Object.entries(EVENTS).map(([id, event]) => ({
    id,
    name: event.name,
    priority: event.priority,
    isEvent: event.priority > 50
  }));
}

export default {
  detectSeason,
  detectEvents,
  getActiveTheme,
  getAllThemes,
  EVENTS
};
