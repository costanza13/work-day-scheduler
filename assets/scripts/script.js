// initialize some globals
const workdayFirstHour = 9;  // hour of day, 0 - 23
const workdayLastHour = 17;  // hour of day, 0 - 23
const today = dayjs().startOf('day').format();  // date/timestamp for today at 00:00
var now = dayjs();
var workdayScheduleData = {};  // 

const ord = function() {
  var ordinal = 'th';
  switch (dayjs().format('D')) {
    case '1':
      ordinal = 'st';
      break;
    case '2':
      ordinal = 'nd';
      break;
    case '3':
      ordinal = 'rd';
  }
  return ordinal;
}

var loadScheduleData = function () {
  // load workday schedule from local storage
  var workdayScheduleJson = localStorage.getItem('schedule');

  if (workdayScheduleJson) {
    workdayScheduleData = JSON.parse(workdayScheduleJson);

    // check if this is an old schedule
    if (workdayScheduleData.date !== today) {
      workdayScheduleData = null;  // if so, clear it out
    }
  }

  if (workdayScheduleJson === null) {
    workdayScheduleData = {
      date: today,
      schedule: []
    }
    // create empty schedule
    for (var hour = 0; hour <= workdayLastHour; hour++) {
      timeBLock = {
        hour: hour,
        tasks: []
      };
      workdayScheduleData.schedule.push(timeBLock);
    }
  }
  console.log(workdayScheduleData);
}

var initSchedule = function() {
  $('#currentDay').html(dayjs(today).format('dddd, MMMM D') + ord());
  loadScheduleData();
}


initSchedule();