const WebcomponentsFromHtml = {
  findComponents(html) {
    let componentNames = [];
    if (html) {
      let matches = html.match(/<([a-zA-Z0-9]+-[a-zA-Z0-9-_]+)/g);
      if (matches) {
        matches.forEach((match) => {
          componentNames.push(match.replace(/^</, ''));
        });
      }
    }
    return componentNames;
  },

  getScripts(webComponents, config) {
    let scripts = {};
    if (!config.componentScripts) {
      return scripts;
    }

    webComponents.forEach((webComponent) => {
      if (config.componentScripts[webComponent]) {
        scripts[webComponent] = config.componentScripts[webComponent];
      }
    });
    return scripts;
  },

  getConsolidatedComponentScripts(index) {
    let consolidatedComponentScripts = {};
    index.forEach(function(post) {
      for (const type in post.componentScripts) {
        for (const componentName in post.componentScripts[type]) {
          if (!consolidatedComponentScripts[type]) {
            consolidatedComponentScripts[type] = {};
          }
          consolidatedComponentScripts[type][componentName] = post.componentScripts[type][componentName];
        }
      }
    });

    return consolidatedComponentScripts;
  }
};

export default WebcomponentsFromHtml;
