import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const DataTable = ({
  data,
  columns,
  className = '',
  caption = null,
  renderCell = null,
  renderActions = null,
  renderFooter = null,
  renderLeadingHeader = null,
  renderLeadingCell = null,
  renderActionsHeader = null,
  getRowProps = null,
  getHeaderClassName = null,
  getCellClassName = null,
  sortConfig: controlledSortConfig = null,
  onSort = null,
}) => {
  const [internalSortConfig, setInternalSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const sortConfig = controlledSortConfig || internalSortConfig;

  const sortedData = useMemo(() => {
    // Pokud řazení řídí rodič, data už přijdou seřazená.
    if (controlledSortConfig) {
      return data;
    }

    if (!sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) {
        return 1;
      }

      if (bValue === null || bValue === undefined) {
        return -1;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }, [data, sortConfig, controlledSortConfig]);

  const sortByKey = (column) => {
    if (column.sortable === false) {
      return;
    }

    if (onSort) {
      onSort(column.key);
      return;
    }

    setInternalSortConfig((previousConfig) => ({
      key: column.key,
      direction:
        previousConfig.key === column.key
        && previousConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '';
    }

    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <table className={className}>
      {caption && (
        <caption>
          {caption}
        </caption>
      )}

      <thead>
        <tr>
          {renderLeadingHeader && (
            <th>
              {renderLeadingHeader()}
            </th>
          )}

          {columns.map((column) => {
            const headerClassName = getHeaderClassName
              ? getHeaderClassName(column, sortConfig)
              : '';

            return (
              <th
                key={column.key}
                onClick={() => sortByKey(column)}
                className={headerClassName}
              >
                {typeof column.label === 'function'
                  ? column.label()
                  : column.label}

                {column.sortable === false ? '' : (
                  <>
                    {' '}
                    {getSortIcon(column.key)}
                  </>
                )}
              </th>
            );
          })}

          {renderActions && (
            <th>
              {renderActionsHeader
                ? renderActionsHeader()
                : null}
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {sortedData.map((row, rowIndex) => {
          const rowProps = getRowProps
            ? getRowProps(row, rowIndex)
            : {};

          return (
            <tr
              key={row.id}
              {...rowProps}
            >
              {renderLeadingCell && (
                <td>
                  {renderLeadingCell(row, rowIndex)}
                </td>
              )}

              {columns.map((column) => {
                const cellClassName = getCellClassName
                  ? getCellClassName(column, sortConfig)
                  : '';

                return (
                  <td
                    key={column.key}
                    data-label={
                      typeof column.label === 'string'
                        ? column.label
                        : column.key
                    }
                    className={cellClassName}
                  >
                    {renderCell
                      ? renderCell(row, column, rowIndex)
                      : row[column.key]}
                  </td>
                );
              })}

              {renderActions && (
                <td>
                  {renderActions(row, rowIndex)}
                </td>
              )}
            </tr>
          );
        })}

        {renderFooter && renderFooter()}
      </tbody>
    </table>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,

  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
        PropTypes.func,
      ]).isRequired,
      sortable: PropTypes.bool,
    }),
  ).isRequired,

  className: PropTypes.string,
  caption: PropTypes.node,
  renderCell: PropTypes.func,
  renderActions: PropTypes.func,
  renderFooter: PropTypes.func,
  renderLeadingHeader: PropTypes.func,
  renderLeadingCell: PropTypes.func,
  renderActionsHeader: PropTypes.func,
  getRowProps: PropTypes.func,
  getHeaderClassName: PropTypes.func,
  getCellClassName: PropTypes.func,

  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),

  onSort: PropTypes.func,
};

export default DataTable;