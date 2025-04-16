import React from "react";
import "./Transmemb.scss";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Table from "react-bootstrap/Table";
import { Divider } from "antd";
import { env } from '../../env';

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
      searchQuery: '', // Add searchQuery state
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleSearch = this.handleSearch.bind(this); // Add handleSearch method
  }

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
        currentPage: 0, // Reset to the first page when searching
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
        `${env.BACKEND}/api/transmemb/?species=${species}&page=${currentPage}&size=${perPage}`
      )
      .then((res) => {
        const List = res.data.data;
        const dl = Math.ceil(res.data.total / this.state.perPage);

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
        <div className="row flex-lg-row justify-content-center g-2 my-2">
          <h5><b> <i>P. striiformis</i> ({spp}) Transmembrane Proteins </b></h5>
          <Divider />
        </div>
        <div className="row flex-lg-row align-items-center g-2 my-2">
          <h5>
            {" "}
            Showing: {this.state.offset + 1} to {this.state.offset + 25} of {" "}
            {this.state.total.toLocaleString()} Proteins
          </h5>
        </div>

        <div className="row flex-lg-row justify-content-center g-2 my-2">
          <div className="col-md-4">
          <input
          className="form-control"
          type="text"
          placeholder="Search example: POV97442, PSTT_04952"
          value={searchQuery}
          onChange={(e) => this.handleSearch(e.target.value)}
        />
          </div>
        </div>

        <Table responsive className="go-table table-borderless">
          <thead className="go-thead">
            <tr>
              <th>Protein ID</th>
              <th>Gene Name</th>
              <th>Protein Length</th>
            </tr>
          </thead>
          <tbody>
            {this.state.List.map((result, index) => (
              <tr key={index + 1}>
                {(() => {
                  if (species === "pstr130") {
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
                
                {(() => {
                  if (species === "pstr130") {
                    return (
                      <td>
                        {result["geneName"].split('-')[1]}
                      </td>
                    );
                  } else {
                    return (
                      <td>{result["geneName"]}</td>
                    );
                  }
                })()}

                <td>{result["length"]}</td>
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
