;(function () {
  'use strict';

  var debounce = function(func, waitTime) {
    var timeout = false;
    return function() {
      if (timeout === false) {
        setTimeout(function() {
          func();
          timeout = false;
        }, waitTime);
        timeout = true;
      }
    };
  };

  function loadToc($content, $toc, selector, topPad) {
    var headerHeights = {};

    var recacheHeights = function() {
      headerHeights = {};

      $content.find(selector).each(function() {
        headerHeights[$(this).attr('id')] = $(this).offset().top;
      });
    };

    var refreshToc = function() {
      $toc.find(".active").removeClass("active");
      var currentTop = $(document).scrollTop();

      var best = null;
      for (var name in headerHeights) {
        if ((headerHeights[name] < currentTop + topPad && headerHeights[name] > headerHeights[best]) || best === null) {
          best = name;
        }
      }

      $(".toc a[href='#" + best + "']").addClass("active");
    };

    var generateToc = function() {
      var tocHtml = $content.find(selector).map(function() {
        var text = $(this).data("toc-title") || $(this).text();
        var href;
        if ($(this).attr("id") === undefined) {
          $(this).attr("id", encodeURIComponent($(this).text().replace(/ /gi, "-")));
        }
        var href = "#" + $(this).attr("id");
        return "<a class='toc-link' href='" + href + "'>" + text + "</a>";
      }).get().join('');

      $toc.prepend(tocHtml);
    }

    var makeToc = function() {
      generateToc();
      recacheHeights();
      refreshToc();

      // reload immediately after scrolling on toc click
      $toc.find('a.toc-link').click(function() { // todo refactor out class names
        setTimeout(function() {
          refreshToc();
          $('.toc-wrap').removeClass('visible'); // todo refactor out class names
          $(window).scrollTop($(window).scrollTop() - topPad + 1);
        }, 0);
      });

      $('a.toc-show-link').click(function() { // todo refactor out class names
        $('.toc-wrap').toggleClass('visible'); // todo refactor out class names
        return false;
      });

      $(window).scroll(debounce(refreshToc, 200));
      $(window).resize(debounce(recacheHeights, 200));
    };

    $(makeToc);

    window.recacheHeights = recacheHeights;

    return function() {
      var isDesktop = $(window).width() > 767;
      $('.toc-wrap').each(function() {
        if ($(this).offset().top <= $(document).scrollTop() + topPad && isDesktop) {
          $(this).children('.toc').css("top", topPad + "px").addClass('floating');
        } else {
          $(this).children('.toc').css("top", "").removeClass('floating');
        }
      })
    };
  }



})();
