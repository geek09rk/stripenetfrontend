import React, { Component } from 'react';
import './EdgeMenu.scss';
import { FaExternalLinkAlt } from 'react-icons/fa';

export class EdgeMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    if (Object.keys(this.props.edgeData).length === 0) {
      return (<div>No edge selected</div>);
    }
    console.log(this.props);

    let ensemblPlants = `https://plants.ensembl.org/Multi/Search/Results?species=all;idx=;q=${this.props.edgeData.source};site=ensemblunit}`;
    let ensemblFungi = `https://fungi.ensembl.org/Multi/Search/Results?species=all;idx=;q=${this.props.edgeData.target};site=ensemblunit}`;
    let intType = this.props.edgeData.id.split('-')[0];
    
    return (
      <div>
        <div className="edge-menu-container text-left px-3 pt-2 pb-4">
          <h5 className="edge-type"><u><b>Selected interaction pair</b></u></h5>
          
          <h5 className="edge-name">
            <a href={ensemblPlants} className="link" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px' }}>
              {this.props.edgeData.source}
              <FaExternalLinkAlt style={{ marginLeft: '5px', fontSize: '0.8em' }} />
            </a>
            &nbsp;|&nbsp;
            <a href={ensemblFungi} className="link" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px' }}>
              {this.props.edgeData.target}
              <FaExternalLinkAlt style={{ marginLeft: '5px', fontSize: '0.8em' }} />
            </a>
          </h5>
          
          <br />
          
          <h5 className="int-type">
            <span className="edge-int" style={{ fontSize: '20px' }}>Interaction source: </span>
            <span className="edge-int-type" style={{ fontSize: '20px' }}>{intType}</span>
          </h5>
        </div>
      </div>
      
    );
  }
}