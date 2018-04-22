/* global $ */
/* global localStorage */
var template = function(text) {
  return `\
    <p>
      <input type="button" class="timer back" value="0:00">
      <span class="back">${text}</span>
      <i class="glyphicon glyphicon-remove"></i>
    </p>`;
};

var saveList = function() {
  var items = $('div.list').children('p').map( function() {
    return {
      'name' : $(this).children('span').first().text(),
      'back' : $(this).children('input').hasClass('back'),
      'front' : $(this).children('input').hasClass('front'),
      'old' : $(this).children('input').hasClass('old'),
      'time': $(this).children('input').val(),
    };
  }).get();
  localStorage.setItem('SpeakerList', JSON.stringify(items));
  return items;
  // console.log(JSON.stringify(items));
  // alert(JSON.stringify(items));
};

var dumpList = function() {
  console.log( saveList() );
  var $mesg = $('<span/>').text('Saved').addClass('h3 red text-center');
  $('.header h1').append($mesg);
  $mesg.fadeOut(1000);
}

var loadList = function() {
  
  var previousList = localStorage.getItem('SpeakerList');
  if (previousList === null) {
    return;
  }

  $('div.list').empty();
  var items = JSON.parse(previousList);
  // console.log(items);
  items.forEach( function(item) {
    var $new_item = $(template(item.name));
    $('div.list').append( $new_item );
    var $input = $new_item.children('input').first();
    $input.removeClass('back');
    $input.val(item.time);
    if (item.back) { $input.addClass('back'); }
    if (item.front) { 
      var timearray = item.time.split(':');
      $input.addClass('front').timer({
        seconds: timearray[0] * 60 + timearray[1],
        format: '%m:%S',
        duration: '120s',
        callback: function() {
          $('.front').addClass('timeup').timer('resume');
        },
        repeat: true
      });
      $new_item.children('span').removeClass('back').addClass('front');
    }
    if (item.old) { 
      $input.addClass('old');
      $new_item.children('span')
      .removeClass('back').removeClass('front').addClass('old');
    }
  });
  $('')
};

var updateTally = function() {
  var tally = ($('.back').length - 1 )/2;
  $('#tally').text(`(${tally} waiting)`);
  saveList();
};

var main = function() {

  loadList();

  $('form').submit(function() {
    var new_item = $('input#todo').val();
    if (new_item === "") {
      saveList();
    } else {
      if (new_item == "save") { dumpList(); } 
      else if (new_item == "load") { loadList(); } 
      else if (new_item == "clear") { $('div.list').empty(); } 
      else { $('div.list').append(template(new_item)); }
      $('input#todo').val("");
      $('input#todo').focus();
    }
    updateTally();
    return false;  
  });
  
  $(document).on('click', '.glyphicon-remove', function() {
    $(this).parent().remove();
    updateTally();
  });

  $(document).on('click', '.timer', function() {
    if ( $(this).hasClass('front') ) {
      $(this)
        .removeClass('front')
        .removeClass('back')
        .addClass('old')
        .timer('remove');
      $(this).parents('p').children('span')
      .removeClass('back').removeClass('front').addClass('old');
    } else {
      $('.front').removeClass('front').addClass('old').timer('remove');
      $(this).addClass('front').removeClass('back').timer({
        format: '%m:%S',
        duration: '120s',
        callback: function() {
          $('.front').addClass('timeup').timer('resume');
        },
        repeat: true
      });
      $(this).parents('p').children('span')
      .removeClass('back').addClass('front');
    }
    
    updateTally();
  });
  updateTally();
};

$(document).ready(main);
