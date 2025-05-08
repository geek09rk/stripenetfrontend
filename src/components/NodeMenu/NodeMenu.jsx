import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './NodeMenu.scss';
import { FaExternalLinkAlt } from 'react-icons/fa';

const speciesNameMapping = {
  taestivum: <span>Wheat Protein</span>, // Not strictly needed for legend but good practice
  pstrs: <span><i>P. striiformis Protein</i></span>,
  pstr78s: <span><i>P. striiformis</i> strain 78 Protein</span>,
  pstr130s: <span><i>P. striiformis</i> strain 130 Protein</span>,
};

export class NodeMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    if (Object.keys(this.props.nodeData).length === 0) {
      return (<div>No node selected</div>);
    }
    console.log(speciesNameMapping);
    console.log(this.props.nodeData);
    const type = speciesNameMapping[this.props.nodeData.nodeType];
    const ensemblPlants = `https://plants.ensembl.org/Multi/Search/Results?species=all;idx=;q=${this.props.nodeData.name};site=ensemblunit}`;
    const ensemblFungi = `https://fungi.ensembl.org/Multi/Search/Results?species=all;idx=;q=${this.props.nodeData.name};site=ensemblunit}`;

    return (
      <div>
        <div className="node-menu-container text-left px-3 pt-2 pb-4">
          <h6 className="node-type">{type}</h6>
          <h4 className="node-name"><b>{this.props.nodeData.name}</b></h4>
          <h5 className="no-name">Degree: {this.props.nodeData.degree}</h5>
          <Row>
            <Col>
              {this.props.nodeData.nodeType !== 'taestivum' ? (
                <a href={ensemblFungi} className="link" target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px' }}>
                  Ensembl Fungi <FaExternalLinkAlt style={{ marginLeft: '5px', fontSize: '0.8em' }} />
                </a>
              ) : (
                <a href={ensemblPlants} className="link" target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px' }}>
                  Ensembl Plants <FaExternalLinkAlt style={{ marginLeft: '5px', fontSize: '0.8em' }} />
                </a>
              )}
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
