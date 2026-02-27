(function(window) {
    class AttmarkWidget {
      constructor() {
        this.defaults = {
          theme: 'light',
          width: '100%',
          height: '600px',
          autoResize: true
        };
      }
  
      init(options = {}) {
        const config = { ...this.defaults, ...options };
        const container = document.querySelector(config.container);
        
        if (!container) {
          console.error('AttmarkWidget: Container element not found');
          return;
        }
  
        const iframe = document.createElement('iframe');
        iframe.src = `${window.location.origin}/embed/dashboard${this.getQueryString(config)}`;
        iframe.style.width = config.width;
        iframe.style.height = config.height;
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.allow = 'camera; microphone';
        
        iframe.onload = () => {
          if (config.onLoad) config.onLoad();
        };
  
        iframe.onerror = (error) => {
          if (config.onError) config.onError(error);
        };
  
        container.appendChild(iframe);
  
        if (config.autoResize) {
          window.addEventListener('message', (event) => {
            if (event.data.type === 'resize') {
              iframe.style.height = event.data.height + 'px';
            }
          });
        }
      }
  
      getQueryString(config) {
        const params = new URLSearchParams();
        if (config.theme) params.set('theme', config.theme);
        if (config.apiKey) params.set('api_key', config.apiKey);
        return params.toString() ? '?' + params.toString() : '';
      }
    }
  
    window.AttmarkWidget = new AttmarkWidget();
  })(window);