import * as React from "react";
import * as ReactRedux from "react-redux";

type Saga0 = () => Iterator<any>;
type Saga1 = (...arg1: any[]) => Iterator<any>;

export type Saga = Saga0 | Saga1;

export interface Task {
  isRunning(): boolean;
  cancel(): void;
}

export type SagaRun = <S extends Saga>(saga: S, ...args: any[]) => Task;

export interface SagaParams {
  force?: boolean;
  hold?: boolean;
}
export interface SagaInputParams extends SagaParams {
  saga: Saga;
}

export interface SagaComponent extends SagaInputParams {
  name: string;
}

export interface StoreSaga extends SagaComponent {
  count: number;
  task?: Task;
}

interface SagaInputObj {
  [key: string]: Saga | SagaInputParams;
}

export interface StoreWithSaga {
  runSaga: SagaRun;
  sagas: StoreSaga[];
}

interface Context {
  store: StoreWithSaga | null;
}

type withSagaType = <P extends {}>(
  newSagas: SagaInputObj,
) => (Component: React.ComponentType<P>) => React.ComponentType<P>;

export function instanceOfSagaParams(
  saga: Saga | SagaInputParams,
): saga is SagaInputParams {
  return "saga" in saga;
}

export const getNormalizeSaga = (
  sagaObj: Saga | SagaInputParams,
): SagaInputParams => {
  if (instanceOfSagaParams(sagaObj)) {
    const { saga, force = false, hold = false } = sagaObj;
    return { saga, force, hold };
  }
  return {
    force: false,
    hold: false,
    saga: sagaObj,
  };
};

const reactReduxContextKey = "ReactReduxContext";
const ReactReduxContext = ReactRedux[reactReduxContextKey];

const DefaultContext: React.FC = (props: any): any => props.children();

const withSaga: withSagaType = (newSagas: SagaInputObj) => <P extends {}>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> => (mainProps: any) => {
  const RenderWrap = ReactReduxContext
    ? ReactReduxContext.Consumer
    : DefaultContext;
  return (
    <RenderWrap>
      {(MainContext: any) => {
        class WithAppendSaga extends React.Component<any> {
          public static contextTypes = {
            store: () => null,
          };

          public ownSagas: SagaComponent[] = [];

          public store: StoreWithSaga | null;

          constructor(props: any, context: Context) {
            super(props, context && context.store ? context : MainContext);

            const finalContext: Context =
              context && context.store ? context : MainContext;
            if (
              finalContext &&
              finalContext.store &&
              finalContext.store.runSaga
            ) {
              this.store = finalContext.store;
              this.store.sagas = this.store.sagas || [];
              const { runSaga, sagas: storeSagas } = this.store;
              Object.keys(newSagas).forEach((sagaName: string) => {
                const { saga, force, hold } = getNormalizeSaga(
                  newSagas[sagaName],
                );
                const finalSagaName = force
                  ? `${sagaName}_${Math.random() * 10000000}`
                  : sagaName;

                this.ownSagas.push({
                  force,
                  hold,
                  name: finalSagaName,
                  saga,
                });

                const storeSaga = storeSagas.find(
                  (sagaObj: StoreSaga) => sagaObj.name === finalSagaName,
                );

                if (storeSaga && !force) {
                  storeSaga.count += 1;
                } else {
                  storeSagas.push({
                    count: 1,
                    force,
                    hold,
                    name: finalSagaName,
                    saga,
                    task: runSaga(saga, props),
                  });
                }
              });
            } else {
              this.store = null;

              if (process.env.NODE_ENV !== "production") {
                console.error(
                  "RunSaga function not found. You need to add runSaga to the Store",
                );
              }
            }
          }

          public componentWillUnmount() {
            if (this.store && this.store.runSaga) {
              const { sagas } = this.store;
              this.ownSagas.forEach((ownSaga: SagaComponent) => {
                const { name, hold } = ownSaga;
                const storeSaga = sagas.find(
                  (saga: StoreSaga) => saga.name === name,
                );
                if (storeSaga) {
                  if (storeSaga.count > 1 || hold) {
                    storeSaga.count -= 1;
                  } else if (
                    storeSaga.count === 1 &&
                    storeSaga.task &&
                    storeSaga.task.isRunning()
                  ) {
                    storeSaga.task.cancel();
                    if (this.store) {
                      this.store.sagas = this.store.sagas.filter(
                        (saga: StoreSaga) => saga.name !== storeSaga.name,
                      );
                    }
                  }
                }
              });
            }
          }

          public render() {
            return <Component {...this.props as any} />;
          }
        }
        return <WithAppendSaga {...mainProps} />;
      }}
    </RenderWrap>
  );
};

export default withSaga;
