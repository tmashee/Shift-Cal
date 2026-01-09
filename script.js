class DualShiftCalendar {
    constructor() {
        this.currentDate = new Date();
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.shiftTypes = {
            DAY: 'day',
            NIGHT: 'night',
            OFF: 'off'
        };
        
        // Customizable Shift 1 Properties
        this.shift1Pattern = [3,-3,4,-4,3,-3,4,-4,4,-3,3,-4,4,-3,3,-4];
        this.shift1StartDate = this.getDefaultShift1StartDate(); // January 11, 2026
        this.shift1DayNightSwitch = 14; // Switch every 14 work days
        this.shift1StartsWithDay = false; // Starts with night shift

        // Customizable Shift 2 Properties
        this.shift2Type = 'cycle'; // cycle (legacy) or pattern
        this.shift2Pattern = [2,-2,3,-2,2,-3];
        this.shift2StartDate = new Date(2025, 5, 30); // June 30, 2025
        this.shift2DayNightSwitch = 14;
        this.shift2StartsWithDay = true;
        this.shift2CycleLength = 28;
        this.shift2CycleStartDate = new Date(2025, 5, 30);
        
        // Calendar display settings
        this.calendarWeeks = 5; // Number of weeks to show per month
        
        // Custom day overrides
        this.dayOverrides = new Map(); // Store individual day customizations
        
        // Toggle states for shift visibility
        this.shiftVisibility = {
            shift1: true,
            shift2: true
        };
        
        // Data persistence
        this.storageKey = 'dualShiftCalendar';
        this.settings = this.loadSettings();
        
        // Animation states
        this.isAnimating = false;
        
        // Calendar cache for performance
        this.calendarCache = new Map();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        this.updateToggleButtonStates();
        this.renderCalendar();
        this.setupPerformanceOptimizations();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {
                theme: 'default',
                showWeekNumbers: false,
                highlightWeekends: true,
                compactMode: false
            };
        } catch (e) {
            console.warn('Failed to load settings:', e);
            return {
                theme: 'default',
                showWeekNumbers: false,
                highlightWeekends: true,
                compactMode: false
            };
        }
    }

    getDefaultShift1StartDate() {
        return new Date(2026, 0, 11);
    }

    normalizeDates(preferencesLoaded = false) {
        if (!this.isValidDate(this.shift1StartDate)) {
            this.shift1StartDate = this.getDefaultShift1StartDate();
            if (preferencesLoaded) {
                console.warn('Invalid Shift 1 start date found in saved preferences. Reverting to default January 11, 2026.');
            }
        }

        if (!this.isValidDate(this.shift2StartDate)) {
            this.shift2StartDate = new Date(2025, 5, 30);
            if (preferencesLoaded) {
                console.warn('Invalid Shift 2 start date found in saved preferences. Reverting to default June 30, 2025.');
            }
        }

        if (!this.isValidDate(this.shift2CycleStartDate)) {
            this.shift2CycleStartDate = new Date(2025, 5, 30);
            if (preferencesLoaded) {
                console.warn('Invalid Shift 2 cycle start date found in saved preferences. Reverting to default June 30, 2025.');
            }
        }
    }

    isValidDate(value) {
        return value instanceof Date && !isNaN(value);
    }
    
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }
    
    loadUserPreferences() {
        let loaded = false;
        try {
            // Try to load new format first
            const newPreferences = localStorage.getItem(this.storageKey + '_preferences');
            if (newPreferences) {
                const prefs = JSON.parse(newPreferences);
                this.shiftVisibility = prefs.shiftVisibility || { shift1: true, shift2: true };
                
                // Load customizable settings if they exist
                if (prefs.shift1Pattern) this.shift1Pattern = prefs.shift1Pattern;
                if (prefs.shift1StartDate) this.shift1StartDate = new Date(prefs.shift1StartDate);
                if (prefs.shift1DayNightSwitch) this.shift1DayNightSwitch = prefs.shift1DayNightSwitch;
                if (prefs.shift1StartsWithDay !== undefined) this.shift1StartsWithDay = prefs.shift1StartsWithDay;
                if (prefs.shift2Type) this.shift2Type = prefs.shift2Type;
                if (prefs.shift2Pattern) this.shift2Pattern = prefs.shift2Pattern;
                if (prefs.shift2StartDate) this.shift2StartDate = new Date(prefs.shift2StartDate);
                if (prefs.shift2DayNightSwitch) this.shift2DayNightSwitch = prefs.shift2DayNightSwitch;
                if (prefs.shift2StartsWithDay !== undefined) this.shift2StartsWithDay = prefs.shift2StartsWithDay;
                if (prefs.shift2CycleLength) this.shift2CycleLength = prefs.shift2CycleLength;
                if (prefs.shift2CycleStartDate) this.shift2CycleStartDate = new Date(prefs.shift2CycleStartDate);
                if (prefs.calendarWeeks) this.calendarWeeks = prefs.calendarWeeks;
                if (prefs.settings) this.settings = { ...this.settings, ...prefs.settings };
                
                // Load day overrides
                if (prefs.dayOverrides) {
                    this.dayOverrides = new Map(prefs.dayOverrides); // Convert Array back to Map
                }
                loaded = true;
            }
            
            // Fallback to old format for backward compatibility
            const savedVisibility = localStorage.getItem(this.storageKey + '_visibility');
            if (savedVisibility) {
                this.shiftVisibility = JSON.parse(savedVisibility);
            }
        } catch (e) {
            console.warn('Failed to load preferences:', e);
            // Use defaults if loading fails
            this.shiftVisibility = { shift1: true, shift2: true };
            this.dayOverrides = new Map();
        }

        this.normalizeDates(loaded);
    }
    
    saveUserPreferences() {
        try {
            const preferences = {
                shiftVisibility: this.shiftVisibility,
                shift1Pattern: this.shift1Pattern,
                shift1StartDate: this.shift1StartDate.toISOString(),
                shift1DayNightSwitch: this.shift1DayNightSwitch,
                shift1StartsWithDay: this.shift1StartsWithDay,
                shift2Type: this.shift2Type,
                shift2Pattern: this.shift2Pattern,
                shift2StartDate: this.shift2StartDate.toISOString(),
                shift2DayNightSwitch: this.shift2DayNightSwitch,
                shift2StartsWithDay: this.shift2StartsWithDay,
                shift2CycleLength: this.shift2CycleLength,
                shift2CycleStartDate: this.shift2CycleStartDate.toISOString(),
                calendarWeeks: this.calendarWeeks,
                settings: this.settings,
                dayOverrides: Array.from(this.dayOverrides.entries()) // Convert Map to Array for storage
            };
            localStorage.setItem(this.storageKey + '_preferences', JSON.stringify(preferences));
        } catch (e) {
            console.warn('Failed to save preferences:', e);
        }
    }
    
    setupPerformanceOptimizations() {
        // Preload next and previous months for smoother navigation
        this.preloadAdjacentMonths();
        
        // Setup intersection observer for animations
        this.setupIntersectionObserver();
    }
    
    preloadAdjacentMonths() {
        const prevMonth = new Date(this.currentDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        
        const nextMonth = new Date(this.currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // Cache calculations for adjacent months
        [prevMonth, nextMonth].forEach(date => {
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (!this.calendarCache.has(key)) {
                this.cacheMonthData(date);
            }
        });
    }
    
    cacheMonthData(date) {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const monthData = this.calculateMonthShifts(date);
        this.calendarCache.set(key, monthData);
        
        // Limit cache size to prevent memory issues
        if (this.calendarCache.size > 12) {
            const firstKey = this.calendarCache.keys().next().value;
            this.calendarCache.delete(firstKey);
        }
    }
    
    setupIntersectionObserver() {
        if (typeof IntersectionObserver !== 'undefined') {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            }, { threshold: 0.1 });
        }
    }
    
    setupEventListeners() {
        const prevBtn = document.getElementById('prevYear');
        const nextBtn = document.getElementById('nextYear');
        const homeBtn = document.getElementById('homeBtn');
        const overlapBtn = document.getElementById('overlapBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const toggleShift1 = document.getElementById('toggleShift1');
        const toggleShift2 = document.getElementById('toggleShift2');
        
        prevBtn.addEventListener('click', () => this.previousYear());
        nextBtn.addEventListener('click', () => this.nextYear());
        homeBtn.addEventListener('click', () => this.goToToday());
        overlapBtn.addEventListener('click', () => this.showOverlapAnalysis());
        settingsBtn.addEventListener('click', () => this.showSettings());
        
        // Toggle button functionality
        toggleShift1.addEventListener('click', () => this.toggleShiftVisibility('shift1'));
        toggleShift2.addEventListener('click', () => this.toggleShiftVisibility('shift2'));
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousYear();
            if (e.key === 'ArrowRight') this.nextYear();
            if (e.key === 'Home' || (e.key === 'h' && !e.ctrlKey && !e.metaKey)) this.goToToday();
            if (e.key === '1') this.toggleShiftVisibility('shift1');
            if (e.key === '2') this.toggleShiftVisibility('shift2');
        });
    }
    
    previousYear() {
        this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
        this.renderCalendar();
    }
    
    nextYear() {
        this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
        this.renderCalendar();
    }
    
    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }
    
    toggleShiftVisibility(shiftKey) {
        this.shiftVisibility[shiftKey] = !this.shiftVisibility[shiftKey];
        
        // Update button appearance
        const button = document.getElementById('toggle' + shiftKey.charAt(0).toUpperCase() + shiftKey.slice(1));
        const icon = button.querySelector('.toggle-icon');
        
        if (this.shiftVisibility[shiftKey]) {
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            icon.className = 'fas fa-eye toggle-icon';
        } else {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
            icon.className = 'fas fa-eye-slash toggle-icon';
        }
        
        // Save preferences
        this.saveUserPreferences();
        
        // Re-render calendar with animation
        this.renderCalendarWithAnimation();
        
        // Log for debugging
        console.log(`Shift ${shiftKey} visibility: ${this.shiftVisibility[shiftKey] ? 'ON' : 'OFF'}`);
    }
    
    updateToggleButtonStates() {
        // Update Shift 1 button
        const toggleShift1 = document.getElementById('toggleShift1');
        const icon1 = toggleShift1.querySelector('.toggle-icon');
        if (this.shiftVisibility.shift1) {
            toggleShift1.classList.add('active');
            toggleShift1.setAttribute('aria-pressed', 'true');
            icon1.className = 'fas fa-eye toggle-icon';
        } else {
            toggleShift1.classList.remove('active');
            toggleShift1.setAttribute('aria-pressed', 'false');
            icon1.className = 'fas fa-eye-slash toggle-icon';
        }
        
        // Update Shift 2 button
        const toggleShift2 = document.getElementById('toggleShift2');
        const icon2 = toggleShift2.querySelector('.toggle-icon');
        if (this.shiftVisibility.shift2) {
            toggleShift2.classList.add('active');
            toggleShift2.setAttribute('aria-pressed', 'true');
            icon2.className = 'fas fa-eye toggle-icon';
        } else {
            toggleShift2.classList.remove('active');
            toggleShift2.setAttribute('aria-pressed', 'false');
            icon2.className = 'fas fa-eye-slash toggle-icon';
        }
    }
    
    renderCalendarWithAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const calendarMonths = document.getElementById('calendarMonths');
        
        if (calendarMonths) {
            // Fade out
            calendarMonths.style.opacity = '0.5';
            calendarMonths.style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                this.renderCalendar();
                
                // Fade in
                calendarMonths.style.opacity = '1';
                calendarMonths.style.transform = 'scale(1)';
                
                setTimeout(() => {
                    this.isAnimating = false;
                }, 300);
            }, 150);
        } else {
            // Fallback if element not found
            this.renderCalendar();
            this.isAnimating = false;
        }
    }
    
    renderCalendar() {
        this.updateHeader();
        this.renderMonths();
        this.preloadAdjacentMonths();
    }
    
    updateHeader() {
        const yearDisplay = document.getElementById('yearDisplay');
        const year = this.currentDate.getFullYear();
        yearDisplay.textContent = year;
    }
    
    renderMonths() {
        const calendarMonths = document.getElementById('calendarMonths');
        calendarMonths.innerHTML = '';
        
        const year = this.currentDate.getFullYear();
        
        // Create all 12 months for the current year
        for (let month = 0; month < 12; month++) {
            const monthSection = this.createMonthSection(year, month);
            calendarMonths.appendChild(monthSection);
        }
        
        // Scroll to current month if it's the current year
        const today = new Date();
        if (year === today.getFullYear()) {
            setTimeout(() => {
                const currentMonthSection = calendarMonths.children[today.getMonth()];
                if (currentMonthSection) {
                    currentMonthSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 100);
        }
    }
    
    createMonthSection(year, month) {
        const monthSection = document.createElement('div');
        monthSection.className = 'month-section';
        
        // Month header
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = `${this.monthNames[month]} ${year}`;
        monthSection.appendChild(monthHeader);
        
        // Weekdays header
        const weekdays = document.createElement('div');
        weekdays.className = 'weekdays';
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dayNames.forEach(day => {
            const weekday = document.createElement('div');
            weekday.className = 'weekday';
            weekday.textContent = day;
            weekdays.appendChild(weekday);
        });
        monthSection.appendChild(weekdays);
        
        // Days grid
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        
        const monthData = this.calculateMonthShifts(new Date(year, month, 1));
        
        monthData.forEach(dayData => {
            const dayCell = this.createDayCell(dayData, 0);
            daysGrid.appendChild(dayCell);
        });
        
        monthSection.appendChild(daysGrid);
        
        return monthSection;
    }
    
    getCurrentMonthYear() {
        return {
            month: this.currentDate.getMonth(),
            year: this.currentDate.getFullYear()
        };
    }
    
    calculateMonthShifts(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthData = [];
        
        // Get first day of the month and adjust for Monday start
        const firstDay = new Date(year, month, 1);
        let startDate = new Date(firstDay);
        const dayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        startDate.setDate(startDate.getDate() - dayOfWeek);
        
        // Calculate days based on configurable weeks (default 5 weeks = 35 days, 6 weeks = 42 days)
        const totalDays = this.calendarWeeks * 7;
        for (let i = 0; i < totalDays; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            monthData.push({
                date: new Date(currentDay),
                shifts: this.calculateShifts(currentDay),
                isCurrentMonth: currentDay.getMonth() === month,
                isToday: currentDay.toDateString() === new Date().toDateString()
            });
        }
        
        return monthData;
    }
    
    createDayCell(dayData, index) {
        const { date, shifts, isCurrentMonth, isToday } = dayData;
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        // Add CSS classes
        if (!isCurrentMonth) {
            dayCell.classList.add('other-month');
        }
        
        if (isToday) {
            dayCell.classList.add('today');
        }
        
        // Add weekend highlighting if enabled
        if (this.settings.highlightWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
            dayCell.classList.add('weekend');
        }
        
        // Add custom override indicator
        const dateKey = this.getDateKey(date);
        if (this.dayOverrides.has(dateKey)) {
            dayCell.classList.add('custom-override');
        }
        
        // Create day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayCell.appendChild(dayNumber);
        
        // Create shifts container
        const shiftsContainer = document.createElement('div');
        shiftsContainer.className = 'shifts-container';
        
        // Create shift elements with improved accessibility
        if (this.shiftVisibility.shift1) {
            const shift1 = this.createShiftElement(shifts.shift1, '1', date);
            shiftsContainer.appendChild(shift1);
        }
        
        if (this.shiftVisibility.shift2) {
            const shift2 = this.createShiftElement(shifts.shift2, '2', date);
            shiftsContainer.appendChild(shift2);
        }
        
        dayCell.appendChild(shiftsContainer);
        
        // Add click handler with data
        dayCell.addEventListener('click', () => this.onDayClick(date, shifts));
        
        // Add keyboard support
        dayCell.setAttribute('tabindex', '0');
        dayCell.setAttribute('role', 'button');
        dayCell.setAttribute('aria-label', this.getDayAriaLabel(date, shifts));
        
        // Animation delay for staggered effect
        dayCell.style.animationDelay = `${index * 10}ms`;
        
        return dayCell;
    }
    
    createShiftElement(shiftType, shiftNumber, date) {
        const shift = document.createElement('div');
        shift.className = `shift shift-${shiftType}`;
        
        const shiftLabel = document.createElement('div');
        shiftLabel.className = 'shift-label';
        shiftLabel.textContent = shiftNumber;
        
        const shiftText = document.createElement('div');
        shiftText.className = 'shift-text';
        shiftText.textContent = this.getShiftDisplayText(shiftType);
        
        shift.appendChild(shiftLabel);
        shift.appendChild(shiftText);
        
        // Add tooltip for additional information
        shift.title = `Shift ${shiftNumber}: ${this.getShiftDisplayText(shiftType)} on ${date.toLocaleDateString()}`;
        
        return shift;
    }
    
    getDayAriaLabel(date, shifts) {
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const shift1Text = this.shiftVisibility.shift1 ? `Shift 1: ${this.getShiftDisplayText(shifts.shift1)}` : '';
        const shift2Text = this.shiftVisibility.shift2 ? `Shift 2: ${this.getShiftDisplayText(shifts.shift2)}` : '';
        
        return `${dateStr}. ${shift1Text}${shift1Text && shift2Text ? ', ' : ''}${shift2Text}`;
    }
    
    onDayClick(date, shifts) {
        // Show day editor for customization
        this.showDayEditor(date, shifts);
        this.trackInteraction('day_click', { date: date, shifts: shifts });
    }
    
    showDayDetails(dateInfo) {
        // Show a modal with day details
        const modal = document.getElementById('dayDetailsModal');
        const content = document.getElementById('dayDetailsContent');
        if (!modal || !content) return;

        content.innerHTML = `
            <h2>${dateInfo.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            <div class="modal-shifts">
                <div class="modal-shift"><strong>Shift 1:</strong> ${this.getShiftDisplayText(dateInfo.shifts.shift1)}</div>
                <div class="modal-shift"><strong>Shift 2:</strong> ${this.getShiftDisplayText(dateInfo.shifts.shift2)}</div>
            </div>
            <div class="modal-today">${dateInfo.isToday ? '<span class="today-label">Today</span>' : ''}</div>
        `;
        modal.style.display = 'block';
        this.highlightDay(dateInfo.date);
    }
    
    highlightDay(date) {
        // Remove previous highlights
        document.querySelectorAll('.day-cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        // Find and highlight the selected day
        const dayNumber = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        
        if (month === this.currentDate.getMonth() && year === this.currentDate.getFullYear()) {
            const dayCells = document.querySelectorAll('.day-cell:not(.other-month)');
            const dayCell = Array.from(dayCells).find(cell => {
                const cellDayNumber = parseInt(cell.querySelector('.day-number').textContent);
                return cellDayNumber === dayNumber;
            });
            
            if (dayCell) {
                dayCell.classList.add('highlighted');
                setTimeout(() => dayCell.classList.remove('highlighted'), 2000);
            }
        }
    }
    
    trackInteraction(action, data) {
        // Analytics/tracking placeholder
        console.log('Interaction tracked:', action, data);
    }
    
    calculateShifts(date) {
        // Check for day-specific overrides first
        const dateKey = this.getDateKey(date);
        const override = this.dayOverrides.get(dateKey);
        
        // Calculate pattern-based shifts
        const patternShifts = {
            shift1: this.calculateShift1(date),
            shift2: this.calculateShift2(date)
        };
        
        // Apply overrides if they exist
        if (override) {
            return {
                shift1: override.shift1 !== undefined ? override.shift1 : patternShifts.shift1,
                shift2: override.shift2 !== undefined ? override.shift2 : patternShifts.shift2
            };
        }
        
        return patternShifts;
    }
    
    calculatePatternShift(date, options) {
        const { pattern, startDate, dayNightSwitch, startsWithDay } = options;
        if (!Array.isArray(pattern) || pattern.length === 0) {
            return this.shiftTypes.OFF;
        }
        const referenceDate = startDate;
        const timeDiff = date.getTime() - referenceDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const totalPatternDays = pattern.reduce((sum, num) => sum + Math.abs(num), 0);
        if (totalPatternDays === 0) return this.shiftTypes.OFF;
        const cycleDay = ((daysDiff % totalPatternDays) + totalPatternDays) % totalPatternDays;

        let currentDay = 0;
        let workDaysSeenSoFar = 0;

        for (let i = 0; i < pattern.length; i++) {
            const segmentLength = Math.abs(pattern[i]);
            const isWorkSegment = pattern[i] > 0;

            if (cycleDay >= currentDay && cycleDay < currentDay + segmentLength) {
                if (!isWorkSegment) {
                    return this.shiftTypes.OFF;
                }

                const dayInSegment = cycleDay - currentDay;
                const workDayNumber = workDaysSeenSoFar + dayInSegment + 1;
                const switchInterval = dayNightSwitch * 2;
                const workDayInCycle = ((workDayNumber - 1) % switchInterval) + 1;
                const isDayShift = startsWithDay ? workDayInCycle <= dayNightSwitch : workDayInCycle > dayNightSwitch;
                return isDayShift ? this.shiftTypes.DAY : this.shiftTypes.NIGHT;
            }

            currentDay += segmentLength;
            if (isWorkSegment) {
                workDaysSeenSoFar += segmentLength;
            }
        }

        return this.shiftTypes.OFF;
    }

    calculateShift1(date) {
        return this.calculatePatternShift(date, {
            pattern: this.shift1Pattern,
            startDate: this.shift1StartDate,
            dayNightSwitch: this.shift1DayNightSwitch,
            startsWithDay: this.shift1StartsWithDay
        });
    }
    
    getShiftForCycleDay(cycleDay, isDayShift) {
        let isWorkDay = false;
        
        if (isDayShift) {
            // Day shift pattern: 3 on 3 off, 4 on 4 off, 3 on 3 off, 4 on 4 off (28 days)
            if (cycleDay >= 0 && cycleDay <= 2) {
                isWorkDay = true; // 3 on
            } else if (cycleDay >= 3 && cycleDay <= 5) {
                isWorkDay = false; // 3 off
            } else if (cycleDay >= 6 && cycleDay <= 9) {
                isWorkDay = true; // 4 on
            } else if (cycleDay >= 10 && cycleDay <= 13) {
                isWorkDay = false; // 4 off
            } else if (cycleDay >= 14 && cycleDay <= 16) {
                isWorkDay = true; // 3 on
            } else if (cycleDay >= 17 && cycleDay <= 19) {
                isWorkDay = false; // 3 off
            } else if (cycleDay >= 20 && cycleDay <= 23) {
                isWorkDay = true; // 4 on
            } else if (cycleDay >= 24 && cycleDay <= 27) {
                isWorkDay = false; // 4 off
            }
        } else {
            // Night shift pattern: 3 on 4 off, 4 on 3 off, 3 on 4 off, 4 on 4 off (28 days)
            if (cycleDay >= 0 && cycleDay <= 2) {
                isWorkDay = true; // 3 on
            } else if (cycleDay >= 3 && cycleDay <= 6) {
                isWorkDay = false; // 4 off
            } else if (cycleDay >= 7 && cycleDay <= 10) {
                isWorkDay = true; // 4 on
            } else if (cycleDay >= 11 && cycleDay <= 13) {
                isWorkDay = false; // 3 off
            } else if (cycleDay >= 14 && cycleDay <= 16) {
                isWorkDay = true; // 3 on
            } else if (cycleDay >= 17 && cycleDay <= 20) {
                isWorkDay = false; // 4 off
            } else if (cycleDay >= 21 && cycleDay <= 24) {
                isWorkDay = true; // 4 on
            } else if (cycleDay >= 25 && cycleDay <= 27) {
                isWorkDay = false; // 4 off
            }
        }
        
        if (!isWorkDay) {
            return this.shiftTypes.OFF;
        }
        
        return isDayShift ? this.shiftTypes.DAY : this.shiftTypes.NIGHT;
    }
    
    calculateShift2(date) {
        if (this.shift2Type === 'pattern') {
            return this.calculatePatternShift(date, {
                pattern: this.shift2Pattern,
                startDate: this.shift2StartDate,
                dayNightSwitch: this.shift2DayNightSwitch,
                startsWithDay: this.shift2StartsWithDay
            });
        }

        // Cycle-based legacy calculation
        const referenceDate = this.shift2CycleStartDate || new Date(date.getFullYear(), 5, 30);
        const timeDiff = date.getTime() - referenceDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const fullCycle = this.shift2CycleLength || 28;
        const halfCycle = fullCycle / 2;
        const fullCycleDay = ((daysDiff % fullCycle) + fullCycle) % fullCycle;
        const isFirstCycle = fullCycleDay < halfCycle;
        const patternDay = fullCycleDay % halfCycle;

        let isWorkDay = false;
        let shiftType = null;

        if (patternDay >= 0 && patternDay <= 1) {
            isWorkDay = true;
            shiftType = isFirstCycle ? this.shiftTypes.DAY : this.shiftTypes.NIGHT;
        } else if (patternDay >= 2 && patternDay <= 3) {
            isWorkDay = false;
        } else if (patternDay >= 4 && patternDay <= 6) {
            isWorkDay = true;
            shiftType = isFirstCycle ? this.shiftTypes.NIGHT : this.shiftTypes.DAY;
        } else if (patternDay >= 7 && patternDay <= 8) {
            isWorkDay = false;
        } else if (patternDay >= 9 && patternDay <= 10) {
            isWorkDay = true;
            shiftType = isFirstCycle ? this.shiftTypes.DAY : this.shiftTypes.NIGHT;
        } else if (patternDay >= 11 && patternDay <= 13) {
            isWorkDay = false;
        }

        if (!isWorkDay) {
            return this.shiftTypes.OFF;
        }

        return shiftType;
    }
    
    getShiftDisplayText(shiftType) {
        switch (shiftType) {
            case this.shiftTypes.DAY:
                return 'DAY';
            case this.shiftTypes.NIGHT:
                return 'NIGHT';
            case this.shiftTypes.OFF:
                return 'OFF';
            default:
                return 'ERROR';
        }
    }
    
    // Debug method to verify patterns
    debugShiftPattern(startDate, days = 21) {
        console.log('=== SHIFT PATTERN DEBUG ===');
        
        // Show the reference dates being used
        const year = startDate.getFullYear();
        const shift1ReferenceDate = new Date(this.shift1StartDate);
        console.log('Shift 1: Exact 56-day pattern: 3,-3,4,-4,3,-3,4,-4,4,-3,3,-4,4,-3,3,-4');
        console.log(`Shift 1 Reference: ${shift1ReferenceDate.toDateString()} (Pattern starts with first "3" - 3 days on, Night shift)`);
        console.log('After 14 work days: Night→Day, using same pattern');
        
        const referenceDate2 = new Date(year, 5, 30); // June 30th
        console.log('Shift 2 Reference (June 30): ' + referenceDate2.toDateString());
        
        console.log('Starting from: ' + startDate.toDateString());
        console.log('Day | Date | Weekday | Shift1 | Shift2 | S1-WorkDay | S1-Cycle | S2-Cycle');
        console.log('----|------|---------|--------|--------|------------|----------|----------');
        
        for (let i = 0; i < days; i++) {
            const testDate = new Date(startDate);
            testDate.setDate(startDate.getDate() + i);
            
            const shift1 = this.calculateShift1(testDate);
            const shift2 = this.calculateShift2(testDate);
            const dayName = testDate.toLocaleDateString('en-US', { weekday: 'short' });
            
            // Calculate cycle info for Shift 1
            const referenceDate1 = new Date(this.shift1StartDate);
            const timeDiff1 = testDate.getTime() - referenceDate1.getTime();
            const daysDiff1 = Math.floor(timeDiff1 / (1000 * 60 * 60 * 24));
            const pattern = [3,-3,4,-4,3,-3,4,-4,4,-3,3,-4,4,-3,3,-4];
            const totalPatternDays = pattern.reduce((sum, num) => sum + Math.abs(num), 0);
            const cycleDay1 = ((daysDiff1 % totalPatternDays) + totalPatternDays) % totalPatternDays;
            
            // Calculate work day for Shift 1
            let currentDay = 0;
            let workDaysSeenSoFar = 0;
            let workDayNumber = 0;
            
            for (let j = 0; j < pattern.length; j++) {
                const segmentLength = Math.abs(pattern[j]);
                const isWorkSegment = pattern[j] > 0;
                
                if (cycleDay1 >= currentDay && cycleDay1 < currentDay + segmentLength) {
                    if (isWorkSegment) {
                        const dayInSegment = cycleDay1 - currentDay;
                        workDayNumber = workDaysSeenSoFar + dayInSegment + 1;
                    }
                    break;
                }
                
                currentDay += segmentLength;
                if (isWorkSegment) {
                    workDaysSeenSoFar += segmentLength;
                }
            }
            
            const timeDiff2 = testDate.getTime() - referenceDate2.getTime();
            const daysDiff2 = Math.floor(timeDiff2 / (1000 * 60 * 60 * 24));
            const cycleDay2 = ((daysDiff2 % 28) + 28) % 28;
            
            const padNum = (num) => String(num).padStart(2);
            const padStr = (str, len) => String(str).padEnd(len);
            const workDayStr = workDayNumber > 0 ? String(workDayNumber) : 'Off';
            
            console.log(padNum(i+1) + ' | ' + padNum(testDate.getDate()) + ' | ' + 
                       padStr(dayName, 7) + ' | ' + padStr(shift1, 6) + ' | ' + 
                       padStr(shift2, 6) + ' | ' + String(workDayStr).padStart(10) + ' | ' + 
                       String(cycleDay1).padStart(8) + ' | ' + String(cycleDay2).padStart(8));
        }
        
        console.log('\nShift 1: Exact pattern 3,-3,4,-4,3,-3,4,-4,4,-3,3,-4,4,-3,3,-4 (56 days total)');
        console.log(`Reference: ${shift1ReferenceDate.toDateString()} starts with "3" (3 days on, Night shift)`);
        console.log('Work days 1-14: Night shift, Work days 15-28: Day shift (repeating 28-work-day cycle)');
        console.log('Pattern segments continue regardless of day/night switch');
        console.log('Shift 2 Pattern (28-day cycle): 2 on 2 off, 3 on 2 off, 2 on 3 off, then repeat with day/night swapped (starts June 30)');
    }
    
    debugVisibilityState() {
        console.log('=== VISIBILITY DEBUG ===');
        console.log('Shift 1 visible:', this.shiftVisibility.shift1);
        console.log('Shift 2 visible:', this.shiftVisibility.shift2);
        
        const shift1Btn = document.getElementById('toggleShift1');
        const shift2Btn = document.getElementById('toggleShift2');
        
        console.log('Shift 1 button active class:', shift1Btn?.classList.contains('active'));
        console.log('Shift 2 button active class:', shift2Btn?.classList.contains('active'));
        console.log('========================');
    }
    
    // Day Editor Methods
    showDayEditor(date, shifts) {
        const modal = document.getElementById('dayEditorModal');
        this.currentEditingDate = new Date(date);
        
        // Populate editor with current data
        this.populateDayEditor(date, shifts);
        
        // Setup editor event listeners
        this.setupDayEditorListeners();
        
        // Show modal
        modal.style.display = 'block';
    }
    
    populateDayEditor(date, shifts) {
        const dateStr = date.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('editorDate').textContent = dateStr;
        document.getElementById('editorInfo').textContent = 
            `Click to customize shift assignments for this day`;
        
        // Get override status for this date
        const dateKey = this.getDateKey(date);
        const override = this.dayOverrides.get(dateKey) || {};
        
        // Setup Shift 1
        const shift1Override = document.getElementById('shift1Override');
        const shift1Editor = document.getElementById('shift1Editor');
        shift1Override.checked = override.shift1 !== undefined;
        
        if (shift1Override.checked) {
            shift1Editor.classList.remove('shift-editor-disabled');
            this.setShiftTypeButtons('shift1', override.shift1);
        } else {
            shift1Editor.classList.add('shift-editor-disabled');
            this.setShiftTypeButtons('shift1', shifts.shift1);
        }
        
        // Setup Shift 2
        const shift2Override = document.getElementById('shift2Override');
        const shift2Editor = document.getElementById('shift2Editor');
        shift2Override.checked = override.shift2 !== undefined;
        
        if (shift2Override.checked) {
            shift2Editor.classList.remove('shift-editor-disabled');
            this.setShiftTypeButtons('shift2', override.shift2);
        } else {
            shift2Editor.classList.add('shift-editor-disabled');
            this.setShiftTypeButtons('shift2', shifts.shift2);
        }
        
        // Update pattern info
        this.updatePatternInfo(date, shifts);
    }
    
    setupDayEditorListeners() {
        const modal = document.getElementById('dayEditorModal');
        const closeBtn = document.getElementById('closeDayEditor');
        const cancelBtn = document.getElementById('editorCancel');
        const resetBtn = document.getElementById('editorReset');
        const saveBtn = document.getElementById('editorSave');
        
        // Close handlers
        closeBtn.onclick = () => modal.style.display = 'none';
        cancelBtn.onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
        
        // Override toggle handlers
        document.getElementById('shift1Override').onchange = (e) => {
            this.toggleShiftEditor('shift1', e.target.checked);
        };
        
        document.getElementById('shift2Override').onchange = (e) => {
            this.toggleShiftEditor('shift2', e.target.checked);
        };
        
        // Shift type button handlers
        document.querySelectorAll('.shift-type-btn').forEach(btn => {
            btn.onclick = () => {
                const shift = btn.dataset.shift;
                const type = btn.dataset.type;
                this.selectShiftType(shift, type);
            };
        });
        
        // Action button handlers
        resetBtn.onclick = () => this.resetDayToPattern();
        saveBtn.onclick = () => this.saveDayChanges();
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    toggleShiftEditor(shiftName, enabled) {
        const editor = document.getElementById(`${shiftName}Editor`);
        if (enabled) {
            editor.classList.remove('shift-editor-disabled');
        } else {
            editor.classList.add('shift-editor-disabled');
        }
    }
    
    setShiftTypeButtons(shiftName, shiftType) {
        const buttons = document.querySelectorAll(`[data-shift="${shiftName}"]`);
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === shiftType);
        });
    }
    
    selectShiftType(shiftName, shiftType) {
        this.setShiftTypeButtons(shiftName, shiftType);
    }
    
    updatePatternInfo(date, shifts) {
        const dateKey = this.getDateKey(date);
        const override = this.dayOverrides.get(dateKey) || {};
        
        // Shift 1 pattern info
        const shift1Info = document.getElementById('shift1PatternInfo');
        if (override.shift1 === undefined) {
            shift1Info.textContent = `Pattern default: ${this.getShiftDisplayText(shifts.shift1)}`;
        } else {
            shift1Info.textContent = `Custom override active`;
        }
        
        // Shift 2 pattern info
        const shift2Info = document.getElementById('shift2PatternInfo');
        if (override.shift2 === undefined) {
            shift2Info.textContent = `Pattern default: ${this.getShiftDisplayText(shifts.shift2)}`;
        } else {
            shift2Info.textContent = `Custom override active`;
        }
    }
    
    resetDayToPattern() {
        const dateKey = this.getDateKey(this.currentEditingDate);
        
        // Remove any overrides for this date
        this.dayOverrides.delete(dateKey);
        
        // Recalculate shifts for display
        const shifts = this.calculateShifts(this.currentEditingDate);
        
        // Update the editor
        this.populateDayEditor(this.currentEditingDate, shifts);
        
        this.showNotification('Day reset to pattern defaults', 'info');
    }
    
    saveDayChanges() {
        const dateKey = this.getDateKey(this.currentEditingDate);
        const override = {};
        
        // Check Shift 1 override
        const shift1Override = document.getElementById('shift1Override').checked;
        if (shift1Override) {
            const selectedShift1 = document.querySelector('[data-shift="shift1"].active');
            if (selectedShift1) {
                override.shift1 = selectedShift1.dataset.type;
            }
        }
        
        // Check Shift 2 override
        const shift2Override = document.getElementById('shift2Override').checked;
        if (shift2Override) {
            const selectedShift2 = document.querySelector('[data-shift="shift2"].active');
            if (selectedShift2) {
                override.shift2 = selectedShift2.dataset.type;
            }
        }
        
        // Save or remove override
        if (Object.keys(override).length > 0) {
            this.dayOverrides.set(dateKey, override);
        } else {
            this.dayOverrides.delete(dateKey);
        }
        
        // Save to localStorage and refresh calendar
        this.saveUserPreferences();
        this.renderCalendar();
        
        // Close modal
        document.getElementById('dayEditorModal').style.display = 'none';
        
        this.showNotification('Day changes saved successfully!', 'success');
    }
    
    getDateKey(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    
    // Settings Management Methods
    showSettings() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'block';
        
        // Load current settings into the form
        this.loadSettingsIntoForm();
        
        // Setup settings modal listeners
        this.setupSettingsModalListeners();
    }
    
    loadSettingsIntoForm() {
        // Load Shift 1 settings
        document.getElementById('shift1Pattern').value = this.shift1Pattern.join(',');
        document.getElementById('shift1StartDate').value = this.formatDateForInput(this.shift1StartDate);
        document.getElementById('shift1DayNightSwitch').value = this.shift1DayNightSwitch;
        document.getElementById('shift1StartShift').value = this.shift1StartsWithDay ? 'day' : 'night';
        
        // Load Shift 2 settings
        document.getElementById('shift2Pattern').value = this.shift2Pattern.join(',');
        document.getElementById('shift2StartDate').value = this.formatDateForInput(this.shift2StartDate);
        document.getElementById('shift2DayNightSwitch').value = this.shift2DayNightSwitch;
        document.getElementById('shift2StartDate2').value = this.formatDateForInput(this.shift2CycleStartDate);
        document.getElementById('shift2CycleLength').value = this.shift2CycleLength;

        const shift2TypeRadios = document.querySelectorAll('input[name="shift2Type"]');
        shift2TypeRadios.forEach(r => r.checked = r.value === this.shift2Type);
        this.toggleShift2Settings(this.shift2Type);
        
        // Load general settings
        document.getElementById('highlightWeekends').checked = this.settings?.highlightWeekends || false;
        document.getElementById('showShiftLabels').checked = this.settings?.showShiftLabels !== false;
        document.getElementById('calendarWeeks').value = this.calendarWeeks || 5;
    }
    
    formatDateForInput(date) {
        if (!(date instanceof Date) || isNaN(date)) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    setupSettingsModalListeners() {
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('closeSettings');
        const tabBtns = document.querySelectorAll('.tab-btn');
        const shift2TypeRadios = document.querySelectorAll('input[name="shift2Type"]');
        
        // Close modal events
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchSettingsTab(btn.dataset.tab));
        });
        
        // Shift 2 type switching
        shift2TypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.toggleShift2Settings(radio.value));
        });
        
        // Action buttons
        document.getElementById('resetSettings').addEventListener('click', () => this.resetToDefaults());
        document.getElementById('previewSettings').addEventListener('click', () => this.previewSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    switchSettingsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }
    
    toggleShift2Settings(type) {
        const patternSettings = document.getElementById('shift2-pattern-settings');
        const cycleSettings = document.getElementById('shift2-cycle-settings');
        
        if (type === 'pattern') {
            patternSettings.style.display = 'block';
            cycleSettings.style.display = 'none';
        } else {
            patternSettings.style.display = 'none';
            cycleSettings.style.display = 'block';
        }
    }
    
    resetToDefaults() {
        if (confirm('Reset all settings to defaults? This will reload the calendar.')) {
            // Reset to original hardcoded values
            this.shift1Pattern = [3,-3,4,-4,3,-3,4,-4,4,-3,3,-4,4,-3,3,-4];
            this.shift1StartDate = this.getDefaultShift1StartDate(); // January 11, 2026
            this.shift1DayNightSwitch = 14;
            this.shift1StartsWithDay = false;
            this.shift2Type = 'cycle';
            this.shift2Pattern = [2,-2,3,-2,2,-3];
            this.shift2StartDate = new Date(2025, 5, 30);
            this.shift2DayNightSwitch = 14;
            this.shift2StartsWithDay = true;
            this.shift2CycleLength = 28;
            this.shift2CycleStartDate = new Date(2025, 5, 30);
            this.calendarWeeks = 5;
            this.settings = {
                highlightWeekends: false,
                showShiftLabels: true
            };
            
            // Save and reload
            this.saveUserPreferences();
            this.loadSettingsIntoForm();
            this.renderCalendar();
        }
    }
    
    previewSettings() {
        // Temporarily apply settings for preview
        const tempSettings = this.collectSettingsFromForm();
        const originalSettings = this.backupCurrentSettings();
        
        try {
            this.applySettings(tempSettings);
            this.renderCalendar();
            
            // Show preview notification
            this.showNotification('Preview applied! Click "Save Changes" to keep or close to revert.', 'info');
            
            // Auto-revert after 10 seconds if not saved
            setTimeout(() => {
                if (document.getElementById('settingsModal').style.display === 'block') {
                    this.applySettings(originalSettings);
                    this.renderCalendar();
                    this.showNotification('Preview reverted to original settings.', 'warning');
                }
            }, 10000);
        } catch (error) {
            this.showNotification('Invalid settings: ' + error.message, 'error');
            this.applySettings(originalSettings);
        }
    }
    
    saveSettings() {
        try {
            const newSettings = this.collectSettingsFromForm();
            this.applySettings(newSettings);
            this.saveUserPreferences();
            this.renderCalendar();
            
            document.getElementById('settingsModal').style.display = 'none';
            this.showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            this.showNotification('Error saving settings: ' + error.message, 'error');
        }
    }
    
    collectSettingsFromForm() {
        const settings = {};
        
        // Shift 1 settings
        const shift1PatternText = document.getElementById('shift1Pattern').value.trim();
        if (shift1PatternText) {
            settings.shift1Pattern = shift1PatternText.split(',').map(num => {
                const parsed = parseInt(num.trim());
                if (isNaN(parsed) || parsed === 0) {
                    throw new Error(`Invalid pattern number: "${num}". Use positive for work days, negative for off days.`);
                }
                return parsed;
            });
        }
        
        const shift1StartDateStr = document.getElementById('shift1StartDate').value;
        if (shift1StartDateStr) {
            settings.shift1StartDate = new Date(shift1StartDateStr);
        }
        
        settings.shift1DayNightSwitch = parseInt(document.getElementById('shift1DayNightSwitch').value) || 14;
        settings.shift1StartsWithDay = document.getElementById('shift1StartShift').value === 'day';
        
        // Shift 2 settings
        const shift2Type = document.querySelector('input[name="shift2Type"]:checked').value;
        settings.shift2Type = shift2Type;
        
        if (shift2Type === 'pattern') {
            const shift2PatternText = document.getElementById('shift2Pattern').value.trim();
            if (shift2PatternText) {
                settings.shift2Pattern = shift2PatternText.split(',').map(num => {
                    const parsed = parseInt(num.trim());
                    if (isNaN(parsed) || parsed === 0) {
                        throw new Error(`Invalid Shift 2 pattern number: "${num}"`);
                    }
                    return parsed;
                });
            }
            
            const shift2StartDateStr = document.getElementById('shift2StartDate').value;
            if (shift2StartDateStr) {
                settings.shift2StartDate = new Date(shift2StartDateStr);
            }
            
            settings.shift2DayNightSwitch = parseInt(document.getElementById('shift2DayNightSwitch').value) || 14;
            settings.shift2StartsWithDay = true;
        } else {
            settings.shift2CycleLength = parseInt(document.getElementById('shift2CycleLength').value) || 28;
            const shift2CycleStartDateStr = document.getElementById('shift2StartDate2').value;
            if (shift2CycleStartDateStr) {
                settings.shift2CycleStartDate = new Date(shift2CycleStartDateStr);
            }
        }
        
        // General settings
        settings.calendarWeeks = parseInt(document.getElementById('calendarWeeks').value) || 5;
        settings.highlightWeekends = document.getElementById('highlightWeekends').checked;
        settings.showShiftLabels = document.getElementById('showShiftLabels').checked;
        
        return settings;
    }
    
    backupCurrentSettings() {
        return {
            shift1Pattern: [...this.shift1Pattern],
            shift1StartDate: new Date(this.shift1StartDate),
            shift1DayNightSwitch: this.shift1DayNightSwitch,
            shift1StartsWithDay: this.shift1StartsWithDay,
            shift2Type: this.shift2Type,
            shift2Pattern: [...this.shift2Pattern],
            shift2StartDate: new Date(this.shift2StartDate),
            shift2DayNightSwitch: this.shift2DayNightSwitch,
            shift2StartsWithDay: this.shift2StartsWithDay,
            shift2CycleLength: this.shift2CycleLength,
            shift2CycleStartDate: new Date(this.shift2CycleStartDate),
            calendarWeeks: this.calendarWeeks,
            settings: {...this.settings}
        };
    }
    
    applySettings(newSettings) {
        if (newSettings.shift1Pattern) this.shift1Pattern = newSettings.shift1Pattern;
        if (newSettings.shift1StartDate) this.shift1StartDate = newSettings.shift1StartDate;
        if (newSettings.shift1DayNightSwitch) this.shift1DayNightSwitch = newSettings.shift1DayNightSwitch;
        if (newSettings.shift1StartsWithDay !== undefined) this.shift1StartsWithDay = newSettings.shift1StartsWithDay;
        if (newSettings.shift2Type) this.shift2Type = newSettings.shift2Type;
        if (newSettings.shift2Pattern) this.shift2Pattern = newSettings.shift2Pattern;
        if (newSettings.shift2StartDate) this.shift2StartDate = newSettings.shift2StartDate;
        if (newSettings.shift2DayNightSwitch) this.shift2DayNightSwitch = newSettings.shift2DayNightSwitch;
        if (newSettings.shift2StartsWithDay !== undefined) this.shift2StartsWithDay = newSettings.shift2StartsWithDay;
        if (newSettings.shift2CycleLength) this.shift2CycleLength = newSettings.shift2CycleLength;
        if (newSettings.shift2CycleStartDate) this.shift2CycleStartDate = newSettings.shift2CycleStartDate;
        if (newSettings.calendarWeeks) this.calendarWeeks = newSettings.calendarWeeks;
        if (newSettings.settings) this.settings = {...this.settings, ...newSettings.settings};
        
        // Apply general settings
        if (newSettings.highlightWeekends !== undefined) {
            this.settings.highlightWeekends = newSettings.highlightWeekends;
        }
        if (newSettings.showShiftLabels !== undefined) {
            this.settings.showShiftLabels = newSettings.showShiftLabels;
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set color based on type
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page and show
        document.body.appendChild(notification);
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Overlap Analysis Methods
    showOverlapAnalysis() {
        const modal = document.getElementById('overlapAnalysisModal');
        const yearSelect = document.getElementById('overlapYearSelect');
        
        // Populate year dropdown
        this.populateYearDropdown(yearSelect);
        
        // Show modal
        modal.style.display = 'block';
        
        // Add event listeners for modal controls
        this.setupOverlapModalListeners();
        
        // Generate initial analysis for current year
        this.generateOverlapAnalysis(this.currentDate.getFullYear());
    }
    
    populateYearDropdown(yearSelect) {
        yearSelect.innerHTML = '';
        const currentYear = new Date().getFullYear();
        
        // Add years from current-2 to current+5
        for (let year = currentYear - 2; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === this.currentDate.getFullYear()) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }
    
    setupOverlapModalListeners() {
        const modal = document.getElementById('overlapAnalysisModal');
        const closeBtn = document.getElementById('closeOverlapAnalysis');
        const yearSelect = document.getElementById('overlapYearSelect');
        
        // Close modal events
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Year selection change
        yearSelect.addEventListener('change', (e) => {
            this.generateOverlapAnalysis(parseInt(e.target.value));
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    generateOverlapAnalysis(year) {
        const content = document.getElementById('overlapAnalysisContent');
        content.innerHTML = '';
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        for (let month = 0; month < 12; month++) {
            const monthData = this.calculateMonthOverlaps(year, month);
            const monthCard = this.createMonthOverlapCard(monthNames[month], year, monthData);
            content.appendChild(monthCard);
        }
        
        // Add legend
        const legend = this.createOverlapLegend();
        content.appendChild(legend);
    }
    
    calculateMonthOverlaps(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const overlaps = [];
        const today = new Date();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const shifts = this.calculateShifts(date);
            
            // Check if both shifts are working (not OFF)
            const shift1Working = shifts.shift1 !== this.shiftTypes.OFF;
            const shift2Working = shifts.shift2 !== this.shiftTypes.OFF;
            
            if (shift1Working && shift2Working) {
                overlaps.push({
                    day: day,
                    date: new Date(date),
                    shift1Type: shifts.shift1,
                    shift2Type: shifts.shift2,
                    isToday: date.toDateString() === today.toDateString()
                });
            }
        }
        
        return {
            totalDays: daysInMonth,
            overlapDays: overlaps,
            overlapCount: overlaps.length,
            overlapPercentage: Math.round((overlaps.length / daysInMonth) * 100)
        };
    }
    
    createMonthOverlapCard(monthName, year, monthData) {
        const card = document.createElement('div');
        card.className = 'month-overlap-card';
        
        card.innerHTML = `
            <div class="month-overlap-header">${monthName} ${year}</div>
            <div class="overlap-summary">
                <div class="overlap-count">${monthData.overlapCount} days</div>
                <div class="overlap-percentage">${monthData.overlapPercentage}% of month</div>
            </div>
            <div class="overlap-days-list">
                ${monthData.overlapDays.map(overlap => `
                    <div class="overlap-day ${overlap.isToday ? 'today' : ''}" 
                         title="${overlap.date.toDateString()}\nShift 1: ${this.getShiftDisplayText(overlap.shift1Type)}\nShift 2: ${this.getShiftDisplayText(overlap.shift2Type)}">
                        ${overlap.day}
                    </div>
                `).join('')}
            </div>
        `;
        
        return card;
    }
    
    createOverlapLegend() {
        const legend = document.createElement('div');
        legend.className = 'overlap-legend';
        legend.style.gridColumn = '1 / -1'; // Span all columns
        
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color legend-day"></div>
                <span>Day Shift</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-night"></div>
                <span>Night Shift</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-off"></div>
                <span>Off Day</span>
            </div>
            <div class="legend-item">
                <strong>📊 Overlaps:</strong> Days when both shifts are working (not off)
            </div>
        `;
        
        return legend;
    }
}

// Animation utilities
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = 'opacity ' + duration + 'ms ease-in-out';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }
    
    static slideIn(element, direction = 'left', duration = 300) {
        const translateX = direction === 'left' ? '-100%' : '100%';
        element.style.transform = 'translateX(' + translateX + ')';
        element.style.transition = 'transform ' + duration + 'ms ease-out';
        
        requestAnimationFrame(() => {
            element.style.transform = 'translateX(0)';
        });
    }
}

// Utility functions
const utils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Format date for display
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Check if device is mobile
    isMobile() {
        return window.innerWidth <= 768;
    }
};

// Initialize the calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new DualShiftCalendar();

    // Debug: Show the shift pattern for the current month
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    console.log('Shift patterns for ' + calendar.monthNames[today.getMonth()] + ' ' + today.getFullYear() + ':');
    calendar.debugShiftPattern(firstOfMonth, 14);

    // Modal close logic
    const modal = document.getElementById('dayDetailsModal');
    const closeBtn = document.getElementById('closeDayDetails');
    if (modal && closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        closeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                modal.style.display = 'none';
            }
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Add touch gestures for mobile
    if (utils.isMobile()) {
        let touchStartX = 0;
        let touchEndX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        function handleSwipe() {
            const swipeThreshold = 50;
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    calendar.previousMonth();
                } else {
                    calendar.nextMonth();
                }
            }
        }
    }

    // Add resize handler for responsive updates
    window.addEventListener('resize', utils.debounce(() => {
        calendar.renderCalendar();
    }, 250));
});

// Enhanced mobile support
if (utils.isMobile()) {
    // Prevent zoom on double tap for better UX
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Improve scroll performance on mobile
    const scrollContainer = document.querySelector('.calendar-scroll-container');
    if (scrollContainer) {
        scrollContainer.style.overflowScrolling = 'touch';
        scrollContainer.style.webkitOverflowScrolling = 'touch';
    }
    
    // Add visual feedback for button presses
    document.querySelectorAll('.nav-btn, .toggle-btn').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DualShiftCalendar, AnimationUtils, utils };
}
