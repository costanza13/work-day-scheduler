# Work Day Scheduler
A simple calendar application that allows a user to save events for each hour of the day. The user can view the hourly schedule for the current work day, and add events to the hours ahead.

## Features
- Upon starting the app, the current date is displayed at the top of the calendar.
- Scrolling down reveals a daily planner with time blocks for standard business hours (hours configurable in the JavaScript).
- Each time block is color-coded to indicate whether it is in the past (gray), present (red), or future (green.)
- Past/present/future status is updated throughout the day as each hour passes.
- Clicking the description field of a time block allows the user to add or edit events.
- Clicking the save button for the associated time block saves the event in both the view and in local storage.
- Saved events persist when refreshing the page.
- A change in the calendar day (when the hour passes midnight), results in the user being presented with a new, empty schedule.

## Screenshot 
<img src="./assets/images/scheduler-demo.gif" />
