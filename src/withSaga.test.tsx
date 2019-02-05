import * as React from "react";
import { mount } from "enzyme";
import { take } from "redux-saga/effects";
import withSaga from "./index";
import { BaseComponent, createStoreComponent } from "./setupEnzyme";

const getSagaWithSpy = () => {
  const spy = jest.fn();
  function* saga(propsSaga: any) {
    spy(propsSaga);
    while (true) {
      yield take("ACTION");
      console.log("ACTION");
    }
  }
  return { spy, saga };
};
const getObjects = () => {
  const { spy, saga } = getSagaWithSpy();
  const EnchercedComponent = withSaga({ saga })(BaseComponent);
  const { Component, store } = createStoreComponent(EnchercedComponent);
  return { spy, EnchercedComponent, Component, store };
};

test("should call saga with props", () => {
  const props = {
    test: "test",
  };
  const { EnchercedComponent, Component, spy, store } = getObjects();
  const wrapper = mount(<Component {...props} />);
  expect(wrapper.find(EnchercedComponent).length).toEqual(1);
  expect(spy.mock.calls.length).toEqual(1);
  expect(spy.mock.calls[0][0]).toEqual(props);
  expect(store.sagas.length).toEqual(1);
  wrapper.unmount();
  expect(store.sagas.length).toEqual(0);
});

test("should run one saga  and count should be 2", () => {
  const props = {
    test: "test",
  };
  const { Component, spy, store } = getObjects();
  const wrapper = mount(
    <div>
      <Component {...props} />
      <Component {...props} />
    </div>,
  );
  expect(spy.mock.calls[0][0]).toEqual(props);
  expect(store.sagas.length).toEqual(1);
  expect(store.sagas[0].count).toEqual(2);
  wrapper.unmount();
  expect(store.sagas.length).toEqual(0);
});

test("should run two saga", () => {
  const props = {
    test: "test",
  };
  const { spy, saga } = getSagaWithSpy();
  const { Component, store } = createStoreComponent(
    withSaga({
      saga: {
        saga,
        force: true,
      },
    })(BaseComponent),
  );
  const wrapper = mount(
    <div>
      <Component {...props} />
      <Component {...props} />
    </div>,
  );
  expect(spy.mock.calls[0][0]).toEqual(props);
  expect(spy.mock.calls[1][0]).toEqual(props);
  expect(store.sagas.length).toEqual(2);
  expect(store.sagas[0].count).toEqual(1);
  expect(store.sagas[1].count).toEqual(1);
  wrapper.unmount();
  expect(store.sagas.length).toEqual(0);
});

test("should run one saga and not remove saga after unmount", () => {
  const props = {
    test: "test",
  };
  const { spy, saga } = getSagaWithSpy();
  const { Component, store } = createStoreComponent(
    withSaga({
      saga: {
        saga,
        hold: true,
      },
    })(BaseComponent),
  );
  const wrapper = mount(
    <div>
      <Component {...props} />
      <Component {...props} />
    </div>,
  );
  expect(spy.mock.calls[0][0]).toEqual(props);
  expect(store.sagas.length).toEqual(1);
  expect(store.sagas[0].count).toEqual(2);
  wrapper.unmount();
  expect(store.sagas.length).toEqual(1);
});

test("should run two saga and not remove saga after unmount", () => {
  const props = {
    test: "test",
  };
  const { spy, saga } = getSagaWithSpy();
  const { Component, store } = createStoreComponent(
    withSaga({
      saga: {
        saga,
        force: true,
        hold: true,
      },
    })(BaseComponent),
  );
  const wrapper = mount(
    <div>
      <Component {...props} />
      <Component {...props} />
    </div>,
  );
  expect(spy.mock.calls[0][0]).toEqual(props);
  expect(spy.mock.calls[1][0]).toEqual(props);
  expect(store.sagas.length).toEqual(2);
  expect(store.sagas[0].count).toEqual(1);
  expect(store.sagas[1].count).toEqual(1);
  wrapper.unmount();
  expect(store.sagas.length).toEqual(2);
});

test("should run multiple saga", () => {
  const props = {
    test: "test",
  };
  const { spy: spy1, saga: saga1 } = getSagaWithSpy();
  const { spy: spy2, saga: saga2 } = getSagaWithSpy();
  const { Component, store } = createStoreComponent(
    withSaga({
      saga1,
      saga2,
    })(BaseComponent),
  );
  const wrapper = mount(<Component {...props} />);
  expect(spy1.mock.calls[0][0]).toEqual(props);
  expect(spy2.mock.calls[0][0]).toEqual(props);
  expect(store.sagas.length).toEqual(2);
  expect(store.sagas[0].count).toEqual(1);
  expect(store.sagas[1].count).toEqual(1);
  wrapper.unmount();
  expect(store.sagas.length).toEqual(0);
});

test("should print erorr store", () => {
  jest.spyOn(global.console, "error");
  const props = {
    test: "test",
  };
  const { spy, saga } = getSagaWithSpy();
  const Component: any = withSaga({
    saga,
  })(BaseComponent);
  const wrapper = mount(<Component {...props} />);
  expect(spy).not.toBeCalled();
  expect(wrapper.html()).toEqual("<div></div>");
  expect(console.error).toBeCalled();
  wrapper.unmount();
});
