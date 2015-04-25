import React from 'react';
import { Route, DefaultRoute, NotFoundRoute } from 'react-router';

import App from './pages/app.jsx';
import Main from './pages/main.jsx';
import About from './pages/about.jsx';
import NotFound from './pages/notFound.jsx';

var routes = (
  <Route name="app" path="/" handler={ App }>
    <Route name="main" handler={ Main } />
    <Route name="about" handler={ About } />
    <DefaultRoute handler={ Main } />
    <NotFoundRoute handler={ NotFound } />
  </Route>
);

export default routes;