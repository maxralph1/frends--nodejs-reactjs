const routeNames = {
  'home': '/',
  'register': '/register', 
  'login': '/login', 
  'dashboard': '/dashboard', 
  // 'categories.index': '/categories', 
  // 'categories.create': '/categories/create', 
  // 'categories.edit': '/categories/:id/edit', 
  // 'meals.index': '/meals', 
  // 'meals.create': '/meals/create', 
  // 'meals.edit': '/meals/:id/edit', 
}
 
function route(name, params = {}) {
  let url = routeNames[name]
 
  for (let prop in params) {
    if (Object.prototype.hasOwnProperty.call(params, prop)) {
      url = url.replace(`:${prop}`, params[prop])
    }
  }
 
  return url
}
 
export { route }