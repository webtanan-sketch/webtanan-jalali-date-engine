# Webtanan Jalali Date Engine

## موتور تاریخ شمسی حرفه‌ای صنعتی

A professional Persian (Jalali/Shamsi) date and time engine designed for enterprise applications including CRM, accounting, sales, production management, scheduling systems and business software.

## Vision

Webtanan Jalali Date Engine is not a simple calendar picker. It is designed as an enterprise-grade date management component with:

- Jalali calendar support
- Date and time selection
- Range selection
- Multiple date selection
- Event management
- Work calendar support
- Holiday management
- Workflow timeline support
- CRM and sales integration capabilities
- Reporting-ready data structure

---

# Main Features

## Calendar Engine

- Accurate Jalali calendar calculation
- Gregorian ↔ Jalali conversion
- Leap year testing
- Persian digit support
- RTL native design

## Date Selection

- Single date
- Date range
- Multiple dates
- Minimum and maximum date limitation
- Disabled dates

## Time Picker

Support for:

- Hour
- Minute
- Second
- Custom time interval

Example:

08:00
08:15
08:30

## Enterprise Events

Each date can contain business events:

- Customer calls
- Meetings
- Delivery schedules
- Payments
- Follow-ups

## Workflow Timeline

Designed for business processes:

```
ثبت سفارش
   ●────●────●────●
تایید   تولید   بارگیری   تحویل
```

---

# UI Principles

- Persian RTL interface
- Minimal industrial design
- Professional management software style
- Responsive layout
- Mobile friendly
- No unnecessary complexity

---

# Supported Platforms

- HTML / JavaScript
- TypeScript
- React
- Vue
- Electron
- Desktop applications

---

# API Preview

```javascript
GFTDatePicker.open()

GFTDatePicker.close()

GFTDatePicker.setDate()

GFTDatePicker.getDate()

GFTDatePicker.setRange()

GFTDatePicker.addEvent()

GFTDatePicker.clear()
```

---

# Configuration Example

```javascript
{
 calendar:"jalali",
 rtl:true,
 persianDigits:true,
 time:true,
 range:true,
 events:true,
 holidays:true
}
```

---

# Roadmap & Versions

## v0.1.0 - Foundation Release

Initial architecture:

- Project structure
- Core calendar engine planning
- API design
- Documentation base

## v0.2.0 - Jalali Core Engine

Planned:

- Jalali date calculation
- Gregorian conversion
- Leap year handling
- Date validation

## v0.3.0 - Professional Date Picker UI

Planned:

- RTL interface
- Persian digits
- Calendar navigation
- Responsive design

## v0.4.0 - Time & Range Management

Planned:

- Date + Time selection
- Range selection
- Multiple date selection
- Restrictions

## v0.5.0 - Event System

Planned:

- Calendar events
- Status indicators
- Business reminders

## v0.6.0 - Enterprise Workflow Layer

Planned:

- Timeline visualization
- Order progress tracking
- CRM integration models

## v1.0.0 - Industrial Stable Release

Target:

- Production ready
- Full documentation
- Demo applications
- CRM template
- Sales template
- Accounting template
- Production planning template

---

# License

To be announced.

---

Developed by Webtanan

Professional Persian Software Components