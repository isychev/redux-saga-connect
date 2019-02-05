import * as enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import * as React from "react";
import { Provider } from "react-redux";
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore as createStoreRedux,
} from "redux";

import createSagaMiddleware from "redux-saga";

enzyme.configure({ adapter: new Adapter() });

function creatorStore(): any {
  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers = compose;
  const store: any = createStoreRedux(
    combineReducers({
      reducer: (state: any = {}) => state,
    }),
    {},
    composeEnhancers(applyMiddleware(sagaMiddleware)),
  );

  store.runSaga = sagaMiddleware.run;
  return store;
}

const createStoreComponent = (Component: any) => {
  const store: any = creatorStore();
  return {
    store,
    Component: (props: any) => (
      <Provider store={store}>
        <Component {...props} />
      </Provider>
    ),
  };
};

const BaseComponent: React.FC = () => <div />;

export { BaseComponent, createStoreComponent };
