// initialize some globals
const workdayFirstHour = 0;  // hour of day, 0 - 23
const workdayLastHour = 17;  // hour of day, 0 - 23
var today = dayjs().startOf('day').format();  // date/timestamp for today at 00:00
var now = dayjs();
var currentHour = parseInt(dayjs().format('H'));
var workdayScheduleData = {};
var heartbeat;

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
  var scheduleJson = localStorage.getItem('schedule');
  var scheduleData;

  if (scheduleJson) {
    scheduleData = JSON.parse(scheduleJson);

    // check if this is an old schedule
    if (scheduleData.date !== today) {
      scheduleData = null;  // if so, clear it out
    }
  }

  if (scheduleJson === null) {
    scheduleData = {
      date: today,
      schedule: []
    }
    // create empty schedule
    for (var hour = workdayFirstHour; hour <= workdayLastHour; hour++) {
      timeBLock = {
        hour: hour,
        tasks: []
      };
      scheduleData.schedule.push(timeBLock);
    }
    // and store it
    localStorage.setItem('schedule', JSON.stringify(scheduleData));
  }
  return scheduleData;
}

var buildScheduleEl = function(scheduleData) {
  $('#schedule').hide();  // build it hidden

  var currentHour = parseInt(dayjs().format('H'));
  console.log(scheduleData);
  for (var i = 0; i < scheduleData.schedule.length; i++) {
    var timeBlock = scheduleData.schedule[i];
    console.log('timeBlock', timeBlock);

    var descBgClass = 'present';
    if (timeBlock.hour > currentHour) {
      descBgClass = 'future';
    } else if (timeBlock.hour < currentHour) {
      descBgClass = 'past'
    }

    var hourEl = $('<div>').attr('class', 'col-1 text-right hour');
    var descriptionEl = $('<div>').attr('class', 'col-10 text-left description ' + descBgClass);
    var saveEl = $('<div>').attr('class', 'col-1 text-center saveBtn');
    hourEl.html(timeBlock.hour > 12 ? (timeBlock.hour - 12) + 'PM' : timeBlock.hour + 'AM');
    descriptionEl.html('tasks?');
    saveEl.html('<i class="far fa-save"></i>');
    var timeBlockEl = $('<div>').attr('class', 'row time-block').attr('data-hour', timeBlock.hour);
    timeBlockEl.append(hourEl).append(descriptionEl).append(saveEl);
    $('#schedule').append(timeBlockEl);
  }

  $('#schedule').fadeIn(1000); // show it when done building
}

// update timeblocks' past/present/future status
var refreshScheduleStatuses = function() {
  var hourNow = parseInt(dayjs().format('H'));

  // only if the hour has changed
  if (hourNow !== currentHour) {

    // at midnight, refresh everything
    if (dayjs().startOf('day').format() !== today) {
      clearInterval(heartbeat);
      today = dayjs().startOf('day').format();
      initSchedule();

    } else {
      var timeBlocks = $('.time-block');
      timeBlocks.each(function(block) {
        var description = block.children('.description').first();
        var blockHour = parseInt(block.attr('data-hour'));

        if (description.hasClass('present')) {
          // probably have to change to 'past', so make sure
          if (blockHour < hourNow) {
            // yup, change to 'past'
            description.removeClass('present');
            description.addClass('past');
          }
        } else if (description.hasClass('future')) {
          // might have to change to 'present', so check
          if (blockHour === hourNow) {
            // yup, change to 'present'
            description.removeClass('future');
            description.addClass('present');
          } else if (blockHour < hourNow) {
            // shouldn't happen, but cover it anyway
            description.removeClass('future');
            description.addClass('past');
          }
        }
      });
    }

    currentHour = hourNow;
  }
};


var initSchedule = function() {
  $('#currentDay').html(dayjs(today).format('dddd, MMMM D') + ord());
  workdayScheduleData = loadScheduleData();
  buildScheduleEl(workdayScheduleData);

  heartbeat = setInterval(refreshScheduleStatuses, 1000 * 60);
}


initSchedule();