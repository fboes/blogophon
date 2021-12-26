import blogophonDateFormat from '../helpers/blogophon-date-format.js';

const jsonLdPost = function(post, config) {
  if (!config) {
    throw new Error('Missing configuration in jsonLdPost');
  }
  let jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.meta.Schema.replace(/^https:\/\/schema\.org\//, ''),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.meta.AbsoluteUrl
    },
    headline: post.meta.Title,
    datePublished: blogophonDateFormat(post.meta.Created, 'rfc3339'),
    dateModified: blogophonDateFormat(post.meta.Modified, 'rfc3339'),
    author: {
      '@type': 'Person',
      name: post.meta.AuthorName
    },
    publisher: {
      '@type': 'Organization',
      name: config.name
    }
  };

  if (post.meta.Image) {
    jsonLd.image = [
      post.meta.Image
    ];
  }

  if (config.themeConf.icon12) {
    jsonLd.publisher.logo = {
      '@type': 'ImageObject',
      url: config.themeConf.icon128.src
    };
  }

  return jsonLd;
};

export default jsonLdPost;
