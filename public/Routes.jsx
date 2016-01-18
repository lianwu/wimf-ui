var React = require('react');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;  // actual router object that decide what content is shown on the page based on the current url
var Route = ReactRouter.Route;  // an object that configure the router
var Main = require('./components/Main.jsx');

var CreateHistory = require('history/lib/createHashHistory');

var History = new CreateHistory({
  queryKey: false,
});

var Routes = (
  <Router history={History}>
    <Route path="/" component={Main}></Route>
  </Router>
);

module.exports = Routes;
