/**
 * Represents an index of all posts.
 * @constructor
 * @return {blogophonIndex} [description]
 */
const blogophonIndex = function() {
  const external = {};
  const internal = {};

  external.index    = [];
  internal.isSorted = true;
  external.pubDate  = new Date();


  /**
   * Remove all elements from index
   * @return {blogophonIndex} [description]
   */
  external.clear = function() {
    internal.isSorted = false;
    external.index = [];
    return external;
  };

  /**
   * Add a single post to index.
   * @param  {Post}  post [description]
   * @return {blogophonIndex}      [description]
   */
  external.push = function(post) {
    internal.isSorted = false;
    external.index.push(post);
    return external;
  };

  /**
   * Add multiple posts to index.
   * @param  {Array} posts [description]
   * @return {blogophonIndex}       [description]
   */
  external.pushArray = function(posts) {
    internal.isSorted = false;
    external.index = posts;
    return external;
  };

  /**
   * Sort all items by `meta.Created`
   * @return {blogophonIndex} [description]
   */
  external.sortblogophonIndex = function() {
    external.index.sort(function(a, b){
      if (a.meta.Created.getTime() < b.meta.Created.getTime()) {
        return 1;
      } else if (a.meta.Created.getTime() > b.meta.Created.getTime()) {
        return -1;
      }
      return 0;
    });
    internal.isSorted = true;
    return external;
  };

  /**
   * Remove all items form index which have a future timestamp.
   * @return {Number} of items removed
   */
  external.removeFutureItems = function() {
    if (!internal.isSorted) {
      external.sortblogophonIndex();
    }
    let now   = new Date().getTime();
    let count = 0, i;
    for(i = 0; i < external.index.length; i++) {
      if (external.index[i].meta.Created.getTime() > now) {
        count++;
      } else {
        break;
      }
    }
    if (count) {
      external.index.splice(0, count);
    }
    return count;
  };

  /**
   * Remove all items marked as draft
   * @return {[type]} [description]
   */
  external.removeDrafts = function() {
    let newIndex = external.index.filter(function(value) {
      return !value.meta.Draft;
    });
    let count = external.index.length - newIndex.length;
    external.index = newIndex;
    return count;
  };

  /**
   * [makeNextPrev description]
   * @return {blogophonIndex} [description]
   */
  external.makeNextPrev = function() {
    if (!internal.isSorted) {
      external.sortblogophonIndex();
    }
    let i;
    for(i = 0; i < external.index.length; i++) {
      if (i > 0 && external.index[i - 1]) {
        external.index[i].prev = external.index[i - 1].meta;
      }
      if (i < external.index.length - 1 && external.index[i + 1]) {
        external.index[i].next = external.index[i + 1].meta;
      }
    }
    return external;
  };

  /**
   * Get all posts, sorted by date.
   * @param  {Number} i Only return i results. If left empty, all results will be returned.
   * @return {Array}    [description]
   */
  external.getPosts = function(i) {
    if (!internal.isSorted) {
      external.sortblogophonIndex();
    }
    return i ? external.index.slice(0, i) : external.index;
  };

  /**
   * Get all tag names and build a new index of all articles matching the tag
   * @return {Array} of Objects, `.index` contains new index
   */
  external.getTags = function() {
    if (!internal.isSorted) {
      external.sortblogophonIndex();
    }
    let tags = {};
    external.index.forEach(function(post){
      if (post.meta.Tags) {
        post.meta.Tags.forEach(function(tag){
          if (!tags[tag.id]) {
            tags[tag.id] = tag;
            tags[tag.id].index = blogophonIndex();
          }
          tags[tag.id].index.push(post);
        });
      }
    });
    return tags;
  };

  /**
   * Get all categories names and build a new index of all articles matching the categories
   * @return {Array} of Objects, `.index` contains new index
   */
  external.getCategories = function() {
    if (!internal.isSorted) {
      external.sortblogophonIndex();
    }
    let categories = {};
    external.index.forEach(function(post){
      if (post.meta.CategoryObj) {
        if (!categories[post.meta.CategoryObj.id]) {
          categories[post.meta.CategoryObj.id] = post.meta.CategoryObj;
          categories[post.meta.CategoryObj.id].index = blogophonIndex();
        }
        categories[post.meta.CategoryObj.id].index.push(post);
      }
    });
    return categories;
  };

  /**
   * [getAuthors description]
   * @return {Array} [description]
   */
  external.getAuthors = function() {
    if (!internal.isSorted) {
      external.sortblogophonIndex();
    }
    let authors = {};
    external.index.forEach(function(post){
      if (post.meta.AuthorName) {
        if (!authors[post.meta.AuthorName]) {
          authors[post.meta.AuthorName] = {
            name:   post.meta.AuthorName,
            urlObj: post.meta.authorUrlObj,
            index:  blogophonIndex()
          };
        }
        authors[post.meta.AuthorName].index.push(post);
      }
    });
    return authors;
  };

  /**
   * [getGeoArticles description]
   * @return {Array}      [description]
   */
  external.getGeoArticles = function() {
    //return blogophonIndex().pushArray(
    return external.index.filter(function(post) {
      return (post.meta.Latitude || post.meta.Longitude);
    });
    //);
  };

  /**
   * Get whole index, split up into separate pages.
   * @param  {Number}  itemsPerPage [description]
   * @param  {Boolean} reverse      [description]
   * @return {Array}                [description]
   */
  external.getPagedPosts = function(itemsPerPage, reverse) {
    if (!internal.isSorted) {
      external.sortblogophonIndex();
    }
    itemsPerPage = Math.round(itemsPerPage);
    if (!itemsPerPage) {
      itemsPerPage = 10;
    }
    let pages = [], page = 0, newblogophonIndex = external.index, currentSlice = [];
    if (reverse) {
      newblogophonIndex = newblogophonIndex.reverse();
    }
    do {
      page ++;
      currentSlice = newblogophonIndex.slice(itemsPerPage * (page - 1), itemsPerPage * page);
      if (reverse) {
        currentSlice = currentSlice.reverse();
      }
      pages.push(currentSlice);
    } while (page * itemsPerPage < external.index.length);
    return pages;
  };

  /**
   * Get meta data for a single page.
   * @param  {Number}  curPage [description]
   * @param  {Number}  maxPage [description]
   * @param  {Boolean} reverse [description]
   * @param  {String}  path    [description]
   * @return {Object}          [description]
   */
  external.getPageData = function(curPage, maxPage, reverse, path = '') {
    curPage = Math.round(curPage);
    maxPage = Math.round(maxPage);
    return {
      needsPager: (maxPage > 1),
      firstUrl: external.getPageName(0, maxPage, reverse, path),
      prevUrl: external.getPageName(curPage - 1, maxPage, reverse, path),
      currentUrl: external.getPageName(curPage, maxPage, reverse, path),
      nextUrl: external.getPageName(curPage + 1, maxPage, reverse, path),
      lastUrl: external.getPageName(maxPage - 1, maxPage, reverse, path),
      currentPage: (curPage + 1),
      prevPage: ((curPage > 0) ? curPage : null),
      nextPage: ((curPage + 2 < maxPage) ? curPage + 2 : null),
      maxPages: maxPage
    };
  };

  /**
   * Get filename of current page.
   * @param  {Number}  curPage [description]
   * @param  {Number}  maxPage [description]
   * @param  {Boolean} reverse [description]
   * @param  {String}  path    [description]
   * @return {String}          [description]
   */
  external.getPageName = function(curPage, maxPage, reverse, path = '') {
    curPage = Math.round(curPage);
    maxPage = Math.round(maxPage);
    curPage ++;
    if (curPage <= 0 || curPage > maxPage) {
      return null;
    } else if ((!reverse && curPage === 1) || (reverse && curPage === maxPage)) {
      return path + 'index.html';
    }
    return path + 'index-' + curPage + '.html';

  };

  /**
   * [toJSON description]
   * @return {Array} [description]
   */
  external.toJSON = function() {
    return external.index.map(function(item) {
      return {
        title: item.meta.Title,
        description: item.meta.Description,
        url: item.meta.urlObj.relativeUrl('index', 'json')
      };
    });
  };

  return external;
};

export default blogophonIndex;
