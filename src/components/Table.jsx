import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton, CForm, CFormSelect, CFormInput, CRow, CCol, CFormLabel, CSpinner, CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { cilSortDescending, cilSortAscending } from '@coreui/icons';
import ReactPaginate from 'react-paginate';

const Table = () => {
    const dateInit = { from: '', to: '' }
    const filterInit = { applicationId: '', applicationType: 'All', actionType: 'All', user: '' }
    const [results, setResults] = useState([])
    const [orderBy, setOrderBy] = useState({ value: '', type: '' })
    const [actionTypes, setActionTypes] = useState([])
    const [applicationTypes, setApplicationTypes] = useState([])
    const [pageCount, setPageCount] = useState(0);
    const [filter, setFilter] = useState(filterInit)
    const [date, setDate] = useState(dateInit)
    const [loading, setLoading] = useState(true)
    const [selectedPage, setSelectedPage] = useState(0)


    useEffect(() => {
        axios.get(' https://run.mocky.io/v3/a2fbc23e-069e-4ba5-954c-cd910986f40f?logId=365001413757985').then(({ data }) => {
            setPageCount(Math.ceil(data.result.auditLog.length / 10))
            setResults(() => data.result.auditLog.slice(0, 10))
            setApplicationTypes(() => data.result.auditLog.map((auditLog => auditLog.applicationType)).filter((v, i, a) => i === a.indexOf(v) && v).map(v => { return { label: v, value: v } }))
            setActionTypes(() => data.result.auditLog.map((auditLog => auditLog.actionType)).filter((v, i, a) => i === a.indexOf(v) && v).map(v => { return { label: v, value: v } }))
            setLoading(false)
        })
    }, [])
    const headers = [{ title: 'Log ID', key: 'logId' }, { title: 'Application Type', key: 'applicationType' }, { title: 'application ID', key: 'applicationId' }, { title: 'action', key: 'actionType' }, { title: 'action details', key: null }, { title: 'date:time', key: 'creationTimestamp' }]

    const orderHandler = ({ value, type }) => {

        setOrderBy(() => { return { value: value, type: type } })

        let data = results.sort((a, b) => {
            if (typeof a[value] === 'number' && type === 'desc') {
                return a[value] - b[value]
            } else if (typeof a[value] === 'number' && type === 'asc') {
                return b[value] - a[value]
            } else if (typeof a[value] === 'string' && type === 'asc') {
                return a[value] > b[value] ? -1 : 1
            } else if (typeof a[value] === 'string' && type === 'desc') {

                return a[value] < b[value] ? -1 : 1
            }
        })


        setResults(() => data)

    }


    const HeaderCell = ({ header }) => {
        return (
            <React.Fragment>
                <CTableHeaderCell>{header.title}{' '}{orderBy.value === header.key ? orderBy.type === 'asc' ?
                    <CButton color='primary' title='sort descending' onClick={() => orderHandler({ value: header.key, type: 'desc' })}>
                        <CIcon icon={cilSortAscending} />
                    </CButton> :
                    <CButton color='primary' title='sort ascending' onClick={() => orderHandler({ value: header.key, type: 'asc' })}>
                        <CIcon icon={cilSortDescending} />
                    </CButton> :
                    <CButton color='light' title='sort ascending' onClick={() => orderHandler({ value: header.key, type: 'desc' })}>
                        <CIcon icon={cilSortAscending} />

                    </CButton>} </CTableHeaderCell>
            </React.Fragment>
        )
    }
    const handlePageClick = (event) => {
        const newOffset = (event.selected * 10)
        setLoading(true)
        setSelectedPage(event.selected)
        let _data = []
        axios.get('https://run.mocky.io/v3/a2fbc23e-069e-4ba5-954c-cd910986f40f?logId=365001413757985').then(({ data }) => {
            _data = data.result.auditLog;
            Object.entries(filter).forEach(([key, value]) => {


                _data = _data.filter((v) => value && value !== 'All' ? v[key] === value : true)

            })
            _data = dateHandler(_data)
            setResults(() => _data.slice(newOffset, newOffset + 10))
            setLoading(false)

        })

    };

    const filterHandler = e => {
        e.preventDefault();
        setLoading(true)

        let _data = []
        axios.get(' https://run.mocky.io/v3/a2fbc23e-069e-4ba5-954c-cd910986f40f?logId=365001413757985').then(({ data }) => {
            _data = data.result.auditLog;
            Object.entries(filter).forEach(([key, value]) => {

                _data = _data.filter((v) => value && value !== 'All' ? v[key] === value : true)

            })
            _data = dateHandler(_data)
            setResults(() => _data.slice(0, 10))
            setPageCount(Math.ceil(_data.length / 10))
            setLoading(false)

        })
    }
    const dateHandler = (data) => {
        return date.to && date.from ? data.filter(v => new Date(date.from) <= new Date(v.creationTimestamp) && new Date(v.creationTimestamp) <= new Date(date.to)) : data
    }

    const defaultValue = { label: 'All', value: null };
    const onChange = e => {
        let value = {}
        value[e.target.id] = e.target.id === 'applicationId' ? Number(e.target.value)? Number(e.target.value): e.target.value : e.target.value
        setFilter(e => { return { ...e, ...value } })
    }

    const clearFilter = () => {
        setFilter(filterInit)
        setDate(dateInit)
    }
    return (
        <div>
            <CBreadcrumb>
                <CBreadcrumbItem href="#">Home</CBreadcrumbItem>
                <CBreadcrumbItem href="#">Administration</CBreadcrumbItem>
                <CBreadcrumbItem active>Logger Search</CBreadcrumbItem>
            </CBreadcrumb>
            <CForm onSubmit={filterHandler}>
                <CRow >
                    <CCol xl='auto' lg='auto' md='auto'>
                        <CFormLabel>Employee Name</CFormLabel>
                        <CFormInput id="user" value={filter.user} placeholder="e.g: Admin, User" aria-describedby="exampleFormControlInputHelpInline" onChange={onChange}/>

                    </CCol>
                    <CCol xl='auto' lg='auto' md='auto'>
                        <CFormLabel>Action Type</CFormLabel>
                        <CFormSelect aria-label="Default select example" options={[defaultValue, ...actionTypes]} id="actionType" value={filter.actionType} onChange={onChange} />

                    </CCol >
                    <CCol xl='auto' lg='auto' md='auto'>
                        <CFormLabel>Application Type</CFormLabel >
                        <CFormSelect aria-label="Default select example" options={[defaultValue, ...applicationTypes]} value={filter.applicationType} id="applicationType" onChange={onChange} />


                    </CCol>
                    <CCol xl='auto' lg='auto' md='auto'>
                        <CFormLabel>From Date</CFormLabel>
                        <input className='form-control' type="date" value={date.from} onChange={(r) => setDate(e => { return { ...e, from: r.target.value } })} />
                    </CCol>
                    <CCol xl='auto' lg='auto' md='auto'>
                        <CFormLabel>To Date</CFormLabel>
                        <input type="date" className='form-control' value={date.to} onChange={(r) => setDate(e => { return { ...e, to: r.target.value } })} />
                    </CCol>
                    <CCol xl={2} lg='auto' md='auto'>
                        <CFormLabel>Application ID</CFormLabel>
                        <CFormInput id="applicationId"  placeholder="e.g: 131566/415161" value={filter.applicationId} aria-describedby="exampleFormControlInputHelpInline" onChange={onChange} />

                    </CCol>
                    <CCol className="align-self-end" xl='auto' lg='auto' md='auto' sm='auto' xs='auto' style={{margin: '1rem 0'}}>
                        <CRow xs={{ gutterY: 2 }}>
                            <CCol xl={12} >
                        <CButton color='primary' type='submit'>Search Logger</CButton>

                            </CCol>
                            <CCol xl={12}>

                        <CButton style={{width: '50%'}} type='button' color='secondary' onClick={clearFilter}>Clear Filter</CButton>
                            </CCol>
                        </CRow>

                    </CCol>
                    <CCol className="align-self-end" xl='auto' lg='auto' md='auto' style={{margin: '1rem 0'}}>

                    </CCol>
                </CRow>

            </CForm>

            <CTable>
                <CTableHead>
                    <CTableRow>
                        {React.Children.toArray(headers.map(header => <HeaderCell header={header} />))}
                    </CTableRow>
                </CTableHead>
                {!loading && <CTableBody>
                    {React.Children.toArray(results.map(result =>
                        <CTableRow>
                            <CTableDataCell>
                                {result.logId}
                            </CTableDataCell>
                            <CTableDataCell>
                                {result.applicationType}
                            </CTableDataCell>
                            <CTableDataCell>
                                {result.applicationId}
                            </CTableDataCell>
                            <CTableDataCell>
                                {result.actionType}
                            </CTableDataCell>
                            <CTableDataCell>
                                /
                            </CTableDataCell>
                            <CTableDataCell>
                                {new Date(result.creationTimestamp).toLocaleString()}
                            </CTableDataCell>

                        </CTableRow>
                    ))}
                </CTableBody>}
            </CTable>
            {!loading && <ReactPaginate
                breakLabel="..."
                nextLabel="next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                previousLabel="< previous"
                renderOnZeroPageCount={null}
                className='page'
                marginPagesDisplayed={2}
                forcePage={selectedPage}
            />}
            {loading && <CSpinner color='primary' />}
        </div>
    )
}




export default Table