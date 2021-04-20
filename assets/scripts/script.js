// initialize some globals
const workdayFirstHour = 8;  // hour of day, 0 - 23
const workdayLastHour = 18;  // hour of day, 0 - 23
var today = dayjs().startOf('day').format();  // date/timestamp for today at 00:00
var now = dayjs();
var currentHour = parseInt(dayjs().format('H'));
var workdayScheduleData = {};

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
  console.log(scheduleData);
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
  $('.description').off('click');
  $('.present, .future').on('click', editDescription);
};

var editDescription = function() {
  $(this).addClass('active');
  $(this).siblings('.saveBtn').addClass('active');
  $(this).off('click');

  var description = $(this).html();
  console.log('description:', description);
  var descriptionTextarea = $('<textarea class="edit-description">').val(description);
  $(this).html(descriptionTextarea);
  $('.edit-description').trigger('focus');
  
  // add save button handler
  $('.saveBtn.active').on('click', saveDescription).css('cursor: pointer');
};

var saveDescription = function() {
  console.log('save button element', $(this).html());
  $(this).off('click');
  $(this).removeClass('active').css('cursor: default');

  var timeBlockEl = $(this).parent();
  var hour = parseInt(timeBlockEl.attr('data-hour'));
  var descriptionEl = timeBlockEl.children('.description').first();
  var editDescriptionEl = descriptionEl.children('.edit-description').first();
  var newDescription = editDescriptionEl.val();
  descriptionEl.html(newDescription);
  descriptionEl.removeClass('active');
  console.log('changing hour', hour);
  console.log('changing to "' + newDescription + '"');

  for (var i = 0; i < workdayScheduleData.schedule.length; i++) {
    if (workdayScheduleData.schedule[i].hour === hour) {
      console.log(workdayScheduleData.schedule[i].description);
      workdayScheduleData.schedule[i].description = newDescription;
      console.log(workdayScheduleData.schedule[i].description);
      break;
    }
  }
  localStorage.setItem('schedule', JSON.stringify(workdayScheduleData));
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
