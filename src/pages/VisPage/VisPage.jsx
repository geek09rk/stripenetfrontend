import React, { Component } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import './VisPage.scss';
import { Visualization } from '../../components/Visualization/Visualization';
import { VisTable } from '../../components/VisTable/VisTable';
import { NodeMenu } from '../../components/NodeMenu/NodeMenu';
import { EdgeMenu } from '../../components/EdgeMenu/EdgeMenu';
import { Divider } from "antd";

export default class VisPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedBar: 'table',
      currentNodeData: {},
      currentEdgeData: {},
      searchTerm: '',
      infoType: ''
    };

    this.handleNodeClicked = this.handleNodeClicked.bind(this);
    this.setSearchTerm = this.setSearchTerm.bind(this);
    this.handleEdgeClicked = this.handleEdgeClicked.bind(this);
  }

  handleBarSwitch(newMenu) {
    this.setState({selectedBar: newMenu});
  }

  setSearchTerm(term) {
    this.setState({searchTerm: term});
  }

  handleNodeClicked(e) {
   
    this.setState({infoType: 'Node '});
    const data = e.target.data()
    
    console.log(data);
    let nodeType = data.species;
    let itemName = data.id;
    let itemDegree = e.target.degree()
    let parsedData = {
      nodeType: nodeType,
      name: itemName,
      degree: itemDegree
    }
    this.setState({currentNodeData: parsedData}, () => {
      this.handleBarSwitch('info');
    });
  }

  handleTableRowClicked(data) {
  }

  handleEdgeClicked(data) {
    this.setState({infoType: 'Edge '});
    this.setState({currentEdgeData: data}, () => {
      this.handleBarSwitch('info');
    });
  }

  render() {
    let tableClass = '';
    let nodeClass = '';

    if (this.state.selectedBar === 'table') {
      tableClass = 'selected';
    } else {
      nodeClass = 'selected';
    }

    let menuComponent;

    if (this.state.selectedBar === 'table') {
      menuComponent = <VisTable handleSearchChange={this.setSearchTerm} tableRowClicked={this.handleEdgeClicked} />
    } else {
      if (this.state.infoType.trim().toLowerCase() === 'node') {
        menuComponent = <NodeMenu nodeData={this.state.currentNodeData} />
      } else if (this.state.infoType.trim().toLowerCase() === 'edge') {
        menuComponent = <EdgeMenu edgeData={this.state.currentEdgeData} />
      } else {
        menuComponent = (<div>Select a node or edge to view information.</div>)
      }
    }

    return (
        <div className="container">
      <Row className='mt-4'>
        <Col sm={7}>
          <Visualization edgeHandler={this.handleEdgeClicked} nodeHandler={this.handleNodeClicked} searchTerm={this.state.searchTerm} />
        </Col>
        <Col sm={5}>
          <div className="bar-selector mb-3">
            <span className={`${tableClass} mr-3`} onClick={() => this.handleBarSwitch('table')}> Interaction Table </span>
            <span className={nodeClass}  onClick={() => this.handleBarSwitch('info')}>{this.state.infoType} Info </span>
          </div>
          {menuComponent}
        </Col>
      </Row>

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