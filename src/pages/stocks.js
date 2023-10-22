import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Autocomplete, Box, Button, CircularProgress, Container, Stack, SvgIcon, TextField, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CustomersTable } from 'src/sections/customer/customers-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import ImportModal from 'src/components/importModal';
import * as XLSX from 'xlsx';
import { LoadingButton } from '@mui/lab';
import { tableHeaders } from 'src/constants/headers';
import { collection, doc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, firebase } from 'src/firebase';
import { v4 } from 'uuid'
import { useEffect } from 'react';
import { usePopover } from 'src/hooks/use-popover';
import { StockActionPopover } from 'src/components/stockActionPopus';
import { companies } from 'src/constants/company';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const now = new Date();

const data =
  [
    {
      name: '1',
      shape: 'Round',
      weight: '1.5',
      color: 'D',
      clarity: 'IF',
      lab: 'GIA',
      status: 'In Stock',
      location: 'New York',
      cut: 'EX',
      polish: 'Very Good',
      symm: 'Good',
      fluo: 'None',
      rapprice: '$10,000',
      pricecrt: '5%',
      certificateNumber: 2201265284
    },
    {
      name: '2',
      shape: 'Princess',
      weight: '1.2',
      color: 'E',
      clarity: 'VVS1',
      lab: 'GIA',
      status: 'Sold',
      location: 'Los Angeles',
      cut: 'Very Good',
      polish: 'EX',
      symm: 'EX',
      fluo: 'Faint',
      rapprice: '$8,500',
      pricecrt: '4%',
      certificateNumber: 2201265284
    },
    {
      name: '3',
      shape: 'Emerald',
      weight: '2.0',
      color: 'G',
      clarity: 'VS1',
      lab: 'GIA',
      status: 'In Stock',
      location: 'London',
      cut: 'Good',
      polish: 'Good',
      symm: 'Fair',
      fluo: 'Strong',
      rapprice: '$14,000',
      pricecrt: '6%',
      certificateNumber: 2201265284
    },
    {
      name: '4',
      shape: 'Oval',
      weight: '1.8',
      color: 'F',
      clarity: 'SI1',
      lab: 'GIA',
      status: 'Sold',
      location: 'Paris',
      cut: 'Fair',
      polish: 'Poor',
      symm: 'Poor',
      fluo: 'Medium',
      rapprice: '$6,000',
      pricecrt: '3%',
      certificateNumber: 2201265284
    },
    {
      name: '5',
      shape: 'Pear',
      weight: '1.3',
      color: 'H',
      clarity: 'VVS2',
      lab: 'GIA',
      status: 'In Stock',
      location: 'Chicago',
      cut: 'EX',
      polish: 'EX',
      symm: 'EX',
      fluo: 'None',
      rapprice: '$9,500',
      pricecrt: '4.5%',
      certificateNumber: 2201265284
    },
    {
      name: '6',
      shape: 'Radiant',
      weight: '1.7',
      color: 'I',
      clarity: 'VS2',
      lab: 'GIA',
      status: 'Sold',
      location: 'Miami',
      cut: 'Very Good',
      polish: 'Good',
      symm: 'Good',
      fluo: 'Faint',
      rapprice: '$7,800',
      pricecrt: '4.2%',
      certificateNumber: 2201265284
    },
    {
      name: '7',
      shape: 'Marquise',
      weight: '1.4',
      color: 'J',
      clarity: 'SI2',
      lab: 'GIA',
      status: 'In Stock',
      location: 'San Francisco',
      cut: 'Good',
      polish: 'Fair',
      symm: 'Fair',
      fluo: 'Strong',
      rapprice: '$5,200',
      pricecrt: '3.8%',
      certificateNumber: 2201265284
    },
    {
      name: '8',
      shape: 'Cushion',
      weight: '1.9',
      color: 'K',
      clarity: 'I1',
      lab: 'GIA',
      status: 'Sold',
      location: 'Toronto',
      cut: 'Fair',
      polish: 'Poor',
      symm: 'Poor',
      fluo: 'Medium',
      rapprice: '$3,900',
      pricecrt: '2.7%',
      certificateNumber: 2201265284
    },
    {
      name: '9',
      shape: 'Asscher',
      weight: '1.6',
      color: 'L',
      clarity: 'I3',
      lab: 'GIA',
      status: 'In Stock',
      location: 'Sydney',
      cut: 'Good',
      polish: 'Fair',
      symm: 'Fair',
      fluo: 'None',
      rapprice: '$2,600',
      pricecrt: '2.2%',
      certificateNumber: 2201265284
    },
    {
      name: '10',
      shape: 'Heart',
      weight: '1.2',
      color: 'M',
      clarity: 'FL',
      lab: 'GIA',
      status: 'Sold',
      location: 'Tokyo',
      cut: 'EX',
      polish: 'EX',
      symm: 'EX',
      fluo: 'Faint',
      rapprice: '$11,200',
      pricecrt: '5.5%',
      certificateNumber: 2201265284
    }
  ];



const useCustomers = (page, rowsPerPage) => {
  return useMemo(
    () => {
      return applyPagination(data, page, rowsPerPage);
    },
    [page, rowsPerPage]
  );
};

const useCustomerIds = (customers) => {
  return useMemo(
    () => {
      return customers.map((customer) => customer.id);
    },
    [customers]
  );
};

const Page = () => {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const customers = useCustomers(page, rowsPerPage);
  const customersIds = useCustomerIds(customers);
  const customersSelection = useSelection(customersIds);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMemoSelected, setIsMemoSelected] = useState(false);
  const [importedTableData, setImportedTableData] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const stockPopover = usePopover();

  const openImportModal = () => {
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
  };
  const openMemoModal = () => {
    setIsMemoSelected(true);
  };

  const closeMemoModal = () => {
    setIsMemoSelected(false);
  };
  const handlePageChange = useCallback(
    (event, value) => {
      setPage(value);
    },
    []
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      setRowsPerPage(event.target.value);
    },
    []
  );
  const handleFileUpload = (event) => {
    if (event.target.files) {
      setLoading(true);
      let file = event.target.files[0]
      console.log(file);
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Assuming a single sheet in the workbook
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        console.log(sheetName, sheet)
        // // Convert sheet data to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        console.log(jsonData); // This will be an array of objects
        let finalList = []
        for (const stock of jsonData) {
          let data = {}
          Object.keys(stock).map(key => {
            let header = tableHeaders.find(t => t.title == key);
            if (header) {
              data[header.key] = stock[key]
            }
          })
          finalList.push(data)
        }
        setImportedTableData(finalList);
        openImportModal();
        setLoading(false);

      };
      reader.readAsBinaryString(file);
    } else {
      console.log('called')
    }
  }

  const handleUploadData = async () => {
    setLoading(true);
    for (const data of importedTableData) {
      let id = v4()
      await setDoc(doc(db, 'daimondStock', id), {
        ...data, id, status: "Available", stoneNumber: 1
      });

      closeImportModal();
      getStock()
    }
    setLoading(false);

  }
  const issueMemo = async () => {
    setLoading(true)
    for (const row of selectedRows) {
      const stockRef = doc(db, "daimondStock", row.id);
      await updateDoc(stockRef, {
        status: 'On Memo'
      });
    }
    await getStock()
    setLoading(false);
    setSelectedRows([]);
    stockPopover.handleClose();
    createPdf()
    closeMemoModal()
  }
  const returnFromMemo = async () => {
    setLoading(true)
    for (const row of selectedRows) {
      const stockRef = doc(db, "daimondStock", row.id);
      await updateDoc(stockRef, {
        status: 'Available'
      });
    }
    await getStock();
    setSelectedRows([])
    setLoading(false);
    stockPopover.handleClose();
    createPdf();
    closeMemoModal()
  }

  const getStock = async () => {
    setLoading(true)
    const q = query(collection(db, "daimondStock"));

    const querySnapshot = await getDocs(q);
    let result = []
    querySnapshot.forEach((doc) => {
      result.push(doc.data())
    });
    setLoading(false)
    setStocks(result)
  }
  const handleRowSelected = (data, value) => {
    console.log('data,', value);
    if (!value) {
      let d = selectedRows.filter(sr => sr.id != data.id);
      setSelectedRows(d)
    } else {
      setSelectedRows((prev) => [...prev, data])
    }
  };

  const handleOnMemo = () => {
    if (selectedRows.length) {

      setIsMemoSelected(true)
    }
  }


  const createPdf = () => {

    let tableData = []
    let emptyRows = 26
    selectedRows.map((s) => {
      let row = []
      tableHeaders.map((h, index) => {
        if (index < 10) {
          row.push(s[h.key] || " ")
        }
      });
      tableData.push(row)
    })
    for (let index = tableData.length; index < emptyRows; index++) {
      let row = []
      tableHeaders.map((h, index) => {
        if (index < 10) {
          row.push(" ")
        }
      });
      tableData.push(row)

    }

    var dd = {
      // Define page margins
      pageMargins: [40, 20, 40, 20], // top, right, bottom, left

      // Content of the PDF
      content: [
        // Header with company name and logo
        {
          columns: [
            // Company name
            {
              text: 'Van Technology',
              style: 'header',
            },

          ],
        },
        {
          text: '25, Mahavir Society, Zaveri Sadak, Navsari 396445',
          style: 'subheader',
        },
        {
          text: '+919714137409 / www.tanayvan.com',
          style: 'subheader',
        },


        {
          text: 'Broker Name: John Doe',
          margin: [0, 0],
          bold: true
        },
        {
          text: 'Memo Details',
          margin: [0, 10],
          bold: true
        },

        // Stock table

        {
          // Define your stock table using table layout
          table: {
            body: [
              tableHeaders.map((h, index) => {
                if (index < 10) {
                  return h.title
                }
              }).filter(h => h),
              ...tableData,

            ],


          },
        },
        {
          text: 'Signature',
          margin: [0, 20],
        },
        {
          text: '_____________________________',
          margin: [0, 5],
        },
        {
          text: 'Terms and Conditions',
          margin: [0, 10, 0, 0],
        },
        {
          text: 'By signing above, you agree to the terms and conditions.',
          margin: [0, 5],
        },

      ],
      // Define styles
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 1],
          alignment: 'center'
        },
        subheader: {
          fontSize: 12,
          alignment: 'center'
        },
      },

    }

    pdfMake.createPdf(dd).open()
    console.log(dd)
  }
  useEffect(() => {
    getStock()
  }, [])


  return (
    <>
      <Head>
        <title>
          Stocks
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">
                  Stocks
                </Typography>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <LoadingButton
                    color="inherit"
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    )}
                    style={{ position: "relative" }}
                    loadingIndicator={<CircularProgress color="inherit" size={16} />}
                    loading={loading}
                  >
                    Upload File
                    <input type='file' style={{
                      // clip: 'rect(0 0 0 0)',
                      // clipPath: 'inset(50%)',
                      height: '100%',
                      overflow: 'hidden',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      whiteSpace: 'nowrap',
                      width: '100%',
                      opacity: 0
                      // backgroundColor: "red"
                    }}
                      onChange={handleFileUpload}
                      accept=".xlsx,.xls"
                    />
                  </LoadingButton>
                  <Button
                    color="inherit"
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    )}
                    onClick={createPdf}
                  >
                    Make PDf
                  </Button>
                </Stack>
              </Stack>
              <div>

              </div>
            </Stack>
            <CustomersSearch />
            <Button
              startIcon={(
                <SvgIcon fontSize="small">
                  <PlusIcon />
                </SvgIcon>
              )}
              variant="contained"
              onClick={stockPopover.handleOpen}
              ref={stockPopover.anchorRef}
              sx={{ maxWidth: "10rem" }}
              disabled={selectedRows.length ? false : true}
            >
              Actions
            </Button>
            <CustomersTable
              count={stocks.length}
              items={stocks}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              page={page}
              rowsPerPage={rowsPerPage}
              selected={customersSelection.selected}
              handleRowSelected={handleRowSelected}
              selectedRows={selectedRows}
              stockPopover={stockPopover}
            />
          </Stack>
        </Container>
      </Box>
      <ImportModal open={isImportModalOpen} onClose={closeImportModal} >
        <Typography variant="body1" sx={{ margin: "2rem 0" }}>
          This is the stock which will get uploaded.
        </Typography>
        <CustomersTable
          count={importedTableData.length}
          items={importedTableData}
          onDeselectAll={customersSelection.handleDeselectAll}
          onDeselectOne={customersSelection.handleDeselectOne}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSelectAll={customersSelection.handleSelectAll}
          onSelectOne={customersSelection.handleSelectOne}
          page={page}
          rowsPerPage={rowsPerPage}
          selected={customersSelection.selected}
        />
        <LoadingButton
          variant='contained'

          style={{ position: "relative", marginTop: "1rem" }}
          loadingIndicator={<CircularProgress color="inherit" size={16} />}
          loading={loading}
          onClick={handleUploadData}
        >
          Upload File


        </LoadingButton>
        <LoadingButton
          variant='contained'

          style={{ position: "relative", marginTop: "1rem", marginLeft: "1rem" }}
          onClick={closeImportModal}
        >
          Close


        </LoadingButton>
      </ImportModal>
      <ImportModal open={isMemoSelected} onClose={closeMemoModal} title='Memo' >

        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={companies}
          sx={{ width: 300, margin: "3rem 0" }}
          renderInput={(params) => <TextField {...params} label="Select Broker" />}
          getOptionLabel={(o) => o.title}
        />
        <CustomersTable
          count={selectedRows.length}
          items={selectedRows}
          onDeselectAll={customersSelection.handleDeselectAll}
          onDeselectOne={customersSelection.handleDeselectOne}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSelectAll={customersSelection.handleSelectAll}
          onSelectOne={customersSelection.handleSelectOne}
          page={page}
          rowsPerPage={rowsPerPage}
          selected={customersSelection.selected}
          isCheckboxNeeded={false}
        />
        <LoadingButton
          variant='contained'

          style={{ position: "relative", marginTop: "1rem" }}
          loadingIndicator={<CircularProgress color="inherit" size={16} />}
          loading={loading}
          onClick={issueMemo}
        >
          Issue Memo


        </LoadingButton>
        <LoadingButton
          variant='contained'
          loadingIndicator={<CircularProgress color="inherit" size={16} />}
          loading={loading}
          style={{ position: "relative", marginTop: "1rem", marginLeft: "1rem" }}
          onClick={returnFromMemo}
        >
          Return From Memo


        </LoadingButton>
      </ImportModal>
      <StockActionPopover anchorEl={stockPopover.anchorRef.current}
        open={stockPopover.open}
        onClose={stockPopover.handleClose}
        handleOnMemo={handleOnMemo} />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
