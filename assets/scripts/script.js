// initialize some globals
const workdayFirstHour = 8;  // hour of day, 0 - 23
const workdayLastHour = 18;  // hour of day, 0 - 23
var today = dayjs().startOf('day').format();  // date/timestamp for today at 00:00
var now = dayjs();
var currentHour = parseInt(dayjs().format('H'));
var workdayScheduleData = {};

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

var loadScheduleData = function () {
  // load workday schedule from local storage
  var scheduleJson = localStorage.getItem('schedule');
  var scheduleData = null;

  if (scheduleJson) {
    scheduleData = JSON.parse(scheduleJson);

    // check if this is an old schedule
    if (scheduleData.date !== today) {
      scheduleData = null;  // if so, clear it out
    }
  }

  if (scheduleData === null) {
    scheduleData = {
      date: today,
      schedule: []
    }
    // create empty schedule
    for (var hour = workdayFirstHour; hour <= workdayLastHour; hour++) {
      timeBLock = {
        hour: hour,
        description: ''
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
  for (var i = 0; i < scheduleData.schedule.length; i++) {
    var timeBlock = scheduleData.schedule[i];
    // console.log('timeBlock', timeBlock);

    var hourEl = $('<div>').attr('class', 'col-1 text-right hour');
    var descriptionEl = $('<div>').attr('class', 'col-10 text-left description past');
    var saveEl = $('<div>').attr('class', 'col-1 text-center saveBtn');
    hourEl.html(timeBlock.hour > 12 ? (timeBlock.hour - 12) + 'PM' : timeBlock.hour + 'AM');
    descriptionEl.html(timeBlock.description);
    saveEl.html('<i class="far fa-save"></i>');
    var timeBlockEl = $('<div>').attr('class', 'row time-block').attr('data-hour', timeBlock.hour);
    timeBlockEl.append(hourEl).append(descriptionEl).append(saveEl);
    $('#schedule').append(timeBlockEl);
  }

  refreshScheduleStatuses();
  $('.present, .future').on('click', editDescription);
  $('#schedule').fadeIn(1000); // show it when done building
}

// update timeblocks' past/present/future status
var refreshScheduleStatuses = function() {
  var hourNow = parseInt(dayjs().format('H'));

  // at midnight, refresh everything
  if (dayjs().startOf('day').format() !== today) {
    clearInterval(heartbeat);
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

  for (var i = 0; i < workdayScheduleData.schedule.length; i++) {
    if (workdayScheduleData.schedule[i].hour === hour) {
      workdayScheduleData.schedule[i].description = newDescription;
      break;
    }
  }
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


// get things started
initSchedule();

// check for hour transitions and update past/present/future statuses
var heartbeat = setInterval(refreshScheduleStatuses, 1000 * 60);
