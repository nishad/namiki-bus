$(document).ready(function() {
    
  function pad(time) {
    if(time < 10) {
      return '0'+time;
    } else {
      return time;
    }
  }
  
  function minuteOrMinutes(minutes) {
    return (minutes == 1)?' minute':' minutes';
  }
  
  function minutesToDeparture(now, departureTime) {
    var milliseconds = departureTime.getTime() - now.getTime();
    return Math.round(milliseconds/60000);
  }
  
  function nextDepartureThisHour(departures, departureTime) {
    for(var index in departures) {
      if(departures[index] >= departureTime.getMinutes()) {
        return departures[index];
      }
    }
    return undefined;
  }
  
  function nextDeparture(departureMatrix, now) {
    var departureTime = new Date(now);
    var nextDeparture;
    while(nextDeparture === undefined) {
      
      if(departureMatrix[departureTime.getHours()] === undefined) {
        departureTime.setHours(6);
        hour = 6;
      }

      var departures = departureMatrix[departureTime.getHours()];
      nextDeparture = nextDepartureThisHour(departures, departureTime);

      if(nextDeparture === undefined) {
        if(departureTime.getHours() === 23) {
          departureTime.setDate(departureTime.getDate() + 1);
          departureTime.setHours(0);
        } else {
          departureTime.setHours(departureTime.getHours() + 1);
        }
        departureTime.setMinutes(0);
      } else {
        departureTime.setMinutes(nextDeparture);
      }
    }
    return departureTime;
  }
  
  function departuresThisDay(departures_weekdays, departures_weekends, now) {
    if(now.getDay() === 6 || now.getDay() === 7) {
      return departures_weekends;
    } else {
      return departures_weekdays;
    }
  }

  function showNextDeparture(departures_weekdays, departures_weekends, now, selector) {
    var departures = departuresThisDay(departures_weekdays, departures_weekends, now);
    var next = nextDeparture(departures, now);
    var minutes = minutesToDeparture(now, next);
    $(selector).text(pad(next.getHours()) + ':' + pad(next.getMinutes()) + 
    '   -   ' + minutes + minuteOrMinutes(minutes));
    
  }

  var now = new Date();
  showNextDeparture(DEPARTURES_FROM_NAMIKI_WEEKDAYS, DEPARTURES_FROM_NAMIKI_WEEKENDS, now, '#from_luma');
  showNextDeparture(DEPARTURES_TO_NAMIKI_WEEKDAYS, DEPARTURES_TO_NAMIKI_WEEKENDS, now, '#to_luma');
  
  
  
  function buildTimetable(departures_weekdays, departures_weekends) {
    var timetable = $('<div class="timetable rounded"></div>');
    var now = new Date();
    var departures = departuresThisDay(departures_weekdays, departures_weekends, now);
    
    var next = nextDeparture(departures, now);
    
    var departuresInHour = departures[next.getHours()];
    addToTimetable(timetable, next.getHours(), departuresInHour, next);
    if(departures[next.getHours() + 1]) {
      var departuresNextHour = departures[next.getHours() + 1];
      addToTimetable(timetable, next.getHours()+1, departuresNextHour);
    }
    return timetable;
  }
  
  function addToTimetable(timetable, hour, departures, next) {
    for(var index in departures) {
      var row = $('<div>' + pad(hour) + ':' + pad(departures[index]) + '</div>');
      if(next && (departures[index] === next.getMinutes())) {
        row.addClass('nextDeparture');
      }
      timetable.append(row);
    }
    return timetable;
  }
  
  function addTimetableButtonEvent(button, departures_weekdays, departures_weekends) {
    $(button).click(function() {
      var timetable = buildTimetable(departures_weekdays, departures_weekends);
      timetable.insertAfter(button);
      setTimeout(function(){
        $('body').one('click touchstart', function(e) {
          timetable.remove();
          return false;
        });
      }, 100);
    });
  }
  
  addTimetableButtonEvent('#show_timetable_from_luma', DEPARTURES_FROM_NAMIKI_WEEKDAYS, DEPARTURES_FROM_NAMIKI_WEEKENDS);
  addTimetableButtonEvent('#show_timetable_to_luma', DEPARTURES_TO_NAMIKI_WEEKDAYS, DEPARTURES_TO_NAMIKI_WEEKENDS);
  
  
});