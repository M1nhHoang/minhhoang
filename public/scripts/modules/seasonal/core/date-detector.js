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
  newyear: {
    id: 'newyear',
    name: 'Năm Mới',
    priority: 100,
    getDateRange: (year) => ({
      start: new Date(year, 11, 30), // Dec 30
      end: new Date(year + 1, 0, 3, 23, 59, 59) // Jan 3 next year
    })
  },
  lunarnewyear: {
    id: 'lunarnewyear',
    name: 'Tết Nguyên Đán',
    priority: 100,
    // Tết dates vary each year - calculated from lunar calendar
    // Quy ước: khoảng sự kiện Tết từ 28 tháng Chạp (âm lịch) đến hết mùng 7 (âm lịch).
    // Vì không tính âm lịch trực tiếp ở đây, ta map sẵn ngày Tết (mùng 1) theo dương lịch,
    // rồi suy ra: start = (mùng 1 - 2 ngày), end = (mùng 1 + 6 ngày).
    getDateRange: (year) => {
      const tetDates = {
        2025: { start: new Date(2025, 0, 27), end: new Date(2025, 1, 4, 23, 59, 59) },  // Tết 2025: 29/01
        2026: { start: new Date(2026, 1, 15), end: new Date(2026, 1, 23, 23, 59, 59) }, // Tết 2026: 17/02
        2027: { start: new Date(2027, 1, 4),  end: new Date(2027, 1, 12, 23, 59, 59) }, // Tết 2027: 06/02
        2028: { start: new Date(2028, 0, 24), end: new Date(2028, 1, 1, 23, 59, 59) },  // Tết 2028: 26/01
        2029: { start: new Date(2029, 1, 11), end: new Date(2029, 1, 19, 23, 59, 59) }, // Tết 2029: 13/02
        2030: { start: new Date(2030, 1, 1),  end: new Date(2030, 1, 9, 23, 59, 59) },  // Tết 2030: 03/02
        2031: { start: new Date(2031, 0, 21), end: new Date(2031, 0, 29, 23, 59, 59) }, // Tết 2031: 23/01
        2032: { start: new Date(2032, 1, 9),  end: new Date(2032, 1, 17, 23, 59, 59) }, // Tết 2032: 11/02
        2033: { start: new Date(2033, 0, 29), end: new Date(2033, 1, 6, 23, 59, 59) },  // Tết 2033: 31/01
        2034: { start: new Date(2034, 1, 17), end: new Date(2034, 1, 25, 23, 59, 59) }  // Tết 2034: 19/02
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
