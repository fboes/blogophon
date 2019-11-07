(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  var imagePopup = {
    el: null,
    create: function() {
      this.el = document.createElement('div');
      this.el.setAttribute('class', 'image-popup');
      this.el.innerHTML = '<img src="#" alt="" />';
      document.body.appendChild(this.el);
      document.body.addEventListener('click', imagePopup.remove);
      document.addEventListener('keyup', imagePopup.removeOnEsc);
      window.onpopstate = function(event) {
        if (event.state && event.state.image) {
          if (!imagePopup.el) {
            imagePopup.create();
          }
          imagePopup.setImage(event.state.image, true);
        } else if(imagePopup.el) {
          imagePopup.remove(event, true);
        }
      };
    },
    remove: function(event, noPushState) {
      event.preventDefault();
      event.stopPropagation();
      document.body.removeEventListener('click', imagePopup.remove);
      document.removeEventListener('keyup', imagePopup.removeOnEsc);
      document.body.removeChild(imagePopup.el);
      imagePopup.el = null;
      if (!noPushState) {
        history.pushState({}, '', window.location.pathname);
      }
    },
    removeOnEsc: function(event) {
      if(event.keyCode === 27) {
        imagePopup.remove(event);
      }
    },
    setImage: function(href, noPushState) {
      this.el.getElementsByTagName('img')[0].setAttribute('src', href);
      if (!noPushState) {
        history.pushState({image:href}, '', '#' + href);
      }
    }
  };

  if (Element.prototype.closest) {
    document.body.addEventListener('click', function(event) {
      var el = event.target.closest('a.gallery__link');
      if (el && el.getAttribute('href')) {
        event.preventDefault();
        event.stopPropagation();
        if (!imagePopup.el) {
          imagePopup.create();
        }
        imagePopup.setImage(el.getAttribute('href'));
      }
    });
  }

  // ---------------------------------------------------------------------------
  if (Document.prototype.querySelectorAll) {
    document.querySelectorAll('[data-ajax-url]').forEach(
      function(el) {
        if (el.getAttribute('data-ajax-url')) {
          var request = new XMLHttpRequest();
          request.open('GET', el.getAttribute('data-ajax-url'), true);
          request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
              el.outerHTML = this.response;
            }
          };
          request.send();
        }
      }
    );
  }
}());
