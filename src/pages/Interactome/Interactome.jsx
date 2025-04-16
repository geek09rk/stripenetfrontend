import React from "react";
import { Divider, Radio, Checkbox, Button, Card, Row, Col, Typography, Select, Input, Tooltip, Spin } from "antd";
import { InfoCircleOutlined, ArrowRightOutlined, DatabaseOutlined, FilterOutlined, DeploymentUnitOutlined, FileTextOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import "./Interactome.scss";
import axios from "axios";
import { env } from "../../env";
import { Modal } from "react-bootstrap";
import FileInput from '../../components/FileInput/FileInput';

const CheckboxGroup = Checkbox.Group;
const domainOptions = ["3DID", "IDDI", "DOMINE"];
const interologCheckedList = ["HPIDB", "MINT"];
const domainCheckedList = ["3DID", "IDDI"];
const interologOptions = [
  "HPIDB",
  "DIP",
  "MINT",
  "BioGRID",
  "IntAct",
  "ArabiHPI",
];

export default class Interactome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      interactomeType: "interactome",
      searchType: "proteome",
      idType:'host',
      ostype: "unique",
      checkedList: interologCheckedList,
      dcheckedList: domainCheckedList,
      checkAll: false,
      dcheckAll: false,
      status: "interolog",
      species: "pstrs",
      identity: 50,
      coverage: 50,
      evalue: 1e-05,
      pidentity: 50,
      pcoverage: 50,
      pevalue: 1e-05,
      resultid: "",
      isOpen: false,
      ppiOpen: false,
      genes: '',
      geneHintOn:false,
    };
    this.radioHandler = this.radioHandler.bind(this);
    this.speciesHandler = this.speciesHandler.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCheckAllChange = this.onCheckAllChange.bind(this);
    this.onChange2 = this.onChange2.bind(this);
    this.onCheckAllChange2 = this.onCheckAllChange2.bind(this);
    this.identityHandler = this.identityHandler.bind(this);
    this.coverageHandler = this.coverageHandler.bind(this);
    this.evalueHandler = this.evalueHandler.bind(this);
    this.pidentityHandler = this.pidentityHandler.bind(this);
    this.pcoverageHandler = this.pcoverageHandler.bind(this);
    this.pevalueHandler = this.pevalueHandler.bind(this);
    this.interactomeHandler = this.interactomeHandler.bind(this);
    this.intHandler = this.intHandler.bind(this);
    this.fileSelected = this.fileSelected.bind(this);
    this.handleGeneChange=this.handleGeneChange.bind(this);
    this.getInteractions = this.getInteractions.bind(this);
    this.setGeneHint = this.setGeneHint.bind(this);
    this.idHandler = this.idHandler.bind(this);
    this.accessionHandler = this.accessionHandler.bind(this);
  }

  radioHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({
      status: value,
    });
  }

  speciesHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ species: value });
    console.log(value);
  };

  idHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ searchType: value });
  }

  accessionHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ idType: value });
  }

  identityHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ identity: value });
  }

  coverageHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ coverage: value });
  }

  evalueHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ evalue: value });
  }

  pidentityHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ pidentity: value });
  }

  pcoverageHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ pcoverage: value });
  }

  pevalueHandler = (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    this.setState({ pevalue: value });
  }

  onChange(list) {
    this.setState({
      checkedList: list,
      checkAll: list.length === interologOptions.length,
    });
  }

  onChange2(list) {
    this.setState({
      dcheckedList: list,
      dcheckAll: list.length === domainOptions.length,
    });
  }

  onCheckAllChange(e) {
    this.setState({
      checkedList: e.target.checked ? interologOptions : [],
      checkAll: e.target.checked,
    });
  }
  
  onCheckAllChange2(e) {
    this.setState({
      dcheckedList: e.target.checked ? domainOptions : [],
      dcheckAll: e.target.checked,
    });
  }

  openModel = () => this.setState({ isOpen: true });
  closeModel = () => this.setState({ isOpen: false });

  ppiModalopen = () => this.setState({ ppiOpen: true });
  ppiModalclose = () => this.setState({ ppiOpen: false });

  interactomeHandler(e) {
    this.setState({ interactomeType: e.target.value });
  }

  intHandler(e) {
    this.setState({ ostype: e.target.value });
  }

  fileSelected(fileText) {
    const protein = fileText.trim().split("\n");
    this.setState({genes: protein});
  }
  
  handleGeneChange(e) {
    this.setState({ genes: e.target.value });
  }

  setGeneHint(hint) {
    this.setState({geneHintOn: hint});
  }
  
  getInteractions() {
    this.openModel();

    const intdb = this.state.checkedList.map((element) => {
      return element.toLowerCase();
    });
    const intdbd = intdb.toString()
    console.log(intdbd)

    const domdb = this.state.dcheckedList.map((element) => {
      return element;
      // .toLowerCase();
    });
  
    let hspecies = "interolog_taestivums"
    let pspecies = "interolog_"+this.state.species
    let postBody = {
      category: this.state.status,
      hspecies: hspecies,
      pspecies: pspecies,
      ids: this.state.idType,
      genes:this.state.genes,
      stype:this.state.searchType,
      hi: this.state.identity,
      hc: this.state.coverage,
      he: this.state.evalue,
      pi: this.state.pidentity,
      pc: this.state.pcoverage,
      pe: this.state.pevalue,
      intdb: intdbd,
      domdb: domdb,
    };
    
    console.log(postBody)
    
    if (this.state.status === 'domain'){
      window.location.replace(`${env.BASE_URL}/results`);
    }
    else{
      axios
        .post(
          `${env.BACKEND}/api/ppi/`,
          postBody
        )
        .then((res) => {
          const rid = res.data;
          console.log(rid);
          this.setState({ resultid: rid });
          this.closeModel();
          window.location.replace(`results`);
        })
        .catch((err) => {
          console.log(err);
          this.closeModel();
        });
    }
  }

  render() {
    localStorage.setItem(
      "param",
      JSON.stringify({
        he: this.state.evalue,
        hi: this.state.identity,
        hc: this.state.coverage,
        pe: this.state.pevalue,
        pi: this.state.pidentity,
        pc: this.state.pcoverage,
        resultid: this.state.resultid,
        category: this.state.status,
        species: this.state.species,
        domdb: this.state.dcheckedList,
        ids: this.state.idType,
        genes: this.state.genes,
      })
    );
    
    let genePlaceholder = 'Example (Ensembl IDs): TraesCS6A02G321200.1, TraesCS5A02G133000.1, TraesCS5D02G141200.1, TraesCS5A02G177100.1';
    let geneSample = 'TraesCS6A02G321200.1, TraesCS5A02G133000.1, TraesCS5D02G141200.1, TraesCS5A02G177100.1';

    if (this.state.idType === 'pathogen') {
      genePlaceholder = 'Example (Ensembl IDs): POW03357, KNE94478, KNF05665, JGI_V11_PST130_P498769';
      geneSample = 'POW03357, POW18015, POV93884';
    }
    
    // const { Title, Paragraph, Text } = Typography;
    const { Title, Text } = Typography;
    const { TextArea } = Input;
    
    return (
      <div className="interactome-container">
        {localStorage.setItem("resultid", JSON.stringify(this.state.resultid))}
        
        <Card className="header-card">
          <Title level={2} className="page-title">
            <DeploymentUnitOutlined className="title-icon" /> 
            Host-Pathogen Protein-Protein Interactions Inference
          </Title>
        </Card>

        <Modal show={this.state.ppiOpen} onHide={this.ppiModalclose}>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Title>
            <h5 className="my-2 text-center"><b>About Standard PPI Databases</b></h5>
          </Modal.Title>
          <Modal.Body>
            <p className="info">
              The International Molecular Exchange Consortium
              (<a target="_blank" rel="noreferrer" href="https://www.imexconsortium.org">IMEX</a>)
              is an international collaboration between a group of major public 
              interaction data providers. We selected five PPI databases (HPIDB, MINT, DIP,
              BioGRID and IntAct), as these are most comprehensive for protein
              interaction studies. The interaction data from these databases was extensively 
              filtered for "plant-pathogen" interactions to obtain high-confidence interactions.
            </p>

            <hr></hr>

            <p className="info">
              <strong>Summary of the standard interactions databases</strong>
            </p>

            <p className="info">
              <a target="_blank" rel="noreferrer" href="http://hpidb.igbb.msstate.edu/">HPIDB</a> have 370 sequences with 458 interactions.
            </p>
            <p className="info">
              <a target="_blank" rel="noreferrer" href="https://mint.bio.uniroma2.it/">MINT</a> have 33 sequences with 62 interactions.
            </p>

            <p className="info">
              <a target="_blank" rel="noreferrer" href="http://dip.mbi.ucla.edu/dip/">DIP</a> have 81 sequences with 102 interactions.
            </p>

            <p className="info">
              <a target="_blank" rel="noreferrer" href="https://thebiogrid.org/">BioGRID</a> have 98 sequences with 147 interactions.
            </p>

            <p className="info">
              <a target="_blank" rel="noreferrer" href="https://www.ebi.ac.uk/intact/">IntAct</a> have 842 sequences with 973 interactions.
            </p>

            <p className="info">
              <a target="_blank" rel="noreferrer" href="http://www.phi-base.org/">ArabiHPI</a> have 6,776 sequences with 15,849 interactions.
            </p>

          </Modal.Body>
          <Modal.Footer>
            <Button type="primary" danger onClick={this.ppiModalclose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Card className="main-card">
          <div className="section-container">
            <Title level={4} className="section-title">
              <DatabaseOutlined className="section-icon" /> Basic Configuration
            </Title>
            
            <Row gutter={[24, 24]} className="config-row">
              <Col xs={24} md={8}>
                <Card className="option-card" title="Pathogen Strain" headStyle={{ fontSize: '18px' }}>
                  <Select 
                    className="full-width"
                    value={this.state.species} 
                    onChange={this.speciesHandler}
                    style={{ minWidth: 200 }}
                    options={[
                      { value: 'pstrs', label: <span style={{ fontSize: '16px' }}><i>P. striiformis</i></span> },
                      { value: 'pstr78s', label: <span style={{ fontSize: '16px' }}><i>P. striiformis</i> strain 78</span> },
                      { value: 'pstr130s', label: <span style={{ fontSize: '16px' }}><i>P. striiformis</i> strain 130</span> },
                    ]}
                  />
                </Card>
              </Col>
              
              <Col xs={20} md={8}>
                <Card className="option-card" title="Computational Model" headStyle={{ fontSize: '18px' }}>
                  <Radio.Group 
                    name="radiogroup" 
                    defaultValue={"interolog"}
                    className="radio-group"
                    onChange={this.radioHandler}
                  >
                    <Radio value="interolog" style={{ fontSize: '16px' }}>Interolog mapping</Radio>
                    <Radio value="domain" style={{ fontSize: '16px' }}>Domain-based</Radio>
                    <Radio value="consensus" style={{ fontSize: '16px' }}>Consensus</Radio>
                  </Radio.Group>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card className="option-card" title="Search Type" headStyle={{ fontSize: '18px' }}>
                  <Radio.Group 
                    name="radiogroup" 
                    defaultValue={"proteome"}
                    className="radio-group"
                    onChange={this.idHandler}
                  >
                    <Radio value="proteome" style={{ fontSize: '16px' }}>Whole Proteome</Radio>
                    <Radio value="accession" style={{ fontSize: '16px' }}>Provide Accession(s)</Radio>
                  </Radio.Group>
                </Card>
              </Col>
            </Row>
          </div>

          {this.state.searchType === 'accession' && (
            <div className="section-container">
              <Title level={4} className="section-title">
                <FileTextOutlined className="section-icon" /> Protein Accession(s)
              </Title>
              
              <Row gutter={[24, 24]} className="config-row">
                <Col xs={24} md={6}>
                  <Card className="option-card" title="ID Type" headStyle={{ fontSize: '18px' }}>
                    <Radio.Group 
                      name="radiogroup" 
                      defaultValue={"host"}
                      className="radio-group"
                      onChange={this.accessionHandler}
                    >
                      <Radio value="host" style={{ fontSize: '16px' }}>Host</Radio>
                      <Radio value="pathogen" style={{ fontSize: '16px' }}>Pathogen</Radio>
                    </Radio.Group>
                  </Card>
                </Col>
                
                <Col xs={24} md={18}>
                  <Card className="option-card" title="Enter Protein ID(s)" headStyle={{ fontSize: '18px' }}>
                    <TextArea 
                      className="protein-textarea" 
                      rows={4} 
                      placeholder={genePlaceholder} 
                      onChange={this.handleGeneChange}
                      value={this.state.genes} 
                      onMouseEnter={() => this.setGeneHint(true)} 
                      onMouseLeave={() => this.setGeneHint(false)} 
                      spellCheck={false}
                    />
                    
                    <div className="button-group">
                      <Button 
                        type="default" 
                        onClick={e => { this.setState({genes: geneSample}) }}
                      >
                        Sample Data
                      </Button>
                      <Button 
                        danger 
                        onClick={e => { this.setState({genes: ""}) }}
                      >
                        Clear Data
                      </Button>
                      
                      <Divider type="vertical" />
                      
                      <Tooltip title="Upload a file with protein IDs">
                        <span className="upload-container">
                          <FileInput handler={this.fileSelected} />
                        </span>
                      </Tooltip>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {this.state.status === "interolog" && (
            <div className="section-container">
              <Title level={4} className="section-title">
                <DatabaseOutlined className="section-icon" /> Interolog Databases
              </Title>
              
              <Card className="option-card">
                <div className="card-header">
                  <span className="card-title">Select Interolog Database(s)</span>
                  <Tooltip title="Click for more information about PPI databases">
                    <InfoCircleOutlined onClick={this.ppiModalopen} className="info-icon" />
                  </Tooltip>
                </div>

                <div className="checkbox-container">
                  <CheckboxGroup
                    options={interologOptions}
                    value={this.state.checkedList}
                    onChange={this.onChange}
                    className="checkbox-group"
                  />
                </div>

                <div className="check-all-container">
                  <Checkbox
                    onChange={this.onCheckAllChange}
                    checked={this.state.checkAll}
                    className="check-all"
                  >
                    Select All
                  </Checkbox>
                </div>
              </Card>
              
              <Title level={4} className="section-title mt-4">
                <FilterOutlined className="section-icon" /> Filtering Options
              </Title>
              
              <Row gutter={[24, 24]} className="config-row">
                <Col xs={24} md={12}>
                  <Card className="option-card" title="Host Alignments" headStyle={{ fontSize: '18px' }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Identity</label>
                          <Input
                            onChange={this.identityHandler}
                            placeholder={this.state.identity}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Coverage</label>
                          <Input
                            onChange={this.coverageHandler}
                            placeholder={this.state.coverage}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label><i>e</i>-value</label>
                          <Input
                            onChange={this.evalueHandler}
                            placeholder={this.state.evalue}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card className="option-card" title="Pathogen Alignments" headStyle={{ fontSize: '18px' }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Identity</label>
                          <Input
                            onChange={this.pidentityHandler}
                            placeholder={this.state.pidentity}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Coverage</label>
                          <Input
                            onChange={this.pcoverageHandler}
                            placeholder={this.state.pcoverage}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label><i>e</i>-value</label>
                          <Input
                            onChange={this.pevalueHandler}
                            placeholder={this.state.pevalue}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {this.state.status === "domain" && (
            <div className="section-container">
              <Title level={4} className="section-title">
                <DatabaseOutlined className="section-icon" /> Domain Databases
              </Title>
              
              <Card className="option-card">
                <div className="card-header">
                  <span className="card-title">Select Domain Database(s)</span>
                </div>
                
                <div className="checkbox-container">
                  <CheckboxGroup
                    options={domainOptions}
                    value={this.state.dcheckedList}
                    onChange={this.onChange2}
                    className="checkbox-group"
                  />
                </div>
                
                <div className="check-all-container">
                  <Checkbox
                    onChange={this.onCheckAllChange2}
                    checked={this.state.dcheckAll}
                    className="check-all"
                  >
                    Check all
                  </Checkbox>
                </div>
              </Card>

            </div>
          )}

          {this.state.status === "consensus" && (
            <div className="section-container">
              <Title level={4} className="section-title">
                <DatabaseOutlined className="section-icon" /> Database Selection
              </Title>
              
              <Row gutter={[24, 24]} className="config-row">
                <Col xs={24} md={12}>
                  <Card className="option-card" title="Interolog Databases" headStyle={{ fontSize: '18px' }}>
                    <div className="checkbox-container">
                      <CheckboxGroup
                        options={interologOptions}
                        value={this.state.checkedList}
                        onChange={this.onChange}
                        className="checkbox-group"
                      />
                    </div>
                    
                    <div className="check-all-container">
                      <Checkbox
                        onChange={this.onCheckAllChange}
                        checked={this.state.checkAll}
                        className="check-all"
                      >
                        Select all
                      </Checkbox>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card className="option-card" title="Domain Databases" headStyle={{ fontSize: '18px' }}>
                    <div className="checkbox-container">
                      <CheckboxGroup
                        options={domainOptions}
                        value={this.state.dcheckedList}
                        onChange={this.onChange2}
                        className="checkbox-group"
                      />
                    </div>

                    <div className="check-all-container">
                      <Checkbox
                        onChange={this.onCheckAllChange2}
                        checked={this.state.dcheckAll}
                        className="check-all"
                      >
                        Select all
                      </Checkbox>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              <Title level={4} className="section-title mt-4">
                <FilterOutlined className="section-icon" /> Filtering Options
              </Title>
              
              <Row gutter={[24, 24]} className="config-row">
                <Col xs={24} md={12}>
                  <Card className="option-card" title="Host Alignment" headStyle={{ fontSize: '18px' }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Identity</label>
                          <Input
                            onChange={this.identityHandler}
                            placeholder={this.state.identity}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Coverage</label>
                          <Input
                            onChange={this.coverageHandler}
                            placeholder={this.state.coverage}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label><i>e</i>-value</label>
                          <Input
                            onChange={this.evalueHandler}
                            placeholder={this.state.evalue}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card className="option-card" title="Pathogen Alignment" headStyle={{ fontSize: '18px' }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Identity</label>
                          <Input
                            onChange={this.pidentityHandler}
                            placeholder={this.state.pidentity}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label>% Coverage</label>
                          <Input
                            onChange={this.pcoverageHandler}
                            placeholder={this.state.pcoverage}
                          />
                        </div>
                      </Col>
                      
                      <Col span={8}>
                        <div className="form-item">
                          <label><i>e</i>-value</label>
                          <Input
                            onChange={this.pevalueHandler}
                            placeholder={this.state.pevalue}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          <div className="action-container">
            {this.state.isOpen ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text className="loading-text">Your query is being processed...</Text>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={this.getInteractions}
                className="submit-button"
              >
                Results
              </Button>
            )}
          </div>
        </Card>

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
