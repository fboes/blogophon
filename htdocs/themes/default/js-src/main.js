(function () {
  'use strict';

  if (!('querySelectorAll' in document) || !('addEventListener' in window)) {
    return;
  }

  // https://developer.mozilla.org/de/docs/Web/API/Element/closest
  if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i,
        el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {}
      } while ((i < 0) && (el = el.parentElement));
      return el;
    };
  }
  if (window.history && !window.history.pushState) {
    window.history.pushState = function(a,b,c) {
      return [a,b,c];
    };
  }

  // ---------------------------------------------------------------------------
  var imagePopup = {
    el: null,
    create: function() {
      this.el = document.createElement('div');
      this.el.setAttribute('class', 'image-popup');
      this.el.innerHTML = '<img src="#" alt="" />';
      document.body.appendChild(this.el);
      document.body.addEventListener('click', imagePopup.remove);
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
      document.body.removeChild(imagePopup.el);
      imagePopup.el = null;
      if (!noPushState) {
        history.pushState({}, '', window.location.pathname);
      }
    },
    setImage: function(href, noPushState) {
      this.el.getElementsByTagName('img')[0].setAttribute('src', href);
      if (!noPushState) {
        history.pushState({image:href}, '', '#' + href);
      }
    }
  };

  // ---------------------------------------------------------------------------
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
}());
