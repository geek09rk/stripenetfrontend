import React from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { env } from '../../env';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './VisTable.scss';

const tdata = JSON.parse(localStorage.getItem("resultid"));
const params = JSON.parse(localStorage.getItem("param"));
console.log(tdata)

export const VisTable = ({tableRowClicked, handleSearchChange}) => {
  
  let [data, setData] = useState([]);
  let [totalData, setTotalData] = useState([]);
  let [tableData, setTableData] = useState([]);
  let [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(searchTerm);
    const fetchData = async () => {
      if (params.category === 'domain') {
        const domainData = JSON.parse(localStorage.getItem("data"));
        setData(domainData);
        setTableData(domainData);
        setTotalData(domainData);
      } else {
        const url = `${env.BACKEND}/api/network/?results=${tdata}`;
        const results = await axios.get(url);
        setData(results);
        setTableData(results.data.results);
        setTotalData(results.data.results);
      }
    }

    fetchData();
  }, [searchTerm]);

  let results;
  if (data) {
    results = (
      <Table responsive className="kbl-table table-borderless">
        <thead className="kbl-thead">
         
          <tr>
            <th className="light">Wheat Protein</th>
            <th className="dark">PST Protein</th>
          </tr>
        </thead>

        <tbody>
          {Array.from(tableData).map((result, index) => (
            <tr className="select" key={index} onClick={() => {
              if (params.category === 'domain') result.intdb_x = result.intdb;
              const data = {
                source: result.Host_Protein,
                target: result.Pathogen_Protein,
                gene: result.Host_Protein,
                pathogenProtein: result.Pathogen_Protein,
                id : `${result.intdb_x}: ${result.Host_Protein}-${result.Pathogen_Protein}`
              };

              tableRowClicked(data);
              }}>

              <td>{result.Host_Protein}</td>
              <td>{result.Pathogen_Protein}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )
  }

  return (
    <div>
      <Row className="justify-content-center mb-4">
        <Col sm={12} className="px-4">
          <Form.Control className="kbl-form" type="email" placeholder="Search" value={searchTerm}
            onChange={(event) => {
              const searchTerm = event.target.value.toLowerCase();

              setSearchTerm(searchTerm);
              handleSearchChange(searchTerm);
              console.log(searchTerm);
              if (event.target.value === '') {
                const newData = data.data;
                setTableData(newData);
              } else {
                const newData = totalData.filter((item) => {
                  return item.Host_Protein.toLowerCase().includes(searchTerm) || item.Pathogen_Protein.toLowerCase().includes(searchTerm)
                });

                setTableData(newData);
              }
            }
          }/>
        </Col>
      </Row>
      {results}
    </div>
  );
}
