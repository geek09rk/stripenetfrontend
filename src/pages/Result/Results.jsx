import React from "react";
import {Table} from "react-bootstrap";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "./Results.scss";
import { Divider, Button, Badge } from "antd";
import { env } from '../../env';
import { downloadCsv } from "../../components/CSVDownload/CSVDownload";
import ReactLoading from 'react-loading';
import { DownloadOutlined, DeploymentUnitOutlined } from '@ant-design/icons';

const tdata = JSON.parse(localStorage.getItem("resultid"));
const pdata = JSON.parse(localStorage.getItem("param"));
console.log(pdata)

let category;
let species;
let genes;
let idt;
if (pdata){
  category = pdata.category
  species = pdata.species
  idt = pdata.ids
  if (category==='domain'){
    if (pdata.genes ===''){
      console.log("yes")
      genes = []
    }
    if (pdata.genes !==''){
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
      dList : [],
      MasterChecked: false,
      SelectedList: [],
      offset: 0,
      perPage: 25,
      currentPage: 0,
      pageCount: 20,
      hostp: 0,
      pathogenp: 0,
      dResult:[],
      isOpen:false,
      species:species,
      category:category,
      idt:idt,
      genes:genes,
      total:0,
    };
    this.handlePageClick = this.handlePageClick.bind(this);
    this.downloadResults = this.downloadResults.bind(this)
  }

  openModel = () => this.setState({ isOpen: true, dList:[]});
  closeModel = () => this.setState({ isOpen: false });

  fetchResults() {
    const postBody = {
      species:species,
      page:this.state.currentPage,
      size: this.state.perPage,
      genes: this.state.genes,
      idt: this.state.idt,
      intdb: pdata.domdb,
    }

    if (category === 'domain'){
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
        });
      });
    }
    else{
    axios
      .get(
        `${env.BACKEND}/api/results/?results=${tdata}&page=${this.state.currentPage}&size=${this.state.perPage}`
      )
      .then((res) => {
        const List = res.data.results;
        const dl = Math.ceil(res.data.total / this.state.perPage);

        this.setState({
          List,
          pageCount: dl,
          total: parseInt(res.data.total),
          hostp: res.data.hostcount,
          pathogenp: res.data.pathogencount,
        });
      });
    }
  }

  downloadResults(){
    if (category ==='domain'){
      axios
      .get(
        `${env.BACKEND}/api/domain_download/?species=${this.state.species}&intdb=${pdata.domdb}`
      )
      .then((res) => {
        const dResult = res.data.results 
        this.setState({dResult})
      })
    }
    else{
    axios
      .get(
        `${env.BACKEND}/api/download/?results=${tdata}`
      )
      .then((res) => {
        const dResult = res.data.results 
        this.setState({dResult})
      })
    }
  }

  componentDidMount() {
    this.fetchResults();
    this.downloadResults()
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

    // To Control Master Checkbox State
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
    if (tdata){
      localStorage.setItem("resultid", JSON.stringify(tdata))
    }
    if (this.state.dList.length > 1) {
      localStorage.setItem("data", JSON.stringify(this.state.dList))
    }

    const csvButton = (
      <Button type="primary" icon={<DownloadOutlined />} shape="round" size="large" className="download-btn" onClick={() => downloadCsv(this.state.dResult, this.state.category)}>
        Download CSV
      </Button>
    );

    if (this.state.List.length > 1) {
      results = ( <>
        <div className="results-container">
          <div className="results-header">
            <div className="row align-items-center g-3 py-3">
              <div className="col-md-2">
                {csvButton}
              </div>
              
              <div className="col-md-8">
                <div className="results-summary">
                  <span className="results-count">
                    Showing <strong>{this.state.offset + 1}</strong> to <strong>{this.state.offset + 25}</strong> of <strong>{this.state.total.toLocaleString()}</strong> interactions
                  </span>
                  <div className="protein-stats">
                    <Badge color="green" text={<span style={{ fontSize: '16px' }}>{`Host Proteins: ${this.state.hostp.toLocaleString()}`}</span>}  />
                    <Badge color="red" text={<span style={{ fontSize: '16px' }}>{`Pathogen Proteins: ${this.state.pathogenp.toLocaleString()}`}</span>}  />
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
          <th>Host</th>
          <th>Gene Expression</th>
          <th>Pathogen</th>
          <th>Interactor_A</th>
          <th>Interactor_B</th>
          <th>Interaction Source</th>
        {this.state.category ==='interolog' && (
          <>
          <th>Method</th>
          <th>Type</th>
          <th>Confidence Score</th>
          <th>PMID</th>
          </>
)}
        {this.state.category ==='domain' && (
          <>
          <th>Interactor_A Name</th>
          <th>Interactor_A Interpro</th>
          <th>Interactor_B Name</th>
          <th>Interactor_B Interpro</th>
          <th>Confidence Score</th>
          </>
)}
        </tr>
      </thead>
      <tbody>
        {this.state.isOpen && (
          <tr>
            <td colSpan={6}></td>
            <td >
            <ReactLoading type={'spokes'} color={'#bff1de'}/>
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
                <Button type="primary" shape="round"  size={'small'}>Wheat Expression Browser</Button>
              </a>
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
           
            <td>
            {console.log(result["ProteinA"])}
            {(() => {
              if (onlyNumbers(result['ProteinA'])){
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
                return(
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
              
              return null;
            })()}
            </td>

          <td>
            {(() => {
              if (onlyNumbers(result['ProteinB'])){
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
              else{
                return(
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
              return null;
            })()}
          </td>

        {this.state.category==='interolog' &&(
          <>
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

        {this.state.category==='domain' &&(
          <>
            <td>{result["intdb"]}</td>
            <td>{result["DomainA_name"]}</td>
            <td>{result["DomainA_interpro"]}</td>
            <td>{result["DomainB_name"]}</td>
            <td>{result["DomainB_interpro"]}</td>
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
       {this.state.category ==='interolog' && (
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

    {this.state.category ==='domain' && (
      <>

      <Divider>
        <span className="section-title">
          Defined Parameters for {category.toUpperCase()}-based Model
        </span>
      </Divider>
      
      <div className="results-container">
          <div className="results-header">
            <div className="row align-items-center g-3 py-3">
              <div className="col-md-2">
                {csvButton}
              </div>
              
              <div className="col-md-8">
                <div className="results-summary">
                  <span className="results-count">
                    Showing <strong>{this.state.offset + 1}</strong> to <strong>{this.state.offset + 25}</strong> of <strong>{this.state.total.toLocaleString()}</strong> interactions
                  </span>
                  <div className="protein-stats">
                    <Badge color="green" text={<span style={{ fontSize: '16px' }}>{`Host Proteins: ${this.state.hostp.toLocaleString()}`}</span>}  />
                    <Badge color="red" text={<span style={{ fontSize: '16px' }}>{`Pathogen Proteins: ${this.state.pathogenp.toLocaleString()}`}</span>}  />
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
          <th>Host</th>
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
            <ReactLoading type={'spokes'} color={'#bff1de'}/>
            </td>
          </tr>
          </>
        )}
        
        {this.state.dList.map((result, index) => (
          <tr key={index + 1} className={result.selected ? "selected" : ""}>
            <td>
              <input
                type="checkbox"
                checked={result.selected}
                className="form-check-input"
                id={result._id}
                onChange={(e) => this.onItemCheck(e, result)}
              />
            </td>

            <td>
              <a
                href={` https://www.uniprot.org/uniprot/${result["Host_Protein"]}`}
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
              <a
                href={` https://www.ebi.ac.uk/interpro/entry/pfam/${result["ProteinA"]}`}
                target="_blank"
                rel="noreferrer"
                className="interactor"
                >
                {result["ProteinA"]}
              </a>
              </td>
              <td>
                <a
                  href={` https://www.ebi.ac.uk/interpro/entry/pfam/${result["ProteinB"]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="interactor"
                  >
                  {result["ProteinB"]}
                </a>
              </td>
            <td>{result["intdb"]}</td>
            <td>{result["DomianA_name"]}</td>
            <td>
              <a
                href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${result["DomianA_interpro"]}`}
                target="_blank"
                rel="noreferrer"
                >
                {result["DomianA_interpro"]}
              </a>
            </td>
            <td>{result["DomianB_name"]}</td>
            <td>
              <a
                href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${result["DomianB_interpro"]}`}
                target="_blank"
                rel="noreferrer"
                >
                {result["DomianB_interpro"]}
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
