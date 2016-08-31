'use strict';

/**
 * Represents all posts.
 * @constructor
 */
var Index = function () {
  var index    = [];
  var tags     = {};
  var isSorted = true;
  var pubDate  = new Date();

  var internal = {
    /**
     * [sortIndex description]
     * @return {[type]} [description]
     */
    sortIndex: function() {
      index.sort(function(a,b){
        if (a.meta.timestamp < b.meta.timestamp) {
          return 1;
        } else if (a.meta.timestamp > b.meta.timestamp) {
          return -1;
        }
        return 0;
      });
      isSorted = true;
    },
    /**
     * [getPageName description]
     * @param  {[type]} curPage [description]
     * @param  {[type]} maxPage [description]
     * @param  {[type]} reverse [description]
     * @return {[type]}         [description]
     */
    getPageName: function (curPage, maxPage, reverse) {
      curPage ++;
      if (curPage <= 0 || curPage > maxPage) {
        return null;
      } else if ((!reverse && curPage === 1) || (reverse && curPage === maxPage)) {
        return 'index.html';
      } else {
        return 'index-' + curPage + '.html';
      }
    }
  };

  var exports = {
    /**
     * [clear description]
     * @return {[type]} [description]
     */
    clear: function () {
      isSorted = false;
      index = [];
    },

    /**
     * [push description]
     * @param  {[type]} post [description]
     * @return {[type]}      [description]
     */
    push: function (post) {
      isSorted = false;
      index.push(post);
    },

    /**
     * [pushArray description]
     * @param  {[type]} posts [description]
     * @return {[type]}       [description]
     */
    pushArray: function (posts) {
      isSorted = false;
      index = posts;
    },

    /**
     * Remove all items form index which have a future timestamp.
     * @return {Number} of items removed
     */
    removeFutureItems: function () {
      if (!isSorted) {
        internal.sortIndex();
      }
      var now   = Math.round(new Date().getTime() / 1000);
      var count = 0, i;
      for(i = 0; i < index.length; i++) {
        if (index[i].meta.timestamp > now) {
          count++;
        } else {
          break;
        }
      }
      if (count) {
        index.splice(0,count);
      }
      return count;
    },

    /**
     * [makeNextPrev description]
     * @return {[type]} [description]
     */
    makeNextPrev: function () {
      if (!isSorted) {
        internal.sortIndex();
      }
      var i;
      for(i = 0; i < index.length; i++) {
        if (i > 0 && index[i-1]) {
          index[i].prev = index[i-1].meta;
        }
        if (i < index.length -1 &&  index[i+1]) {
          index[i].next = index[i+1].meta;
        }
      }
      return this;
    },

    /**
     * Get all posts, sorted by date.
     * @param  {integer} i Only return i results. If left empty, all results will be returned.
     * @return {Array}   [description]
     */
    getPosts: function(i) {
      if (!isSorted) {
        internal.sortIndex();
      }
      return i ? index.slice(0,i) : index;
    },

    /**
     * [getTags description]
     * @return {[type]} [description]
     */
    getTags: function() {
      if (!isSorted) {
        internal.sortIndex();
      }
      index.forEach(function(post){
        if (post.meta.Tags) {
          post.meta.Tags.forEach(function(tag){
            if (tags[tag.id] === undefined) {
              tags[tag.id] = tag;
              tags[tag.id].index = [];
            }
            tags[tag.id].index.push(post);
          });
        }
      });
      return tags;
    },

    /**
     * Get whole index, split up into separate pages.
     * @param  {[type]} itemsPerPage [description]
     * @param  {[type]} reverse      [description]
     * @return {[type]}              [description]
     */
    getPagedPosts: function(itemsPerPage, reverse) {
      if (!isSorted) {
        internal.sortIndex();
      }
      if (!itemsPerPage) {itemsPerPage = 10;}
      var pages = [], page = 0, newIndex = index, currentSlice = [];
      if (reverse) {
        newIndex = newIndex.reverse();
      }
      do {
        page ++;
        currentSlice = newIndex.slice(itemsPerPage * (page-1),itemsPerPage * page);
        if (reverse) {
          currentSlice = currentSlice.reverse();
        }
        pages.push(currentSlice);
      } while (page * itemsPerPage < index.length);
      return pages;
    },

    /**
     * Get meta data for a single page.
     * @param  {[type]} curPage [description]
     * @param  {[type]} maxPage [description]
     * @param  {[type]} reverse [description]
     * @return {[type]}         [description]
     */
    getPageData: function (curPage, maxPage, reverse) {
      return {
        currentUrl: internal.getPageName(curPage, maxPage, reverse),
        nextUrl: internal.getPageName(curPage+1, maxPage, reverse),
        prevUrl: internal.getPageName(curPage-1, maxPage, reverse),
        currentPage: (curPage+1),
        nextPage: ((curPage+2 < maxPage) ? curPage+2 : null),
        prevPage: ((curPage > 0) ? curPage : null),
        maxPages: maxPage
      };
    }
  };

  return exports;
};

module.exports = Index;
