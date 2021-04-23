// declare/initialize some globals
const workdayFirstHourDefault = 9;  // hour of day, 0 - 23
const workdayLastHourDefault = 17;  // hour of day, 0 - 23
var today = dayjs().startOf('day').format();  // date/timestamp for today at 00:00
var currentHour = parseInt(dayjs().format('H'));
var workdayScheduleData = {};

// return date ending 'st', 'nd', 'rd', or 'th' based on day number
const ord = function() {
  var ordinal = 'th';
  var dayOfMonth = parseInt(dayjs().format('D'));
  // teens all keep "th", everything else needs logic
  if (dayOfMonth < 4 || dayOfMonth > 20) {
    var dayOfMonthOnes = dayOfMonth % 10;
    switch (dayOfMonthOnes) {
      case 1:
        ordinal = 'st';
        break;
      case 2:
        ordinal = 'nd';
        break;
      case 3:
        ordinal = 'rd';
    }
  }
  return ordinal;
}

// build schedule object and load data from local storage
var loadScheduleData = function () {
  var scheduleData = null;

  // load workday schedule from local storage
  var scheduleJson = localStorage.getItem('schedule');
  if (scheduleJson) {
    var loadedScheduleData = JSON.parse(scheduleJson);

    // check if this is a current schedule
    if (loadedScheduleData.date === today) {
      scheduleData = loadedScheduleData;
    }
  }
  if (!scheduleData) {
    // start with an empty 24-hour schedule
    scheduleData = {
      date: today,
      firstHour: workdayFirstHourDefault,
      lastHour: workdayLastHourDefault,
      schedule: []
    }
    for (var hour = 0; hour < 24; hour++) {
      scheduleData.schedule.push({hour: hour, description: ''});
    }
    localStorage.setItem('schedule', JSON.stringify(scheduleData));
  }

  return scheduleData;
}

var createTimeBlockEl = function(hour, description) {
  var timeBlockEl = null;

  if (hour > -1 && hour < 24) {
    var hourEl = $('<div>').attr('class', 'col-1 text-right hour');
    var amPm = hour > 11 ? 'PM' : 'AM';
    var timeText = (hour > 12 ? (hour - 12) : (hour === 0 ? 12 : hour)) + amPm;
    hourEl.html(timeText);

    var descriptionEl = $('<div>').attr('class', 'col-10 text-left description past');
    descriptionEl.html(description);

    var saveEl = $('<div>').attr('class', 'col-1 text-center saveBtn');
    saveEl.html('<i class="far fa-save"></i>');
    
    timeBlockEl = $('<div>').attr('class', 'row time-block').attr('data-hour', hour);
    // if the current time block is not within the work hours set by the user
    if (hour < workdayScheduleData.firstHour || hour > workdayScheduleData.lastHour) {
      // hide it
      timeBlockEl.hide();
    }
    timeBlockEl.append(hourEl).append(descriptionEl).append(saveEl);
  }
  return timeBlockEl;
};

var buildScheduleEl = function(scheduleData) {
  $('#schedule').hide();  // build it hidden
  $('.time-block').remove();

  var currentHour = parseInt(dayjs().format('H'));
  for (var i = 0; i < 24; i++) {
    var timeBlock = scheduleData.schedule[i];
    var timeBlockEl = createTimeBlockEl(timeBlock.hour, timeBlock.description);
    if (timeBlockEl) {
      timeBlockEl.insertBefore('#bottom-control-bar');
    }
  }

  refreshScheduleStatuses();
  $('.present, .future').on('click', editDescription);
  $('#schedule').fadeIn(1000); // show it when done building
}

var addHour = function(where) {
  var showHour = -1;

  // adding an hour to the start of the schedule
  if (where === 'start') {
    // get the current first hour
    var currentFirst = workdayScheduleData.firstHour;
    if (workdayScheduleData.firstHour > 0) {
      workdayScheduleData.firstHour--; 
      showHour = workdayScheduleData.firstHour;
      localStorage.setItem('schedule', JSON.stringify(workdayScheduleData));
    }

  // adding an hour to the end of the schedule
  } else if (where === 'end') {
    // get the current last hour
    var currentLast = workdayScheduleData.lastHour;
    if (workdayScheduleData.lastHour < 23) {
      workdayScheduleData.lastHour++;
      showHour = workdayScheduleData.lastHour;
      localStorage.setItem('schedule', JSON.stringify(workdayScheduleData));
    }
  }

  if (showHour > -1) {
    // find time block element for the new first hour
    $('.time-block').each(function() {
      if (parseInt($(this).attr('data-hour')) === showHour) {
        $(this).show();
        if (where === 'end') {
          $('html, body').animate({scrollTop:$(document).height()}, 'slow');
        }
      }
    });
  }
}

var removeHour = function(where) {
  var hideHour = -1;

  // only do this if there are at least 2 time blocks
  if (workdayScheduleData.firstHour < workdayScheduleData.lastHour) {
    // removing an hour from the start of the schedule
    if (where === 'start') {
      // get the current first hour
      hideHour = workdayScheduleData.firstHour;
      workdayScheduleData.firstHour++;
      localStorage.setItem('schedule', JSON.stringify(workdayScheduleData));

    // adding an hour to the end of the schedule
    } else if (where === 'end') {
      // get the current last hour
      hideHour = workdayScheduleData.lastHour;
      workdayScheduleData.lastHour--;
      localStorage.setItem('schedule', JSON.stringify(workdayScheduleData));
    }

    if (hideHour > -1) {
      // find time block element for the new first hour
      $('.time-block').each(function() {
        if (parseInt($(this).attr('data-hour')) === hideHour) {
          $(this).hide();
        }
      });
    }
  }
}

// update timeblocks' past/present/future status
var refreshScheduleStatuses = function() {
  var hourNow = parseInt(dayjs().format('H'));

  // only refresh if the time block for the current hour is not already set to 'present' status
  if (!$('.time-block').eq(hourNow).children('.description').first().hasClass('present')) {
    // at midnight, refresh everything
    if (dayjs().startOf('day').format() !== today) {
      today = dayjs().startOf('day').format();
      initSchedule();

    } else {
      var timeBlocks = $('.time-block');
      timeBlocks.each(function() {
        var description = $(this).children('.description').first();
        var blockHour = parseInt($(this).attr('data-hour'));

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
        } else {
          // might have to change from 'past', so check
          if (blockHour === hourNow) {
            description.removeClass('past');
            description.addClass('present');
          } else if (blockHour > hourNow) {
            description.removeClass('past');
            description.addClass('future');
          }
        }
      });
    }
  }

  currentHour = hourNow;

  // add editable description handler
  $('.description.past').off('click');
};

var editDescription = function() {
  var description = $(this).html();
  $(this).addClass('active');
  $(this).siblings('.saveBtn').addClass('active');
  $(this).off('click');

  var descriptionTextarea = $('<textarea class="edit-description">').val(description);
  $(this).html(descriptionTextarea);
  $('.edit-description').trigger('focus');
  
  // add save button handler
  $(this).siblings('.saveBtn.active').first().on('click', saveDescription).css('cursor: pointer');
};

var saveDescription = function() {
  $(this).off('click');
  $(this).removeClass('active').css('cursor: default');

  var timeBlockEl = $(this).parent();
  var hour = parseInt(timeBlockEl.attr('data-hour'));
  var descriptionEl = timeBlockEl.children('.description').first();
  var editDescriptionEl = descriptionEl.children('.edit-description').first();
  var newDescription = editDescriptionEl.val();
  descriptionEl.html(newDescription);

  workdayScheduleData.schedule[hour].description = newDescription;

  localStorage.setItem('schedule', JSON.stringify(workdayScheduleData));

  descriptionEl.removeClass('active');
  descriptionEl.on('click', editDescription);

  refreshScheduleStatuses();
};

var initSchedule = function() {
  $('#currentDay').html(dayjs(today).format('dddd, MMMM D') + ord());
  workdayScheduleData = loadScheduleData();
  buildScheduleEl(workdayScheduleData);
}

$('.hour-control').click(function() {
  var where = ($(this).parent().attr('id') === 'start-hour-controls') ? 'start' : 'end';
  if ($(this).attr('data-op') === 'add') {
    addHour(where);
  } else {
    removeHour(where);
  }
}).css('cursor', 'pointer');

$('.clear-control').click(function() {
  localStorage.setItem('schedule', '');
  initSchedule();
}).css('cursor', 'pointer');

// used to check for hour transitions and update past/present/future statuses
var heartbeat = setInterval(refreshScheduleStatuses, 1000 * 60);

// get things started
initSchedule();
