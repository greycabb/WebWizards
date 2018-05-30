# Web Wizards 

## Overview of Project

Web Wizards is a web application that allows children to learn web development through the use of a simple drag-and-drop interface without the current challenges of typing, navigating a computer, and remembering syntax. Users are able to drag customizable blocks to build their websites with their own personalized design. By creating new websites and interacting with the application, users can earn points to unlock new avatars.
&nbsp;
## List of Contents
* Client
  * React app build
  * React source code
  *  Images
  *  Deployment, build, and renewing certificates scripts
* Microservices
  *  Kid friendly image reference points database
  *  HTML block and CSS attributes database
* Server
  *  Server gateway
  *  Structure Models
     *   Blocks
     *   Projects
     *   Users
  *  Session stores
  *  API handlers
  *  Deployment, build, and renewing certificates scripts
&nbsp;
## Summary of Technology Decisions

We used React.js to make our application because it requires interaction and re-rendering of many individual parts. React.js allowed us to split up the application into a multitude of small components, which in turn provides a fast interface for our users to interact with.

React.js has widespread support and a large range of libraries to build off of. For instance, React’s babel functionality means that we can use modern JS techniques even on older machines. This is useful because many schools still use older browsers. 

We used Enzyme with React.js to complete integration testing for several client-side components, as it has a useful mount() method in which we can test the entire DOM as a whole. Node.js was used for stress testing, because it provides a simple and quick way to make asychronous API calls. 

We chose Golang because of group's familiarity with how the database works. In addition to Golang, we used MongoDB because it is easy to store different types of structures, including complex, nested objects. This was imperative for the complexity of block and project storage.

## Contact Information
Melody Lee (Developer): genuine.mel@gmail.com &nbsp;

Michael Lew (Developer): greycabbage@gmail.com &nbsp;

Alyxis Burks (UX Designer): alyxistarynburks@gmail.com &nbsp;

Andrew Vuong (UX Designer): andrewvuong@outlook.com &nbsp;

