import { Box } from "@mui/material"

import Header from "../header/Header"
import TableFilters from "../tableFilters/TableFilters"
import DataTable from "../dataTable/DataTable"

const RequestPage = () => { 
  return(
    <Box>  
      <Header />
      <TableFilters />
      <DataTable />
    </Box>  
  )
}

export default RequestPage