import React from "react";
import "./GO.scss";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Table from "react-bootstrap/Table";
import { Divider, Button } from "antd";
import { env } from '../../env';
import { InfoCircleOutlined } from "@ant-design/icons";
import { Modal } from "react-bootstrap";

const urlParams = new URLSearchParams(window.location.search);
const species = urlParams.get("id");

export default class GO extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      List: [],
      offset: 0,
      perPage: 25,
      currentPage: 0,
      pageCount: 20,
      total: 0,
      searchQuery: '',
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.ppiModalopen=this.ppiModalopen.bind(this);
    this.ppiModalclose=this.ppiModalclose.bind(this);
  }

  ppiModalopen = () => this.setState({ ppiOpen: true });
  ppiModalclose = () => this.setState({ ppiOpen: false });

  handlePageClick(e) {
    const selectedPage = e.selected;
    const offset = selectedPage * this.state.perPage;

    this.setState(
      {
        currentPage: selectedPage,
        offset: offset,
      },
      () => {
        this.fetchResults();
      }
    );
  }

  handleSearch(query) {
    this.setState(
      {
        searchQuery: query,
        currentPage: 0,
      },
      () => {
        this.fetchResults();
      }
    );
  }

  fetchResults() {
    const { searchQuery, currentPage, perPage } = this.state;

    axios
      .get(
        `${env.BACKEND}/api/go/?species=${species}&page=${currentPage}&size=${perPage}`
      )
      .then((res) => {
        const List = res.data.data;
        const dl = Math.ceil(res.data.total / perPage);

        // Filter the results based on the searchQuery
        const filteredList = List.filter((result) => {
          return Object.values(result).some((value) =>
            value.toString().toLowerCase().includes(searchQuery.toLowerCase())
          );
        });

        this.setState({
          List: filteredList,
          pageCount: dl,
          total: parseInt(res.data.total),
        });
      });
  }

  componentDidMount() {
    this.fetchResults();
  }

  render() {

    const { searchQuery, total } = this.state;

    let spp = '';

    if (species !== 'wheat') {
      if (species === 'pstr78') {
        spp = 'PST-78';
      } else if (species === 'pstr') {
        spp = 'PST';
      } else {
        spp = 'PST-130';
      }
    } else {
      spp = <i>T. aestivum</i>;
    }

    // Check if there are no results and display a message
    if (total === 0) {
      return (
        <div className="container">
          <br></br>
          <h5>No results found. Please try again.</h5>
        </div>
      );
    }

    return (
      <div className="container">
        <Divider />

        <Modal show={this.state.ppiOpen} onHide={this.ppiModalclose} centered>
          <Modal.Header closeButton>
            <Modal.Title className="w-100 text-center">
              <h5 className="my-2">
                <b>Information on "Evidence Code"</b>
              </h5>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <div className="table-responsive">
              <table className="table table-bordered table-striped text-center">
                <thead className="thead-dark">
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><b>IC</b></td><td>Inferred by Curator</td></tr>
                  <tr><td><b>IDA</b></td><td>Inferred from Direct Assay</td></tr>
                  <tr><td><b>IEA</b></td><td>Inferred from Electronic Annotation</td></tr>
                  <tr><td><b>IEP</b></td><td>Inferred from Expression Pattern</td></tr>
                  <tr><td><b>IGC</b></td><td>Inferred from Genomic Context</td></tr>
                  <tr><td><b>IGI</b></td><td>Inferred from Genetic Interaction</td></tr>
                  <tr><td><b>IMP</b></td><td>Inferred from Mutant Phenotype</td></tr>
                  <tr><td><b>IPI</b></td><td>Inferred from Physical Interaction</td></tr>
                  <tr><td><b>ISA</b></td><td>Inferred from Sequence Alignment</td></tr>
                  <tr><td><b>ISM</b></td><td>Inferred from Sequence Model</td></tr>
                  <tr><td><b>ISO</b></td><td>Inferred from Sequence Orthology</td></tr>
                  <tr><td><b>ISS</b></td><td>Inferred from Sequence or Structural Similarity</td></tr>
                  <tr><td><b>NAS</b></td><td>Non-traceable Author Statement</td></tr>
                  <tr><td><b>ND</b></td><td>No Biological Data Available</td></tr>
                  <tr><td><b>RCA</b></td><td>Reviewed Computational Analysis</td></tr>
                  <tr><td><b>TAS</b></td><td>Traceable Author Statement</td></tr>
                </tbody>
              </table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-danger" onClick={this.ppiModalclose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="row flex-lg-row justify-content-center g-2 my-2">
          <h5>
            <b> {spp} Gene Ontology </b>
            <InfoCircleOutlined onClick={this.ppiModalopen} />
          </h5>

          <Divider />
        </div>

        <div className="row flex-lg-row align-items-center g-2 my-2">
          <h5>
            {" "}
            Showing: {this.state.offset + 1} to {this.state.offset + 25} of {" "}
            {this.state.total.toLocaleString()} GO Terms
          </h5>
        </div>

        <div className="row flex-lg-row justify-content-center g-2 my-2">
          <div className="col-md-4">
        <input
          className="form-control"
          type="text"
          placeholder="Search example: GO:0000027, biological"
          value={searchQuery}
          onChange={(e) => this.handleSearch(e.target.value)}
        />
         </div>
        </div>

        <Table responsive className="go-table table-borderless">
          <thead className="go-thead">
            <tr>
              <th>Protein ID</th>
              <th>GO Accession</th>
              <th>Term</th>
              <th>Evidence Code</th>
              <th>Ontology</th>
            </tr>
          </thead>
          <tbody>
            {this.state.List.map((result, index) => (
              <tr key={index + 1}>
                {(() => {
                  if (species === "wheat") {
                    return (
                      <td>
                        <a
                          href={`https://plants.ensembl.org/Multi/Search/Results?species=all;idx=;q=${result["protein"].split('.')[0]};site=ensemblunit`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {result["protein"]}
                        </a>
                      </td>
                    );
                  } else if (species === "pstr130") {
                    return (
                      <td>
                        <a
                          href={`http://fungi.ensembl.org/Multi/Search/Results?species=all;idx=;q=${result["protein"]};site=ensemblunit`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {result["protein"].replace("JGI_V11_", "")}
                        </a>
                      </td>
                    );
                  } else {
                    return (
                      <td>
                        <a
                          href={`http://fungi.ensembl.org/Multi/Search/Results?species=all;idx=;q=${result["protein"]};site=ensemblunit`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {result["protein"]}
                        </a>
                      </td>
                    );
                  }
                })()}

                <td>
                  <a
                    href={`http://amigo.geneontology.org/amigo/term/${result["term"]}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result["term"]}
                  </a>
                </td>
                <td className="desc">{result["description"]}</td>
                <td>{result["evidence"]}</td>
                <td>{result["ontology"]}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <ReactPaginate
          forcePage={this.state.currentPage}
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={this.state.pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={this.handlePageClick}
          containerClassName={"pagination"}
          subContainerClassName={"pages pagination"}
          activeClassName={"active"}
          ellipsisItem={null}
        />

        <Divider />
        
        <div className="row justify-content-center g-2 my-2">
          <div className="d-flex align-items-center justify-content-between" style={{ maxWidth: '700px', width: '100%' }}>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>&copy; 2025</span>
            <a href="https://kaabil.net" target="_blank" rel="noopener noreferrer">
              <img 
                src={`${process.env.PUBLIC_URL}/images/kaabil.png`}
                alt="Kaundal Artificial Intelligence and Advanced Bioinformatics Lab" 
                style={{ height: '50px', width: 'auto' }}
              />
            </a>
            <a href="https://usu.edu" target="_blank" rel="noopener noreferrer">
              <img 
                src={`${process.env.PUBLIC_URL}/images/usu_blue.png`}
                alt="Utah State University"
                style={{ height: '40px', width: 'auto' }}
              />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
