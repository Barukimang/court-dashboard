import { fetchExchange, makeResult } from 'urql'
import { filter, make, merge, mergeMap, pipe, share, takeUntil } from 'wonka'
import env from '../../environment'
import mockedData from '../mock-data'

const OPERATION_DEFINITION = 'OperationDefinition'

export default function customFetchExchange(ref) {
  if (!env('MOCK_TEST')) {
    return fetchExchange(ref)
  }

  const { forward } = ref

  const isOperationQuery = operation => {
    const { operationName } = operation
    return operationName === 'query'
  }

  return ops$ => {
    const sharedOps$ = share(ops$)
    const fetchResults$ = pipe(
      sharedOps$,
      filter(isOperationQuery),
      mergeMap(operation => {
        const { key } = operation
        const teardown$ = pipe(
          sharedOps$,
          filter(op => op.operationName === 'teardown' && op.key === key)
        )

        return pipe(mockData(operation), takeUntil(teardown$))
      })
    )

    const forward$ = pipe(
      sharedOps$,
      filter(op => !isOperationQuery(op)),
      forward
    )

    return merge([fetchResults$, forward$])
  }
}

const mockData = operation => {
  return make(({ next, complete }) => {
    const { name: queryName } = operation.query.definitions.find(
      node => node.kind === OPERATION_DEFINITION && node.name
    )

    const abortController =
      typeof AbortController !== 'undefined' ? new AbortController() : undefined
    const convertedData = mockedData[queryName.value]

    Promise.resolve()
      .then(() =>
        makeResult(
          operation,
          {
            data: convertedData,
          },
          null
        )
      )
      .then(result => {
        next(result)
        complete()
      })

    return () => {
      if (abortController !== undefined) {
        abortController.abort()
      }
    }
  })
}