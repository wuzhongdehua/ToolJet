import React, { useContext } from 'react';
import Drawer from '@/_ui/Drawer';
import { toast } from 'react-hot-toast';
import CreateRowForm from '../../Forms/RowForm';
import { TooljetDatabaseContext } from '../../index';
import { tooljetDatabaseService } from '@/_services';
import { listAllPrimaryKeyColumns } from '@/TooljetDatabase/constants';
import PostgrestQueryBuilder from '@/_helpers/postgrestQueryBuilder';

const CreateRowDrawer = ({
  isCreateRowDrawerOpen,
  setIsCreateRowDrawerOpen,
  referencedColumnDetails,
  setReferencedColumnDetails,
}) => {
  const {
    organizationId,
    selectedTable,
    setSelectedTableData,
    setTotalRecords,
    pageSize,
    setSortFilters,
    setQueryFilters,
    columns,
  } = useContext(TooljetDatabaseContext);

  return (
    <>
      <Drawer isOpen={isCreateRowDrawerOpen} onClose={() => setIsCreateRowDrawerOpen(false)} position="right">
        <CreateRowForm
          onCreate={(bypass) => {
            const limit = pageSize;
            setSortFilters({});
            setQueryFilters({});

            const primaryKeyColumns = listAllPrimaryKeyColumns(columns);
            const sortQuery = new PostgrestQueryBuilder();
            primaryKeyColumns.map((primaryKeyColumnName) => {
              sortQuery.order(primaryKeyColumnName, 'desc');
            });

            tooljetDatabaseService
              .findOne(organizationId, selectedTable.id, `${sortQuery.url.toString()}&limit=${limit}`)
              .then(({ headers, data = [], error }) => {
                if (error) {
                  toast.error(error?.message ?? `Failed to fetch table "${selectedTable.table_name}"`);
                  return;
                }

                if (Array.isArray(data) && data?.length > 0) {
                  const totalContentRangeRecords = headers['content-range'].split('/')[1] || 0;
                  setTotalRecords(totalContentRangeRecords);
                  setSelectedTableData(data);
                }
              });

            const tableElement = document.querySelector('.tj-db-table');
            if (tableElement) tableElement.scrollTop = 0;
            if (!bypass) setIsCreateRowDrawerOpen(false);
          }}
          onClose={() => setIsCreateRowDrawerOpen(false)}
          referencedColumnDetails={referencedColumnDetails}
          setReferencedColumnDetails={setReferencedColumnDetails}
          initiator="CreateRowForm"
        />
      </Drawer>
    </>
  );
};

export default CreateRowDrawer;
