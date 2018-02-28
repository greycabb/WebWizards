// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import registerServiceWorker from './registerServiceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; //import our component
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import LoginPage from './Login';
import SignupPage from './Signup';

//can load other CSS files (e.g,. Bootstrap) here
import 'bootstrap/dist/css/bootstrap.css';

//load our CSS file
import './index.css';

//render the Application view with routes!
ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={LoginPage} />
      <Route path="login" component={LoginPage} />
      <Route path="signup" component={SignupPage} />
    </Route>
  </Router>,
  document.getElementById('root')
);