redux-saga-connect is a decorator react components to connect the sagas runtime.
### Example
```javascript
export default withSaga({mainSaga})(Component);
```
# Getting started

## Install

```sh
$ npm install --save redux-saga-connect
```
or

```sh
$ yarn add redux-saga-connect
```

## Configuration
When you create a redux store function *sagaMiddleware.run* must be saved to the store object named *runSaga*
```javascript 
// create store
// ...
import createSagaMiddleware from 'redux-saga'
// ...
const sagaMiddleware = createSagaMiddleware()
// ...
store.runSaga = sagaMiddleware.run; // name `runSaga` required
// ...
```
Decorator using React.Context gets access to the runSaga function
In the component constructor (to launch saga as quickly as possible), sagas is started using the *runSaga* function. 
In *componentWillUnmount* will cancel running sagas
### Example
```javascript
// with es6
import React from 'react';
import withSaga from 'redux-saga-connect'

// React component
const Component = () => (<div>Component</div>);

// Saga
function* mainSaga(){};

// Return enhancered component
export default withSaga({mainSaga})(Component);

// with recompose
export default compose(withSaga({mainSaga}))(Component)
```
```typescript jsx
// with typescript
import React from 'react';
import withSaga from 'redux-saga-connect'

// React component
interface ComponentProps {}
const Component: React.FC<ComponentProps> = () => <div>Component</div>;

// Saga
function* mainSaga() {}

// Return enhancered compoenent
export default withSaga<ComponentProps>({ mainSaga })(Component);

// with recompose
export default compose<ComponentProps, ComponentProps>(withSaga({ mainSaga }))(
  Component,
);
```
## Parameters
withSaga is a decorator with parameters

withSaga(objectOfSagas)
 objectOfSagas  {
     [key:string]: Saga or Object
 }
### Example parameters
```javascript
import withSaga from 'redux-saga-connect';

const Component = () => (<div/>);
function* firstSaga(){};
function* secondSaga(){};

export default withSaga({ firstSaga })(Component);

// or 
export default withSaga({
  firstSaga,
  secondSaga,
})(Component);

// or 
export default withSaga({
  nameFirstSaga: firstSaga,
  nameSecondSaga: secondSaga,
})(Component);

// or 
export default withSaga({
  nameFirstSaga: firstSaga,
  nameSecondSaga: {
      saga: secondSaga,
      hold: true,   //  saga will not delete in componentWillUnmount
      force: true,  // saga will get a unique name in will start
  },
})(Component);
```
