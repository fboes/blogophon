(function () {
  'use strict';
  document.body.addEventListener( 'click', function(e) {
    var el = e.target.closest('a.gallery__link');
    if (el && el.getAttribute('href')) {
      e.preventDefault();
      var imagePopup = document.getElementById('image-popup');
      if (!imagePopup) {
        imagePopup = document.createElement('div');
        imagePopup.setAttribute('class', 'image-popup');
        imagePopup.setAttribute('id', 'image-popup');
        imagePopup.innerHTML = '<img src="#" alt="" />';
        document.body.appendChild(imagePopup);
      }
      imagePopup.getElementsByTagName('img')[0].setAttribute('src', el.getAttribute('href'));
    }
  });
  document.body.addEventListener( 'click', function(e) {
    var el = e.target.closest('#image-popup');
    if (el) {
      document.body.removeChild(el);
    }
  });
}());
