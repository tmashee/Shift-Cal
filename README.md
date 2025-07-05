# Dual Shift Calendar

A modern, responsive web application for displaying and customizing work shift schedules with dual shift patterns. Features a comprehensive calendar interface with advanced customization options and analytics.

## ✨ Key Features

- **🔄 Dual Shift Display**: Two customizable shift patterns displayed simultaneously
- **⚙️ Pattern Customization**: Full control over shift patterns, start dates, and cycles
- **✏️ Individual Day Editing**: Click any day to override specific shift assignments
- **📊 Overlap Analysis**: Detailed analytics showing when both shifts work simultaneously
- **👁️ Shift Visibility Toggle**: Show/hide specific shifts with eye icons
- **📱 Mobile-Optimized**: Responsive design with touch gestures and PWA support
- **🎨 Modern UI**: Clean interface with Font Awesome icons and smooth animations

## 🚀 Quick Start

1. Open `index.html` in a web browser
2. Use header controls to navigate and customize
3. Click any day to edit individual shift assignments
4. Access settings (⚙️) to modify shift patterns
5. View overlap analysis (📊) for workforce planning

## 🎛️ Interface Controls

| Control | Function |
|---------|----------|
| 👁️ Shift 1/2 | Toggle shift visibility |
| ← → | Navigate years |
| 🏠 | Go to today |
| ⚙️ | Open settings modal |
| 📊 | View overlap analysis |

## ⚙️ Customization Options

### Shift Pattern Settings
- **Custom Patterns**: Define work/off cycles (e.g., "3,-3,4,-4" = 3 on, 3 off, 4 on, 4 off)
- **Start Dates**: Set pattern reference points
- **Day/Night Switching**: Configure shift type alternation intervals
- **Calendar Layout**: Choose 5 or 6-week month views

### Individual Day Overrides
- Click any calendar day to customize
- Override Shift 1 and/or Shift 2 independently
- Visual indicators (✏️) show customized days
- Reset to pattern defaults anytime

## 📊 Analytics Features

- **Monthly Overlap Analysis**: See when both shifts work simultaneously
- **Percentage Calculations**: Overlap ratios for each month
- **Year Selection**: Analyze different time periods
- **Visual Reports**: Color-coded overlap indicators

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Icons**: Font Awesome 6.0
- **Storage**: localStorage for persistence
- **PWA**: Installable as mobile app via manifest.json

## 📁 File Structure

```
/
├── index.html          # Main application
├── styles.css          # Complete styling
├── script.js           # Calendar logic & features
├── manifest.json       # PWA configuration
└── README.md          # Documentation
```

## 📱 Mobile Support

- **Touch Gestures**: Swipe navigation
- **Responsive Layout**: Adapts to all screen sizes
- **PWA Ready**: Install as mobile app
- **Touch Optimization**: Large touch targets and smooth interactions

## 🔧 Advanced Features

- **Pattern Validation**: Real-time input validation
- **Preview Mode**: Test settings before saving
- **Data Persistence**: All settings saved automatically
- **Backup/Restore**: Reset to defaults option
- **Performance Optimized**: Efficient rendering and caching

## 💾 Data Storage

All customizations are automatically saved to browser localStorage:
- Custom shift patterns and settings
- Individual day overrides
- Visibility preferences
- Calendar display options

## 🎯 Use Cases

- **Workplace Shift Planning**: Visualize rotating shift schedules
- **Resource Management**: Identify overlap periods for staffing
- **Personal Planning**: Track work schedules and time off
- **Team Coordination**: Share shift assignments and coverage

## 🔮 Pattern Examples

```
Basic 4-day cycle:     "4,-4"           (4 work, 4 off)
Complex pattern:       "3,-3,4,-4,3,-3" (mixed work/off periods)
Weekly pattern:        "5,-2"           (5 work, 2 off - weekdays)
```

## 🌟 Browser Support

Modern browsers with ES6+ support (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)

---

**Built with ❤️ for efficient shift schedule management**
