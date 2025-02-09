import { PureComponent, RefObject, createRef, useMemo } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../../../../pages/dashboard.store'
import { useTable, useSortBy, useFlexLayout } from 'react-table'
import CaretUpSvg from '../../../../../public/icons/caret-up.svg'
import CaretDownSvg from '../../../../../public/icons/caret-down.svg'
import numeral from 'numeral'

export interface Props {
  onClose?: () => any
  pageStore?: DashboardPageStore
}

export interface State {
}

@inject('pageStore')
@observer
export class DashboardGlobalStatsByCountryContentComponent extends PureComponent<Props, State> {
  contentRef: RefObject<HTMLDivElement> = createRef()
  scrollRef: RefObject<HTMLDivElement> = createRef()

  componentDidMount () {
    document.addEventListener('click', this.onDocumentClick)
  }

  onDocumentClick = (e: MouseEvent) => {
    const { current } = this.contentRef
    if (current && !current.contains(e.target as Node)) {
      this.props.onClose?.()
    }
  }

  onSortClick = () => {
    window.requestAnimationFrame(() => this.scrollRef.current.scrollTop = 0)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.onDocumentClick)
  }

  render () {
    return (
      <div
        ref={this.contentRef}
        className="container m-auto"
        style={{ height: '90vh', maxWidth: '1280px' }}
      >
        <div
          ref={this.scrollRef}
          className="h-full bg-white rounded md:mx-6 cursor-default depth-lg overflow-scroll scrolling-touch dashboard-spacer-x"
        >
          <Table
            data={this.props.pageStore.places}
            onSortClick={this.onSortClick}
          />
        </div>
      </div>
    )
  }
}

function FormatNumberCell (value: number, format: string) {
  return <span>{numeral(value).format(format)}</span>
}

function Table ({ data, onSortClick }) {
  const columns = useMemo(() => [{
    Header: 'Country',
    columns: [
      {
        id: 'code',
        Header: 'Code',
        accessor: 'alpha2code',
        sortType: 'alphanumeric',
        width: 20
      },
      {
        id: 'name',
        Header: 'Name',
        Cell: ({ cell }) => {
          const code = cell.row?.values?.code
          return (
            <span className="flex items-center min-w-0">
              {
                code
                  ? (
                    <span className="flex-shrink-0">
                      <img src={`/flags/${code.toLowerCase()}.svg`} className="h-line mr-2" />
                    </span>
                  )
                  : ''
              }
              <span className="flex-1 min-w-0 font-bold truncate">{cell.value}</span>
            </span>
          )
        },
        accessor: 'name',
        sortType: 'alphanumeric',
        width: 75,
      },
      {
        id: 'population',
        Header: 'Population',
        Cell: ({ cell }) => FormatNumberCell(cell.value, cell.value > 1000 ? '0.0a' : '0,0'),
        accessor: 'population',
        sortType: 'alphanumeric'
      }
    ]
  }, {
    Header: 'Stats',
    columns: [
      {
        id: 'cases',
        Header: 'Cases',
        Cell: ({ cell }) => FormatNumberCell(cell.value, '0,0'),
        accessor: 'latestData.cases',
        sortType: 'basic'
      },
      {
        id: 'deaths',
        Header: 'Deaths',
        Cell: ({ cell }) => FormatNumberCell(cell.value, '0,0'),
        accessor: 'latestData.deaths',
        sortType: 'basic'
      },
      {
        id: 'death-rate',
        Header: 'Death Rate',
        Cell: ({ cell }) => FormatNumberCell(cell.value, '0.00%'),
        accessor: 'latestData.deathRate',
        sortType: 'basic'
      },
      {
        id: 'recovered',
        Header: 'Recovered',
        Cell: ({ cell }) => FormatNumberCell(cell.value, '0,0'),
        accessor: 'latestData.recovered',
        sortType: 'basic'
      },
      {
        id: 'recovery-rate',
        Header: 'Recoverty Rate',
        Cell: ({ cell }) => FormatNumberCell(cell.value, '0.00%'),
        accessor: 'latestData.recoveryRate',
        sortType: 'basic'
      }
    ]
  }
], [])

const defaultColumn = useMemo(
  () => ({
    // When using the useFlexLayout:
    minWidth: 30, // minWidth is only used as a limit for resizing
    width: 50, // width is used for both the flex-basis and flex-grow
    maxWidth: 200, // maxWidth is only used as a limit for resizing
  }),
  []
)

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      data,
      columns,
      defaultColumn,
      initialState: {
        sortBy: [{
          id: 'cases',
          desc: true
        }]
      }
    },
    useFlexLayout,
    useSortBy
  )

  return (
    <div {...getTableProps()} className="table-flex relative">
      <div className="sticky top-0 z-20 bg-white border-b-2 border-lighter pt-4" style={{ minWidth: '780px' }}>
        {headerGroups.map((headerGroup, i) => (
          <div
            {...headerGroup.getHeaderGroupProps()}
            className={`tr ${i === 0 ? `text-xs` : ''}`}
          >
            {headerGroup.headers.map(column => (
              <div
                onClick={() => {
                  if (column.canSort) onSortClick?.()
                }}
                {...column.getHeaderProps({
                  ...column.getSortByToggleProps(),
                  className: `
                    th flex justify-start items-center
                    ${column.canSort ? 'pointer hover:opacity-75' : 'default'}
                  `
                })}
              >
                {column.render('Header')}
                <span>
                  {
                    column.isSorted
                      ? (column.isSortedDesc
                        ? <CaretDownSvg className="h-line-sm ml-1" />
                        : <CaretUpSvg className="h-line-sm ml-1" />
                      )
                      : ''
                  }
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="tbody z-10" style={{ minWidth: '780px' }} {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row)
          return (
            <div {...row.getRowProps()} className="tr">
              {row.cells.map(cell => {
                return (
                  <div
                    {...cell.getCellProps({
                      style: {
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        display: 'flex'
                      }
                    })}
                    className={`td`}
                  >
                    {cell.render('Cell')}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
