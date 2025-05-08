import React from "react";
import { Table } from "react-bootstrap";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "./Results.scss";
import { Divider, Button, Progress, message, Tag } from "antd";
import { env } from '../../env';
import { downloadCsv } from "../../components/CSVDownload/CSVDownload";
import ReactLoading from 'react-loading';
import { DownloadOutlined, DeploymentUnitOutlined } from '@ant-design/icons';

const tdata = JSON.parse(localStorage.getItem("resultid"));
const pdata = JSON.parse(localStorage.getItem("param"));

let category;
let species;
let species2;
let useTwoSpecies;
let genes;
let idt;
if (pdata) {
  category = pdata.category;
  species = pdata.species;
  species2 = pdata.species2;
  idt = pdata.ids;
  if (category === 'domain') {
    if (pdata.genes === '') {
      genes = []
    }
    if (pdata.genes !== '') {
      genes = pdata.genes.split(", ")
    }
  }
}

function onlyNumbers(str) {
  return /^[0-9]+$/.test(str);
}

export default class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      List: [],
      dList: [],
      MasterChecked: false,
      SelectedList: [],
      offset: 0,
      perPage: 25,
      currentPage: 0,
      pageCount: 20,
      hostp: 0,
      pathogenp: 0,
      dResult: [],
      isOpen: false,
      species: species,
      category: category,
      idt: idt,
      genes: genes,
      total: 0,
      isDownloading: false,
      downloadProgress: 0,
      downloadError: null,
      speciesCount: {},
    };
    this.handlePageClick = this.handlePageClick.bind(this);
    this.downloadResults = this.downloadResults.bind(this)
    this.hasFetchedInitialData = false; // Flag to track initial fetch
  }

  openModel = () => this.setState({ isOpen: true, dList: [] });
  closeModel = () => this.setState({ isOpen: false });

  fetchResults() {
    const postBody = {
      species: species,
      species2: species2,
      page: this.state.currentPage,
      size: this.state.perPage,
      genes: this.state.genes,
      idt: this.state.idt,
      intdb: pdata.domdb,
    }

    if (category === 'domain') {
      this.openModel();
      axios
        .post(
          `${env.BACKEND}/api/domain_results/`, postBody
        )
        .then((res) => {
          this.closeModel();
          const dList = res.data.results;
          const dl = Math.ceil(res.data.total / this.state.perPage);
          this.setState({
            dList: dList,
            pageCount: dl,
            total: parseInt(res.data.total),
            hostp: res.data.hostcount,
            pathogenp: res.data.pathogencount,
            speciesCount: res.data.speciesCount,
          });
        });
    }
    else {
      axios
        .get(
          `${env.BACKEND}/api/results/?results=${tdata}&page=${this.state.currentPage}&size=${this.state.perPage}`
        )
        .then((res) => {
          const List = res.data.results;
          const dl = Math.ceil(res.data.total / this.state.perPage);

          this.setState({
            List: List,
            pageCount: dl,
            total: parseInt(res.data.total),
            hostp: res.data.hostcount,
            pathogenp: res.data.pathogencount,
            speciesCount: res.data.speciesCount,
          });
        });
    }
  }

  async downloadResults() {
    if (this.state.isDownloading) {
      message.info('Download already in progress.');
      return;
    }

    this.setState({ isDownloading: true, downloadProgress: 0, downloadError: null });

    let initUrl = '';
    let queryParams = '';

    if (category === 'domain') {
      queryParams = `species=${this.state.species}`;
      if (pdata.species2 && pdata.species2 !== 'null') {
        queryParams += `&species2=${pdata.species2}`;
      }
      if (pdata.domdb && pdata.domdb.length > 0) {
        const intdbParam = Array.isArray(pdata.domdb) ? pdata.domdb.join(',') : pdata.domdb;
        queryParams += `&intdb=${encodeURIComponent(intdbParam)}`;
      }
      if (pdata.genes && pdata.genes !== '') {
        queryParams += `&genes=${encodeURIComponent(pdata.genes)}`;
      }
      if (pdata.ids) {
        queryParams += `&idt=${pdata.ids}`;
      }
      initUrl = `${env.BACKEND}/api/domain_download/init?${queryParams}`;
    }
    else {
      queryParams = `results=${encodeURIComponent(tdata)}`;
      initUrl = `${env.BACKEND}/api/download/init?${queryParams}`;
    }

    try {
      const initResponse = await axios.get(initUrl);
      const { taskId, totalCount } = initResponse.data;

      if (!taskId) {
        throw new Error("Failed to get download task ID from server.");
      }

      if (totalCount === 0) {
        message.info("No results found to download.");
        this.setState({ isDownloading: false });
        return;
      }

      const dataUrl = `${env.BACKEND}/api/download/data/${taskId}`;
      const response = await fetch(dataUrl);

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let itemsReceived = 0;
      let downloadedData = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunkStr = decoder.decode(value, { stream: true });
        buffer += chunkStr;

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.substring(0, newlineIndex).trim();
          buffer = buffer.substring(newlineIndex + 1);

          if (line) {
            try {
              const parsed = JSON.parse(line);
              downloadedData.push(parsed);
              itemsReceived++;
              const progress = totalCount > 0 ? Math.round((itemsReceived / totalCount) * 100) : 0;
              this.setState({ downloadProgress: progress });
            } catch (e) {
              console.warn("Skipping invalid JSON line:", line, e);
            }
          }
        }

        if (done) {
          const lastLine = buffer.trim();
          if (lastLine) {
            try {
              const parsed = JSON.parse(lastLine);
              downloadedData.push(parsed);
              itemsReceived++;
              const progress = totalCount > 0 ? Math.round((itemsReceived / totalCount) * 100) : 100;
              this.setState({ downloadProgress: progress });
            } catch (e) {
              console.warn("Skipping invalid JSON line at end of stream:", lastLine, e);
            }
          }
          break;
        }
      }

      this.setState({ downloadProgress: 100, isDownloading: false });
      downloadCsv(downloadedData, category);

    } catch (error) {
      console.error("Download failed:", error);
      this.setState({ isDownloading: false, downloadError: error.message || "Download failed. Please check console.", downloadProgress: 0 });
      message.error(error.message || "Download failed. Please check console.");
    }
  }

  componentDidMount() {
    if (!this.hasFetchedInitialData) {
      this.hasFetchedInitialData = true;
      this.fetchResults();
    }
  }

  handlePageClick = (e) => {
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
  };

  onMasterCheck(e) {
    let tempList = this.state.List;
    tempList.map((user) => (user.selected = e.target.checked));

    this.setState({
      MasterChecked: e.target.checked,
      List: tempList,
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  onItemCheck(e, item) {
    let tempList = this.state.List;
    tempList.map((user) => {
      if (user._id === item._id) {
        user.selected = e.target.checked;
      }
      return user;
    });

    const totalItems = this.state.List.length;
    const totalCheckedItems = tempList.filter((e) => e.selected).length;

    this.setState({
      MasterChecked: totalItems === totalCheckedItems,
      List: tempList,
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  getSelectedRows() {
    this.setState({
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  render() {
    let results;
    if (tdata) {
      localStorage.setItem("resultid", JSON.stringify(tdata))
    }
    if (this.state.dList.length > 1) {
      localStorage.setItem("data", JSON.stringify(this.state.dList))
    }

    const csvDownloader = (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          shape="round"
          size="large"
          className="download-btn"
          onClick={this.downloadResults}
          disabled={this.state.isDownloading}
        >
          {this.state.isDownloading ? `Downloading... ${this.state.downloadProgress}%` : 'Download CSV'}
        </Button>
        {this.state.isDownloading && (
          <>
            <br /><br />
            <Progress
              percent={this.state.downloadProgress}
              size="small"
              status="active"
              style={{ position: 'absolute', bottom: '-15px', left: '0', width: '100%' }}
            />
          </>
        )}
        {this.state.downloadError && (
          <div style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>{this.state.downloadError}</div>
        )}
      </div>
    );

    const speciesNameMapping = {
      pstrs: <span><i>P. striiformis</i></span>,
      pstr78s: <span><i>P. striiformis</i> strain 78</span>,
      pstr130s: <span><i>P. striiformis</i> strain 130</span>,
    };

    if (this.state.List.length > 1) {
      console.log(this.state.List)
      results = (<>
        <div className="results-container">
          <div className="results-header">
            <div className="row align-items-center g-3 py-3">
              <div className="col-md-3">
                {csvDownloader}
              </div>

              <div className="col-md-7">
                <div className="results-summary">
                  <span className="results-count">
                    Showing <strong>{this.state.offset + 1}</strong> to <strong>{Math.min(this.state.offset + this.state.perPage, this.state.total)}</strong> of <strong>{this.state.total.toLocaleString()}</strong> interactions
                  </span>
                  <div className="protein-stats">
                    <Tag color="green">
                      <span style={{ fontSize: '16px' }}>
                        Host Proteins: {this.state.hostp.toLocaleString()}
                      </span>
                    </Tag>
                    {!species2 && (
                      <Tag color="red">
                        <span style={{ fontSize: '16px' }}>
                          Pathogen Proteins: {this.state.pathogenp.toLocaleString()}
                        </span>
                      </Tag>
                    )}
                    {species2 && this.state.speciesCount[species] && (
                      <>
                        <Tag color="red">
                          <span style={{ fontSize: '16px' }}>
                            {speciesNameMapping[species]} Proteins: {this.state.speciesCount[species].toLocaleString()}
                          </span>
                        </Tag>
                        <Tag color="red">
                          <span style={{ fontSize: '16px' }}>
                            {speciesNameMapping[species2]} Proteins: {this.state.speciesCount[species2].toLocaleString()}
                          </span>
                        </Tag>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-2 text-end">
                <a
                  href={`${env.BASE_URL}/network`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    type="primary"
                    shape="round"
                    size="large"
                    icon={<DeploymentUnitOutlined />}
                    className="visualize-btn"
                  >
                    Visualize Network
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>


        <Table responsive className="kbl-table table-borderless">
          <thead className="kbl-thead">
            <tr>
              <th>Host Protein</th>
              <th>Gene Expression</th>
              <th>Pathogen</th>
              <th>Pathogen Protein</th>
              {(this.state.category === 'interolog' || this.state.category === 'consensus') && (
                <>
                  <th>Interolog A</th>
                  <th>Interolog B</th>
                  <th>Interolog Source</th>
                  <th>Interaction Method</th>
                  <th>Interaction Type</th>
                  <th>Interolog Score</th>
                  <th>Interolog PMID</th>
                </>
              )}
              {(this.state.category === 'domain' || this.state.category === 'consensus') && (
                <>
                  <th>Pfam A ID</th>
                  <th>Pfam B ID</th>
                  <th>Domain Source</th>
                  <th>Pfam A Name</th>
                  <th>Interpro A</th>
                  <th>Pfam B Name</th>
                  <th>Interpro B</th>
                  <th>Domain Score</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {this.state.isOpen && (
              <tr>
                <td colSpan={6}></td>
                <td >
                  <ReactLoading type={'spokes'} color={'#bff1de'} />
                </td>
              </tr>

            )}

            {this.state.List.map((result, index) => (
              <tr key={index + 1} className={result.selected ? "selected" : ""}>
                <td>
                  <a
                    href={`https://plants.ensembl.org/Multi/Search/Results?species=all;idx=;q=${result["Host_Protein"].split('.')[0]};site=ensemblunit`}
                    target="_blank"
                    rel="noreferrer"
                    className="host"
                  >
                    {result["Host_Protein"]}
                  </a>
                </td>

                <td>
                  <a
                    href={`http://wheat-expression.com/genes/show?gene_set=RefSeq1.1&name=${result["Host_Protein"].split(".")[0]}&search_by=gene`}
                    target="_blank"
                    rel="noreferrer"
                    className="button"
                  >
                    <Button type="primary" shape="round" size={'small'}>Wheat Expression Browser</Button>
                  </a>
                </td>

                <td>
                  {speciesNameMapping[result["species"]].content || result["species"]}
                </td>
                {(() => {
                  if (species === "pstr130") {
                    return (
                      <td>
                        <a
                          href={`http://fungi.ensembl.org/Multi/Search/Results?species=all;idx=;q=${result["Pathogen_Protein"]};site=ensemblunit`}
                          target="_blank"
                          rel="noreferrer"
                          className="pathogen"
                        >
                          {result["Pathogen_Protein"].replace("JGI_V11_", "")}
                        </a>
                      </td>
                    );
                  } else {
                    return (
                      <td>
                        <a
                          href={`http://fungi.ensembl.org/Multi/Search/Results?species=all;idx=;q=${result["Pathogen_Protein"]};site=ensemblunit`}
                          target="_blank"
                          rel="noreferrer"
                          className="pathogen"
                        >
                          {result["Pathogen_Protein"]}
                        </a>
                      </td>
                    );
                  }
                })()}

                {(this.state.category === 'interolog' || this.state.category === 'consensus') && (
                  <>
                    <td>
                      {(() => {
                        if (onlyNumbers(result['ProteinA'])) {
                          return (
                            <a
                              href={` https://www.ncbi.nlm.nih.gov/protein/${result["ProteinA"]}`}
                              target="_blank"
                              rel="noreferrer"
                              className="interactor"
                            >
                              {result["ProteinA"]}
                              {console.log(result["ProteinA"])}
                            </a>
                          )
                        }
                        else {
                          return (
                            <a
                              href={` https://www.uniprot.org/uniprot/${result["ProteinA"]}`}
                              target="_blank"
                              rel="noreferrer"
                              className="interactor"
                            >
                              {result["ProteinA"]}

                            </a>
                          )
                        }
                      })()}
                    </td>
                    <td>
                      {(() => {
                        if (onlyNumbers(result['ProteinB'])) {
                          return (
                            <a
                              href={` https://www.ncbi.nlm.nih.gov/protein/${result["ProteinB"]}`}
                              target="_blank"
                              rel="noreferrer"
                              className="interactor"
                            >
                              {result["ProteinB"]}

                            </a>
                          )
                        }
                        else {
                          return (
                            <a
                              href={` https://www.uniprot.org/uniprot/${result["ProteinB"]}`}
                              target="_blank"
                              rel="noreferrer"
                              className="interactor"
                            >
                              {result["ProteinB"]}
                            </a>
                          )
                        }
                      })()}
                    </td>
                    <td>{result["intdb_x"].toUpperCase()}</td>
                    <td>{result["Method"]}</td>
                    <td>{result["Type"]}</td>
                    <td>{result["Confidence"]}</td>
                    <td>
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${result["PMID"]}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {result["PMID"]}
                      </a>
                    </td>
                  </>
                )}

                {(this.state.category === 'domain' || this.state.category === 'consensus') && (
                  <>
                    <td>
                      {(() => {
                        return (
                          <a
                            href={`https://www.ebi.ac.uk/interpro/entry/pfam/${result["PfamA"]}`}
                            target="_blank"
                            rel="noreferrer"
                            className="interactor"
                          >
                            {result["PfamA"]}
                          </a>
                        )
                      })()}
                    </td>
                    <td>
                      {(() => {
                        return (
                          <a
                            href={`https://www.ebi.ac.uk/interpro/entry/pfam/${result["PfamB"]}`}
                            target="_blank"
                            rel="noreferrer"
                            className="interactor"
                          >
                            {result["PfamB"]}
                          </a>
                        )
                      })()}
                    </td>
                    <td>{result["intdb"]}</td>
                    <td>
                      <a
                        href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${result["DomainA_interpro"]}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {result["DomainA_interpro"]}
                      </a>
                    </td>
                    <td>{result["DomainB_name"]}</td>
                    <td>
                      <a
                        href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${result["DomainB_interpro"]}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {result["DomainB_interpro"]}
                      </a>
                    </td>
                    <td>{result["Score"]}</td>
                  </>
                )}
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
      </>)
    }
    else {
      results = (
        <>
          <h5> No interactions found using defined parameters. Modify the search parameters and try again. Thanks!</h5>
        </>
      )
    }

    return (
      <div className="container">
        {(this.state.category === 'interolog' || this.state.category === 'consensus') && (
          <>
            <div className="row align-items-center">
              <Divider>
                <span className="section-title">
                  Defined Parameters for {category.toUpperCase()} Model
                </span>
              </Divider>

              <div className="col-md-6 px-4">
                <div className="border p-2 rounded shadow-sm">
                  <h5 className="heading2"><b>Host</b></h5>
                  <p className="heading2">
                    <b>% Identity:</b> {pdata.hi} &nbsp; | &nbsp;
                    <b>% Coverage:</b> {pdata.hc} &nbsp; | &nbsp;
                    <b><i>e</i>-value:</b> {pdata.he}
                  </p>
                </div>
              </div>

              <div className="col-md-6 px-4 mt-3 mt-md-0">
                <div className="border p-2 rounded shadow-sm">
                  <h5 className="heading2"><b>Pathogen</b></h5>
                  <p className="heading2">
                    <b>% Identity:</b> {pdata.pi} &nbsp; | &nbsp;
                    <b>% Coverage:</b> {pdata.pc} &nbsp; | &nbsp;
                    <b><i>e</i>-value:</b> {pdata.pe}
                  </p>
                </div>
              </div>
            </div>

            {results}
          </>
        )}

        {(this.state.category === 'domain') && (
          <>
            <Divider>
              <span className="section-title">
                Defined Parameters for {category.toUpperCase()}-based Model
              </span>
            </Divider>

            <div className="results-container">
              <div className="results-header">
                <div className="row align-items-center g-3 py-3">
                  <div className="col-md-3">
                    {csvDownloader}
                  </div>

                  <div className="col-md-7">
                    <div className="results-summary">
                      <span className="results-count">
                        Showing <strong>{this.state.offset + 1}</strong> to <strong>{Math.min(this.state.offset + this.state.perPage, this.state.total)}</strong> of <strong>{this.state.total.toLocaleString()}</strong> interactions
                      </span>
                      <div className="protein-stats">
                        <Tag color="green">
                          <span style={{ fontSize: '16px' }}>
                            Host Proteins: {this.state.hostp.toLocaleString()}
                          </span>
                        </Tag>
                        {!species2 && (
                          <Tag color="red">
                            <span style={{ fontSize: '16px' }}>
                              Pathogen Proteins: {this.state.pathogenp.toLocaleString()}
                            </span>
                          </Tag>
                        )}
                        {species2 && this.state.speciesCount[species] && (
                          <>
                            <Tag color="red">
                              <span style={{ fontSize: '16px' }}>
                                {speciesNameMapping[species]} Proteins: {this.state.speciesCount[species].toLocaleString()}
                              </span>
                            </Tag>
                            <Tag color="red">
                              <span style={{ fontSize: '16px' }}>
                                {speciesNameMapping[species2]} Proteins: {this.state.speciesCount[species2].toLocaleString()}
                              </span>
                            </Tag>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2 text-end">
                    <a
                      href={`${env.BASE_URL}/network`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="primary"
                        shape="round"
                        size="large"
                        icon={<DeploymentUnitOutlined />}
                        className="visualize-btn"
                      >
                        Visualize Network
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>


            <Table responsive className="kbl-table table-borderless">
              <thead className="kbl-thead">
                <tr>
                  <th>Host Protein</th>
                  <th>Pathogen Protein</th>
                  <th>Pathogen</th>
                  <th>Interactor_A</th>
                  <th>Interactor_B</th>
                  <th>Interaction Source</th>
                  <th>Interactor_A Name</th>
                  <th>Interactor_A Interpro</th>
                  <th>Interactor_B Name</th>
                  <th>Interactor_B Interpro</th>
                  <th>Confidence Score</th>
                </tr>
              </thead>
              <tbody>
                {this.state.isOpen && (
                  <>
                    <tr>
                      <td colSpan={6}></td>
                      <td >
                        <ReactLoading type={'spokes'} color={'#bff1de'} />
                      </td>
                    </tr>
                  </>
                )}

                {this.state.dList.map((result, index) => (
                  <tr key={index + 1} className={result.selected ? "selected" : ""}>
                    <td>
                      <a
                        href={`https://plants.ensembl.org/Multi/Search/Results?species=all;idx=;q=${result["Host_Protein"].split('.')[0]};site=ensemblunit`}
                        target="_blank"
                        rel="noreferrer"
                        className="host"
                      >
                        {result["Host_Protein"]}
                      </a>
                    </td>
                    <td>
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/search/all/?term=${result["Pathogen_Protein"]}%09`}
                        target="_blank"
                        rel="noreferrer"
                        className="pathogen"
                      >
                        {result["Pathogen_Protein"]}
                      </a>
                    </td>
                    <td>
                      {speciesNameMapping[result["species"]].content || result["species"]}
                    </td>
                    <td>
                      {(() => {
                        return (
                          <a
                            href={`https://www.ebi.ac.uk/interpro/entry/pfam/${result["PfamA"]}`}
                            target="_blank"
                            rel="noreferrer"
                            className="interactor"
                          >
                            {result["PfamA"]}
                          </a>
                        )
                      })()}
                    </td>
                    <td>
                      {(() => {
                        return (
                          <a
                            href={`https://www.ebi.ac.uk/interpro/entry/pfam/${result["PfamB"]}`}
                            target="_blank"
                            rel="noreferrer"
                            className="interactor"
                          >
                            {result["PfamB"]}
                          </a>
                        )
                      })()}
                    </td>
                    <td>{result["intdb"]}</td>
                    <td>{result["DomainA_name"]}</td>
                    <td>
                      <a
                        href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${result["DomainA_interpro"]}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {result["DomainA_interpro"]}
                      </a>
                    </td>
                    <td>{result["DomainB_name"]}</td>
                    <td>
                      <a
                        href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${result["DomainB_interpro"]}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {result["DomainB_interpro"]}
                      </a>
                    </td>
                    <td>{result["score"]}</td>
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
          </>)}

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
