// Simple client-side router

class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.loadPage(path);
  }

  loadPage(path) {
    const handler = this.routes[path];
    if (handler) {
      handler();
    } else {
      // Try to find a matching route or load 404
      const matchedRoute = Object.keys(this.routes).find(route => {
        const regex = new RegExp('^' + route.replace(/:[^\s/]+/g, '([^/]+)') + '$');
        return regex.test(path);
      });

      if (matchedRoute) {
        this.routes[matchedRoute](path);
      } else {
        this.routes['/404']?.();
      }
    }
  }

  init() {
    window.addEventListener('popstate', () => {
      this.loadPage(window.location.pathname);
    });

    // Handle initial page load
    this.loadPage(window.location.pathname);
  }
}

window.router = new Router();
