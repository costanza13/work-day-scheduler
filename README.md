# Work Day Scheduler
A simple calendar application that allows a user to save events for each hour of the day. The user can view the hourly schedule for the current work day, and add events to the hours ahead.

## Features
- Upon starting the app, the current date is displayed at the top of the calendar.
- Scrolling down reveals a daily planner with time blocks for standard business hours (hours configurable in the JavaScript).
- Each time block is color-coded to indicate whether it is in the past (gray), present (red), or future (green.)
- Past/present/future status is updated throughout the day as each hour passes.
- Clicking the description field of a time block allows the user to add or edit events.
- Clicking outside of the row being edited will cancel the edit and revert the description to its prior state.
- Clicking the save button for the associated time block saves the event in both the view and in local storage.
- Saved events persist when refreshing the page.
- A change in the calendar day (when the hour passes midnight), results in the user being presented with a new, empty schedule.
- Hours can be added to or removed from the displayed schedule using the buttons above and below the schedule.  The buttons above add and remove hours at the start of the day, the ones below add to and remove from the end of the day.  If a removed hour had data in it, that data isn't lost and can be shown again by re-adding that hour.
- The "clear schedule" button clears both the displayed schedule and the stored data.


## Screenshot 
<img src="./assets/images/scheduler-demo2.gif" />
