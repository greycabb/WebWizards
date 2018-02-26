// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h1 className="App-title">Welcome to React</h1>
//         </header>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }

// export default App;

import React from 'react';

//a "root" component
class App extends React.Component {
  //how to display this component
  render() {
    return (
      <div>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

//more Components can go here!


export default App; //make this class available to other files (e.g., index.js)