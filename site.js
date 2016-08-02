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


  function loadToc($content, $toc, selector) {
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
        if ((headerHeights[name] < currentTop + 20 && headerHeights[name] > headerHeights[best]) || best === null) {
          best = name;
        }
      }

      $(".toc a[href='#" + best + "']").addClass("active");
    };

    var generateToc = function() {
      var tocHtml = $content.find(selector).map(function() {
        var text = $(this).data("toc-title") || $(this).text();
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
      $toc.find('a').click(function() {
        setTimeout(refreshToc, 1);
      });

      $(window).scroll(debounce(refreshToc, 200));
      $(window).resize(debounce(recacheHeights, 200));
    };

    $(makeToc);

    window.recacheHeights = recacheHeights;
  }

  $(function() {
    loadToc($('.content'), $('.toc-content'), 'h1');
    $(window).scroll(debounce(function() {
      $('.toc-wrap').each(function() {
        if ($(this).offset().top <= $(document).scrollTop() + 10) {
          $(this).children('.toc').addClass('floating');
        } else {
          $(this).children('.toc').removeClass('floating');
        }
      })
    }));
  })

})();
